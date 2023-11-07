import { redirect } from "next/navigation";

import HistoryList from "./HistoryList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const History = async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("api/auth/signin");
    }
    const currentUser = session?.user?.id;

    const fetchedItems = await prisma.giveaways.findMany({
        where: {
            creatorId: currentUser,
            hidden: false,
        },
    });

    return <HistoryList items={fetchedItems} />;
};

export default History;
