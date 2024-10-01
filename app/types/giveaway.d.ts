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

interface UsersList {
    name: string;
    ammount: number;
    id: string;
}
interface SegmentList extends UsersList {
    angle: number;
}
