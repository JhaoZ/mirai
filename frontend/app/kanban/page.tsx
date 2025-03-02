"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from "react";
import { columnData, CardType } from "./dataObject";
import { onDragCard, onDropCard } from "./cardFunctionality";
import {useRouter} from 'next/navigation';

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

    const router = useRouter();

    const [projectTitle, setProjectTitle] = useState("");
const [projectDescription, setProjectDescription] = useState("");

// Fetch Project Title
useEffect(() => {
    fetch("http://127.0.0.1:5000/get_project_title")
    .then((res) => res.json())
    .then((data) => {
        if (data["Project Title"]) {
            setProjectTitle(data["Project Title"]);
        } else {
            setProjectTitle("Project not initialized.");
        }
    })
    .catch((err) => console.log("Error fetching project title:", err));
}, []);

// Fetch Project Description
useEffect(() => {
    fetch("http://127.0.0.1:5000/get_project_description")
    .then((res) => res.json())
    .then((data) => {
        if (data["Project Title"]) {
            setProjectDescription(data["Project Title"]);
        } else {
            setProjectDescription("Project not initialized.");
        }
    })
    .catch((err) => console.log("Error fetching project description:", err));
}, []);


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



    const handleCardClick = (card: CardType) => {
        const queryParams = new URLSearchParams({
            ticket_num: card.ticket_num,
            category: card.category,
            description: card.description,
            deadline: card.deadline,
            priority: card.priority.toString(),
            dev_type: card.dev_type,
            title: card.title,
            assignments: card.assignments.join(',')  // join array into comma-separated string
        });
        router.push(`/cardDetail?${queryParams.toString()}`);
    };





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
                <div className="relative min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 animate-gradient">


    
                    {/* Dimmed background when Standup form is open */}
                    {showStandupForm && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-25 z-40 pointer-events-none"></div>
                    )}



    
                    {/* Content (Kanban board) */}
                    <div className={`relative z-10 ${showStandupForm ? "opacity-50" : "opacity-100"}`}>
                        {/* Standup Button */}
                        <div className="flex justify-between items-center p-4 bg-black text-white">
                        <img 
                                src="/Sprite-0011.png" 
                                alt="Kanban Board Logo" 
                                className="h-20 w-auto"
                            />
                            
    <h2 className="text-sm font-bold">{projectTitle || "Loading..."}</h2>
    

                                
    <button 
    className="relative px-6 py-3 text-green-300 font-mono text-lg uppercase tracking-widest 
               bg-transparent border-2 border-green-400 rounded-lg transition-all 
               before:absolute before:inset-0 before:bg-green-400/10 before:blur-md before:rounded-lg
               hover:text-white hover:bg-green-400 hover:border-green-300 hover:shadow-green-400/50 
               active:scale-95 focus:ring-2 focus:ring-green-400/60"
    onClick={() => setShowStandupForm(true)}
>
    ⌨️ Stand Up
</button>





                        </div>

                        


    
                        {/* Kanban Board */}
                        
                        <div className="mt-8 p-2 flex flex-wrap gap-4 justify-center">
    {kanbans.map((items) => (
        <div 
            key={items.id}
            className="flex-1 min-w-[220px] max-w-[250px] text-white text-sm font-semibold rounded-lg shadow-lg overflow-hidden border border-gray-600 bg-[#1E1E1E]"
        >
            {/* Terminal Header Bar */}
            <div className="flex items-center justify-between bg-gray-800 px-3 py-1">
                <div className="flex space-x-1">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                </div>
                <p className="text-gray-300 text-xs font-mono">{items.text}</p>
                <div></div>
            </div>

            {/* Ticket Container */}
            <div 
                className="p-2 text-green-400 font-mono text-xs bg-black/80 h-[450px] overflow-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-500"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropCard(items.id, draggableElement, setCards)}
            >
                {cards.filter((c) => c.category === items.id).map((c) => (
                    <div 
                        key={c.ticket_num} 
                        className="bg-[#262626] shadow-md p-3 mb-2 rounded-lg border-l-4 border-green-500 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl relative"
                        draggable
                        onDragStart={() => onDragCard(c.ticket_num, c.category, setDraggableElement)}
                                                
                    >
                        {/* Ticket Number Badge */}
                        <div className="absolute top-1 left-1 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                            {c.ticket_num}
                        </div>

                        {/* Info Button */}
                        <button 
                            className="absolute top-1 right-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full shadow transition text-[12px] px-1"
                            onClick={() => handleCardClick(c)}
                        >
                            ℹ️
                        </button>

                        {/* Card Content */}
                        <div className="mt-1">
                            <p className="text-[12px] font-semibold text-green-400 tracking-wide">
                                {c.title}
                            </p>
                            <p className="text-[10px] text-gray-500">Deadline: {c.deadline}</p>
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
