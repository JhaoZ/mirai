"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { CardType } from "../kanban/dataObject"; // Adjust the import path accordingly

export default function CardDetails() {
  const searchParams = useSearchParams();

  // Parse card data with correct types
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-black/80 rounded-3xl shadow-2xl border border-green-500 p-8 transform transition duration-500 hover:scale-105">
        <h1 className="text-4xl font-extrabold text-green-400 mb-6 tracking-wide">
          {card.title}
        </h1>
        <div className="space-y-4 text-lg">
          <p className="text-white">
            <span className="font-bold text-green-300">Ticket Number:</span> {card.ticket_num}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Category:</span> {card.category}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Description:</span> {card.description}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Deadline:</span> {card.deadline}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Priority:</span> {card.priority}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Developer Type:</span> {card.dev_type}
          </p>
          <p className="text-white">
            <span className="font-bold text-green-300">Assignments:</span> {card.assignments.length > 0 ? card.assignments.join(", ") : "None"}
          </p>
        </div>
      </div>
    </div>
  );
}
