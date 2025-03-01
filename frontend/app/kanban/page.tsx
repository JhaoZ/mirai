"use client";
import React, { useState, useEffect } from "react";
import { columnData, CardType } from "./dataObject";
import { onDragCard, onDropCard } from "./cardFunctionality";

/*
Reference tutorial for base code: https://youtu.be/bwIs_eOe6Z8?si=d0tvm3x5YJspTkqg
*/

interface Props {}

export default function KanbanBoard(props: Props) {
    const [cards, setCards] = useState<CardType[]>([]); //sets up the cards inside the kanban board
    const [kanbans, setKanbans] = useState(columnData); //sets up the kanban column names 
    const [draggableElement, setDraggableElement] = useState<{ticket_num: string, category: string} | null>(null);

    
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
                                            <div key={c.ticket_num} className="bg-gray-200 p-4 h-32 mb-2 rounded" draggable onDragStart={()=>{onDragCard(c.ticket_num, c.category, setDraggableElement);}}>
                                                <p>{c.ticket_num} - {c.title}</p>
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
