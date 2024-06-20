import { prisma } from "@/lib/prisma";

interface Props {
    params: {
        creatorId: string;
        giveawayId: string;
    };
}
const page = async ({ params }: Props) => {
    const viewers = await prisma.giveawayRedemptions.findMany({
        where: { giveawayId: params.giveawayId },
        select: { viewer: { select: { id: true, name: true } }, ammount: true },
        orderBy: { ammount: "desc" },
    });
    const totalTickets = viewers.reduce((sum, object) => sum + object.ammount, 0);

    const userElements: JSX.Element[] = [];
    Object.keys(viewers!).forEach((_, index) => {
        const weight = viewers![index].ammount;
        const percentage = ((weight / totalTickets) * 100).toFixed(2);
        userElements.push(
            <p key={viewers![index].viewer.name}>
                <span className="font-bold">{viewers![index].viewer.name}</span>: {weight} entr{weight > 1 ? "ies" : "y"} <span className="italic">({percentage}%)</span>
            </p>
        );
    });

    return (
        <div id="main-content" className="flex flex-col  justify-center items-center m-4">
            <>
                <h1 className="font-bold text-xl text-center m-4">
                    {viewers.length} Participants ({totalTickets} entries)
                </h1>
                <div className="m-auto w-2/3 h-1/2 justify-center text-center gap-2">{userElements}</div>
            </>
        </div>
    );
};

export default page;
