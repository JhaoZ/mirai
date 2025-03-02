"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from "react";
import { columnData, CardType } from "./dataObject";
import { onDragCard, onDropCard } from "./cardFunctionality";
import {useRouter} from 'next/router';

/*
Reference tutorial for base code: https://youtu.be/bwIs_eOe6Z8?si=d0tvm3x5YJspTkqg
*/

interface Props {}

export default function KanbanBoard(props: Props) {
    const [cards, setCards] = useState<CardType[]>([]); //sets up the cards inside the kanban board
    const [kanbans, setKanbans] = useState(columnData); //sets up the kanban column names 
    const [draggableElement, setDraggableElement] = useState<{ticket_num: string, category: string} | null>(null);
    

    // standup form
    const [showStandupForm, setShowStandupForm] = useState(false);
    const [employeeId, setEmployeeId] = useState("");
    const [standupText, setStandupText] = useState("");
    const [loading, setLoading] = useState(false);


    //endpoint for getting tickets 
    useEffect(() => {
        fetch("http://127.0.0.1:5000/get_tickets")
        .then((res) => res.json())
        .then((data) => {
            if (data.Data) {
                console.log(data.Data);
                let tickets = JSON.parse(data.Data);
                console.log(tickets)
                const converted = tickets.map((t : any) => ({
                    ticket_num: t.ticket_num,
                    category: t.category,
                    description: t.description,
                    deadline: t.deadline,
                    priority: t.priority,
                    dev_type: t.dev_type,
                    title: t.title,
                    assignments: t.assignments
                }));
                console.log(converted);
                setCards(converted);
            }
        })
        .catch((err) => console.log(err));
        

    }, []);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/update_tickets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tickets: JSON.stringify(cards),
            }),
        })
        .then((res) => res.json())
        .then((data) => console.log("Updated tickets successfully:", data))
        .catch((error) => console.error("Error updating tickets:", error));
    }, [cards]); // Runs whenever `cards` changes












    
    const handleSubmitStandup = () => {
        console.log("Submitting standup...");
        setLoading(true);  // Start loading
    
        fetch("http://127.0.0.1:5000/standup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: standupText,
                id: employeeId,
            }),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.Success) {
                console.log("Standup submitted successfully:", data);
                
                // Fetch updated tickets since standup may have changed them
                return fetch("http://127.0.0.1:5000/get_tickets");
            } else {
                throw new Error(data.Error || "Standup submission failed");
            }
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.Data) {
                let tickets = JSON.parse(data.Data);
                const converted = tickets.map((t: any) => ({
                    ticket_num: t.ticket_num,
                    category: t.category,
                    description: t.description,
                    deadline: t.deadline,
                    priority: t.priority,
                    dev_type: t.dev_type,
                    title: t.title,
                    assignments: t.assignments,
                }));
                console.log("Updated tickets:", converted);
                setCards(converted);
            }
        })
        .catch((error) => console.error("Error:", error))
        .finally(() => {
            setLoading(false);  // Stop loading
            setShowStandupForm(false);
            setEmployeeId("");
            setStandupText("");
        });
    };
    

    return (
            <>
                {/* Wrapper for entire screen */}
                <div className="relative min-h-screen">
    
                    {/* Dimmed background when Standup form is open */}
                    {showStandupForm && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-25 z-40 pointer-events-none"></div>
                    )}
    
                    {/* Content (Kanban board) */}
                    <div className={`relative z-10 ${showStandupForm ? "opacity-50" : "opacity-100"}`}>
                        {/* Standup Button */}
                        <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
                            <h1 className="text-2xl font-bold">Kanban Board</h1>
                            <button 
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md transition"
                                onClick={() => setShowStandupForm(true)}
                            >
                                Standup
                            </button>
                        </div>
    
                        {/* Kanban Board */}
                        <div className="mt-8 p-2 flex flex-wrap gap-4 justify-center">
                            {kanbans.map((items) => (
                                <div 
                                    key={items.id}
                                    className="flex-1 min-w-[250px] text-center text-white text-lg font-semibold sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-3 border border-gray-500 bg-gray-800/50 rounded-lg shadow-md"
                                >
                                    <div>
                                        <p>{items.text}</p>
                                    </div>
                                    <div 
                                        className="flex-col gap-2 overflow-auto text-black bg-gray-700/30 rounded-lg p-4"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => onDropCard(items.id, draggableElement, setCards)}
                                    >
                                        {cards.filter((c) => c.category === items.id).map((c) => (
                                            <div 
                                                key={c.ticket_num} 
                                                className="bg-white shadow-lg p-4 h-36 mb-3 rounded-lg border-l-4 border-green-500 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl flex flex-col relative"
                                                draggable
                                                onDragStart={() => onDragCard(c.ticket_num, c.category, setDraggableElement)}
                                            >
                                                {/* Ticket Number Badge */}
                                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow">
                                                    {c.ticket_num}
                                                </div>
    
                                                {/* Info Button */}
                                                <button 
                                                    className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full shadow transition"
                                                    onClick={() => console.log("Info clicked", c)}
                                                >
                                                    ℹ️
                                                </button>
    
                                                {/* Card Content */}
                                                <div className="mt-2">
                                                    <p className="text-md font-semibold text-gray-800 tracking-wide">
                                                        {c.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Deadline: {c.deadline}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
    
                    {/* Standup Form (Popup) */}
                    {showStandupForm && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                <h2 className="text-lg font-bold mb-2">Submit Your Standup</h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    Please enter your Employee ID and today's standup update.
                                </p>
                                <input 
                                    type="text" 
                                    placeholder="Employee ID"
                                    className="w-full border rounded p-2 mb-2"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                />
                                <textarea 
                                    placeholder="Enter your standup update..."
                                    className="w-full border rounded p-2 mb-2"
                                    value={standupText}
                                    onChange={(e) => setStandupText(e.target.value)}
                                />
                                <div className="flex justify-between mt-2">
                                    <button 
                                        className="bg-gray-400 text-white px-3 py-1 rounded-md"
                                        onClick={() => setShowStandupForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    {/* Submit Button */}
                                    <button 
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md flex items-center justify-center"
                                        onClick={handleSubmitStandup}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="animate-spin h-5 w-5 border-t-2 border-white border-solid rounded-full"></div>
                                        ) : (
                                            "Submit"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }
