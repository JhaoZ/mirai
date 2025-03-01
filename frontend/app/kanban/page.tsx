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

    const Router = useRouter();

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

    const onInfoClick = (card: CardType) => {
        const queryParams = new URLSearchParams({
            ticket_num: card.ticket_num,
            category: card.category,
            description: card.description,
            deadline: card.deadline,
            priority: card.priority.toString(), // Convert number to string
            dev_type: card.dev_type,
            title: card.title,
            assignments: card.assignments.join(","), // Convert array to comma-separated string
        }).toString();

        Router.push(`/card-details?${queryParams}`);
    };
    


    return (
        <>
            <div className="mt-8">
                <h1 className="text-white-900 text-center text-4xl font-bold">
                    Kanban Board
                </h1>
                <div className="mt-4 p-2 flex flex-wrap gap-4 justify-center">
                    {
                        kanbans.map((items)=>
                            <div key={items.id} 
                            className="flex-1 min-w-[250px] text-center text-white text-lg font-semibold sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-3 border border-gray-500 bg-gray-800/50 rounded-lg shadow-md">
                                <div>
                                    <p>{items.text}</p>
                                </div>

                                
                                <div className="flex-col gap-2 overflow-auto text-black bg-gray-700/30 rounded-lg p-4" 
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                                onDrop={()=>{onDropCard(items.id, draggableElement, setCards);}}>


                                    {
                                        cards.filter((c) => c.category === items.id).map((c) => (
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

                            <button 
                                className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full shadow transition"
                                onClick={() => onInfoClick(c)} // Replace with your handler function
                            >
                                ℹ️
                            </button>

                    {/* Card Content */}
                    <div className="mt-2">
                        {/* Title (Smaller Font) */}
                        <p className="text-md font-semibold text-gray-800 tracking-wide">
                            {c.title}
                        </p>


                        {/* Deadline */}
                        <p className="text-xs text-gray-500">Deadline: {c.deadline}</p>
                    </div>
</div>
                                     
                                        ))
                                    }
                                    
                                </div>
                                
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );
}
