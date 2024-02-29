import Link from "next/link";

import { prisma } from "@/lib/prisma";
import WinnerItem from "./WinnerItem";
import ViewerList from "./ViewerList";

interface Props {
    params: {
        page: string;
        creatorId: string;
    };
}

export default async function page({ params }: Props) {
    const page = Number(params.page);

    const creatorId = params.creatorId;
    const skip = (page - 1) * 20;

    const winners = await prisma.winners.findMany({
        where: { giveaway: { creatorId: creatorId } },
        select: { giveaway: { select: { name: true, prize: true, id: true } }, viewer: { select: { name: true, id: true } } },
        orderBy: { dateDrawn: "asc" },
        skip: 0,
        take: 20,
    });

    return (
        <>
            <ViewerList creatorId={creatorId} />
        </>
    );
}
