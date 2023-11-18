import { redirect } from "next/navigation";

import HistoryList from "./HistoryList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface Props {
    params: {
        action: string;
    };
}
const History = async ({ params }: Props) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }
    const currentUser = session?.user?.id;
    let fetchedItems;
    if (params.action === "prompt") {
        fetchedItems = await prisma.prompts.findMany({
            where: {
                creatorId: currentUser,
                hidden: false,
            },
        });
    }
    if (params.action === "wheel") {
        fetchedItems = await prisma.giveaways.findMany({
            where: {
                creatorId: currentUser,
                hidden: false,
            },
        });
    }

    return <HistoryList items={fetchedItems!} />;
};

export default History;
