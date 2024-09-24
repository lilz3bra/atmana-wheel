interface giveaway {
    dbId: string;
    twId: string;
    name: string;
    cost: number;
    prize: string;
    winner: string | null;
    paid: boolean;
}
interface Entry {
    name: string;
    weight: number;
}

interface User {
    name: string;
    ammount: number;
    id: string;
}
interface Segment extends User {
    comienzo: number;
    fin: number;
    shortName: string;
}
