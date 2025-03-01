"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function MembersPage() {
  const router = useRouter();
  const [member, setMember] = useState({
    Name: "",
    Age: "",
    Working_Description: "",
    Title: "",
    Years_of_Experience: "",
    Id: "",
  });

  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message

    if (!member.Name || !member.Age || !member.Working_Description || !member.Title || !member.Years_of_Experience || !member.Id) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/add_member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(member),
      });

      console.log(JSON.stringify(member));
      if (response.ok) {
        setMembers([...members, member]); // Add member to list
        setMember({
          Name: "",
          Age: "",
          Working_Description: "",
          Title: "",
          Years_of_Experience: "",
          Id: "",
        }); // Reset form
      } else {
        setError("Failed to add member.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while adding the member.");
    }
  };

  const handleConfirm = async () => {
    if (members.length === 0) {
      alert("You must add at least one member before proceeding.");
      return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/start_project", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(""),
        });
        if (response.ok) {
            router.push("/kanban"); // Redirect to Kanban board
        }
    } catch (error) {
        console.error("Error:", error);
    } 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">Add Team Members</h1>

      <form onSubmit={handleAddMember} className="space-y-4 w-96">
        <input
          type="text"
          name="Name"
          placeholder="Full Name"
          value={member.Name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="number"
          name="Age"
          placeholder="Age"
          value={member.Age}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <textarea
          name="Working_Description"
          placeholder="Working Description"
          value={member.Working_Description}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          name="Title"
          placeholder="Job Title"
          value={member.Title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="number"
          name="Years_of_Experience"
          placeholder="Years of Experience"
          value={member.Years_of_Experience}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          name="Id"
          placeholder="Unique ID"
          value={member.Id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Member
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg text-white ${
              members.length > 0 ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={members.length === 0}
          >
            Confirm Members
          </button>
        </div>
      </form>

      {/* Show Added Members */}
      {members.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Current Team Members</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {members.map((m, index) => (
              <Card key={index} className="p-4 shadow-lg rounded-xl">
                <CardContent>
                  <h3 className="text-lg font-medium">{m.Name}</h3>
                  <p className="text-sm text-gray-600">{m.Title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
