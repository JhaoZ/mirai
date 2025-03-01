"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { CardType } from "./dataObject"; // Adjust the import path accordingly

export default function CardDetails() {
    const searchParams = useSearchParams();
    
    // Parse card data with correct types
    const card: CardType = {
        ticket_num: searchParams.get("ticket_num") || "",
        category: searchParams.get("category") || "",
        description: searchParams.get("description") || "",
        deadline: searchParams.get("deadline") || "",
        priority: parseInt(searchParams.get("priority") || "0", 10),  // Ensure priority is a number
        dev_type: searchParams.get("dev_type") || "",
        title: searchParams.get("title") || "",
        assignments: searchParams.get("assignments") 
            ? searchParams.get("assignments")!.split(",") // Convert comma-separated string to array
            : [], // Default to an empty array if null
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{card.title}</h1>
            <p><strong>Ticket Number:</strong> {card.ticket_num}</p>
            <p><strong>Category:</strong> {card.category}</p>
            <p><strong>Description:</strong> {card.description}</p>
            <p><strong>Deadline:</strong> {card.deadline}</p>
            <p><strong>Priority:</strong> {card.priority}</p>
            <p><strong>Developer Type:</strong> {card.dev_type}</p>
            <p><strong>Assignments:</strong> {card.assignments.length > 0 ? card.assignments.join(", ") : "None"}</p>
        </div>
    );
}
