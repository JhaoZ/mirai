"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CardType } from "../kanban/dataObject"; // Adjust the import path accordingly

// Define a type for commit data
type Commit = {
  hash: string;
  message: string;
  url: string;
};

export default function CardDetails() {
  const searchParams = useSearchParams();
  const [commits, setCommits] = useState<Commit[]>([]);
  const [showCommits, setShowCommits] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const card: CardType = {
    ticket_num: searchParams.get("ticket_num") || "",
    category: searchParams.get("category") || "",
    description: searchParams.get("description") || "",
    deadline: searchParams.get("deadline") || "",
    priority: parseInt(searchParams.get("priority") || "0", 10),
    dev_type: searchParams.get("dev_type") || "",
    title: searchParams.get("title") || "",
    assignments: searchParams.get("assignments")
      ? searchParams.get("assignments")!.split(",")
      : [],
  };

  const fetchCommits = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5000/get_ticket_github_detail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Sending a JSON body in a GET request is unconventional,
        // but we're using it per your provided endpoint.
        body: JSON.stringify({
          ticket_num: card.ticket_num,
          limit: 5,
        }),
      });
      const data = await res.json();
      if (data.Error) {
        setError(data.Error);
      } else if (data.Success) {
        // The endpoint returns commit_list as a JSON string, so we need to parse it.
        const commitList: Commit[] = JSON.parse(data.Success);
        setCommits(commitList);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch commits");
    }
    setLoading(false);
    setShowCommits(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          border: "1px solid #48bb78", // roughly Tailwind's green-500
        }}
        className="max-w-md w-full rounded-3xl shadow-2xl p-8 transform transition duration-500 hover:scale-105"
      >
        <h1
          style={{ color: "#68d391", fontWeight: 800 }}
          className="text-4xl mb-6 tracking-wide"
        >
          {card.title}
        </h1>
        <div className="space-y-4 text-lg">
          <p className="text-white">
            <span className="font-bold text-green-300">Ticket Number:</span>{" "}
            {card.ticket_num}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Category:</span>{" "}
            {card.category}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Description:</span>{" "}
            {card.description}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Deadline:</span>{" "}
            {card.deadline}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Priority:</span>{" "}
            {card.priority}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Developer Type:</span>{" "}
            {card.dev_type}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Assignments:</span>{" "}
            {card.assignments.length > 0 ? card.assignments.join(", ") : "None"}
          </p>
        </div>
        <button
          onClick={fetchCommits}
          className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Examine Git Commits
        </button>
        {showCommits && (
          <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-green-300">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Commit Messages
            </h2>
            {loading && <p className="text-white">Loading commits...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {!loading && !error && commits.length > 0 && (
              <ul className="list-disc list-inside text-white">
                {commits.map((commit, index) => (
                  <li key={index}>
                    <a
                      href={commit.url}
                      className="text-green-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {commit.hash.slice(0, 7)}
                    </a>
                    {": " + commit.message}
                  </li>
                ))}
              </ul>
            )}
            {!loading && !error && commits.length === 0 && (
              <p className="text-white">No commits found for this ticket.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
