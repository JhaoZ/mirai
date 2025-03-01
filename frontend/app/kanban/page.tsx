"use client";
import React, { useState, useEffect } from "react";
import { columnData, CardType, initialCardData } from "./dataObject";
import { onDragCard, onDropCard } from "./cardFunctionality";

/*
Reference tutorial for base code: https://youtu.be/bwIs_eOe6Z8?si=d0tvm3x5YJspTkqg
*/

interface Props {}

export default function KanbanBoard(props: Props) {
    const [cards, setCards] = useState<CardType[]>([]); //sets up the cards inside the kanban board
    const [kanbans, setKanbans] = useState(columnData); //sets up the kanban column names 
    const [draggableElement, setDraggableElement] = useState<{card_id: string, column_id: string} | null>(null);

    
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
                    id: t.ticket_num,
                    column_id: t.category,
                    text: t.description,
                    deadline: t.deadline,
                    priority: t.priority
                }));
                console.log(converted);
                setCards(converted);
            }
        })
        .catch((err) => console.log(err));

    }, []);
    


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
                                onDrop={()=>{
                                    //need to fix the div so that the drop target covers the entire board. 
                                    onDropCard(items.id, draggableElement, setCards);
                                }}>

                                    {
                                        cards.filter((c) => c.column_id === items.id).map((c) => (
                                            <div key={c.id} className="bg-gray-200 p-4 h-32 mb-2 rounded" draggable onDragStart={() => {onDragCard(c.id, c.column_id, setDraggableElement)}}>
                                                <p>{c.text}</p>
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
