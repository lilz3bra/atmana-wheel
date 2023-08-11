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

type UsersList = { [name: string]: number };
