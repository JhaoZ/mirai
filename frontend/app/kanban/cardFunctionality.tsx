
export function onDragCard (id: string, col_id: string, setDraggedElement: Function) {
    setDraggedElement({
        card_id: id,
        column_id: col_id
    });
}

//could go for stricter type annotations here
export function onDropCard (new_col_id: string, draggableElement: { card_id: string; column_id: string } | null, setCards : Function) {
    if (draggableElement?.card_id) {
        
        console.log("Dropping card:", draggableElement.card_id, "into column:", new_col_id);
        setCards((prevCards: any[]) => {
            return prevCards.map((card) => {
                if (card.id === draggableElement.card_id) {
                    // Update the card's column
                    console.log("Updating card:", card.id, "to column:", new_col_id);
                    return { ...card, column_id: new_col_id };
                }
                return card;
            });
        });
    }


}