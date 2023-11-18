import RaffleUI from "./RaffleUI";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
    params: {
        id: string;
    };
}

export default async function WheelPage({ params }: Props) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }
    const giveaway = await prisma.giveaways.findFirst({
        where: {
            id: params.id,
        },
        select: { id: true, twitchId: true, paused: true, creatorId: true },
    });
    // Fetch this user's id in the db
    const thisUser = await prisma.account.findFirst({ where: { providerAccountId: session.user.providerAccountId }, select: { userId: true } });
    if (giveaway) {
        // Check if the current user is the creator of the giveaway
        if (thisUser?.userId === giveaway.creatorId) {
            return (
                <div id="main-content" className="flex flex-col  justify-center items-center m-4">
                    <RaffleUI giveaway={giveaway!} />
                </div>
            );
        } else {
            return (
                <div id="main-content" className="flex flex-col  justify-center items-center m-4 text-4xl">
                    You dont have permissions to view this
                </div>
            );
        }
    } else {
        // If we dont get a result from the query, the giveaway doesn't exist -> we shouldnt even load the controls
        return (
            <div id="main-content" className="flex flex-col  justify-center items-center m-4 text-4xl">
                Raffle doesn't exist
            </div>
        );
    }
}
