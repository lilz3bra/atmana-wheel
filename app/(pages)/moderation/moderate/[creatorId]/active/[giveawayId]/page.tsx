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
    });
    const totalTickets = viewers.reduce((sum, object) => sum + object.ammount, 0);
    console.log(viewers);
    const sortedViewers = viewers.sort((a, b) => b.ammount - a.ammount);
    return (
        <div id="main-content" className="flex flex-col  justify-center items-center m-4">
            <>
                <h1 className="font-bold text-xl text-center m-4">
                    {viewers.length} Participants ({totalTickets} entries)
                </h1>
                <div className="m-auto w-2/3 h-1/2 justify-center text-center gap-2">
                    {sortedViewers.map((entry) => (
                        <p key={entry.viewer.name}>
                            <span className="font-bold">{entry.viewer.name}</span>: {entry.ammount} entr
                            {entry.ammount > 1 ? "ies" : "y"}{" "}
                            <span className="italic">({((entry.ammount / totalTickets) * 100).toFixed(2)}%)</span>
                        </p>
                    ))}
                </div>
            </>
        </div>
    );
};

export default page;
