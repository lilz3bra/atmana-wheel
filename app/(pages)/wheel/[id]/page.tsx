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
    const currentUser = session?.user?.id;

    const giveaway = await prisma.giveaways.findFirst({
        where: {
            id: params.id,
        },
        select: { id: true, twitchId: true },
    });

    return <RaffleUI giveaway={giveaway!} />;
}
