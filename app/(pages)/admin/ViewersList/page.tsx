import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ViewersList from "./ViewerList";

const page = async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }

    const viewers = await prisma.giveawayRedemptions.findMany({
        where: { giveaway: { creatorId: session.user.id } },
        select: { viewer: { select: { name: true, id: true, isBanned: true } } },
        take: 20,
    });

    return (
        <div className="flex flex-col justify-center">
            <ViewersList viewers={viewers} />
        </div>
    );
};

export default page;
