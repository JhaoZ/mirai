"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Github_Link: "",
    Github_Token: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response1 = await fetch ("http://127.0.0.1:5000/init_project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(""),
    });

      if (response1.ok) {
        console.log ("worked");
      }
      else {
        router.push("/");
        console.log("try again, did not work!");
      } 

      const response2 = await fetch("http://127.0.0.1:5000/init_project_details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });      
      if (response2.ok) {
        console.log("init project details worked")
        router.push("/members"); // Redirect to members
      } else {
        console.error("Failed to initialize project");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-gray-900 text-white">
      <h1 className="text-4xl font-extrabold tracking-wide text-green-400">Welcome to mirAI</h1>
      <img 
                                src="/Sprite-0011.png" 
                                alt="Kanban Board Logo" 
                                className="h-20 w-auto"
                            />
      <p className="text-gray-400">AI-powered project management for developers</p>

      {/* Start Project Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-green-500 text-black font-bold rounded-full shadow-lg transition-all duration-300 
                   hover:bg-green-400 hover:scale-105 active:scale-95"
      >
        🚀 Start New Project
      </button>
      <div className = "text-black">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="Title"
                placeholder="Project Title"
                value={formData.Title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded"
              />
              <textarea
                name="Description"
                placeholder="Project Description"
                value={formData.Description}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="url"
                name="Github_Link"
                placeholder="GitHub Repository URL"
                value={formData.Github_Link}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="password"
                name="Github_Token"
                placeholder="GitHub Token"
                value={formData.Github_Token}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
    </div>
  );
}
