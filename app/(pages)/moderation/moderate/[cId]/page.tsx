import { authOptions } from "@/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ModerationUI from "./ModerationUI";

interface Props {
    params: {
        cId: string;
    };
}
const page = async ({ params }: Props) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }

    try {
        // Make sure user has moderation rights in this channel
        const moderatorIn = await prisma.moderator.findMany({
            where: { moderatorId: session.user.id, creatorId: params.cId },
            select: { creator: { select: { name: true, id: true } } },
        });
        // If we didnt get anything back (user and creator dont match), return a generic error
        if (moderatorIn.length < 1) return <div>Forbidden</div>;

        return <ModerationUI creator={params.cId} />;
    } catch (error) {
        // If the db query fails return a generic error. This is likely to happen if the id is the wrong lenght
        return <div>Forbidden</div>;
    }
};

export default page;
