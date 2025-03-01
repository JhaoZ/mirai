// Base Code Reference: https://youtu.be/bwIs_eOe6Z8?si=d0tvm3x5YJspTkqg


export const columnData = [
    {
        id: 'TODO',
        text: 'To Do'
    },
    {
        id: 'PROGRESS',
        text: 'In Progress'
    },
    {
        id: 'QA',
        text: 'QA'
    },
    {
        id: 'PR',
        text: 'PR'
    },
    {
        id: 'CLOSED',
        text: 'Closed'
    },
];


export interface CardType {
    ticket_num: string; //this is ticket_number on the backend 
    title: string;
    category: string; //this maps to category on the backend 
    description: string; //this maps to description on the backend
    deadline: string; //this maps to deadline on the backend
    priority: number; //this map to priority on the backend
    assignments: string[] //this maps to assignments on the backend
    dev_type: string; // dev type for which board
}

export const initialCardData: CardType[] = [
    // { id: 'abc', column_id: 'todo', text: 'Card 1' },
    // { id: 'abcd', column_id: 'inProgress', text: 'Card 5' },
    // { id: 'abcde', column_id: 'todo', text: 'Card 3' },
    // { id: 'abcdef', column_id: 'inProgress', text: 'Card 4' },
    // { id: 'abcdefg', column_id: 'todo', text: 'Card 2' },
    // { id: 'abcdefh', column_id: 'todo', text: 'Card 6' }
];