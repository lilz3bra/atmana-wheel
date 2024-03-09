export default interface Winner {
    id: string;
    dateDrawn: Date;
    giveaway: {
        id: string;
        name: string;
        prize: string;
    };
    paid: boolean | null;
    viewer: {
        id: string;
        name: string;
    };
}
