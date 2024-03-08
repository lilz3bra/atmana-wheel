import { prisma } from "@/lib/prisma";
import Hint from "@/components/Hint/Hint";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

interface Props {
    params: {
        creatorId: string;
    };
}
const page = async ({ params }: Props) => {
    const activeGiveaways = await prisma.giveaways.findMany({
        where: {
            twitchId: { not: "" },
            creatorId: params.creatorId,
        },
        select: {
            id: true,
            name: true,
            cost: true,
            prize: true,
            createdAt: true,
        },
    });
    return (
        <div className="m-4 grid grid-cols-8 gap-4 mb-8">
            {activeGiveaways.map((giveawayData) => (
                <div className="m-2 bg-slate-800 p-2 rounded-xl flex flex-col align-middle justify-center items-center">
                    <p className="font-bold truncate max-w-full">{giveawayData.name}</p>
                    <p className="truncate max-w-full">Prize: {giveawayData.prize}</p>
                    <p>Cost: {giveawayData.cost}</p>
                    {giveawayData.createdAt && <p>Created: {giveawayData.createdAt.toLocaleDateString()}</p>}
                    <div className="flex flex-row whitespace-nowrap justify-center gap-4 mt-2 ">
                        <Hint text="View" extraCss="flex flex-row justify-center align-middle items-center">
                            <Link href={`active/${giveawayData.id}`} className="p-2 bg-blue-500 h-8 w-8 cursor-pointer hover:bg-blue-700 rounded-xl text-white">
                                <FontAwesomeIcon icon={faEye} />
                            </Link>
                        </Hint>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default page;
