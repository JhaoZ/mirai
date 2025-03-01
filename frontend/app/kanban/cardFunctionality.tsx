


export function onDragCard (id: string, col_id: string, setDraggedElement: Function) {
    setDraggedElement({
        ticket_num: id,
        category: col_id
    });
}

//could go for stricter type annotations here
export function onDropCard (new_col_id: string, draggableElement: { ticket_num: string; category: string } | null, setCards : Function) {
    if (draggableElement?.ticket_num) {
        

        console.log("Dropping card:", draggableElement.ticket_num, "into column:", new_col_id);
        setCards((prevCards: any[]) => {
            return prevCards.map((card) => {
                if (card.ticket_num === draggableElement.ticket_num) {
                    // Update the card's column
                    console.log("Updating card:", card.ticket_num, "to column:", new_col_id);
                    return { ...card, category: new_col_id };
                }
                return card;
            });
        });
        
    }


}