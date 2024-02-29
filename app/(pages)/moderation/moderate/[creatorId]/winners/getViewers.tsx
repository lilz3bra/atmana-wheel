"use server";
import { prisma } from "@/lib/prisma";

export async function getWinnersUnfiltered(creatorId: string, skip: number) {
    const r = await prisma.winners.findMany({
        where: { giveaway: { creatorId: creatorId } },
        select: { giveaway: { select: { name: true, prize: true, id: true } }, viewer: { select: { name: true, id: true } }, paid: true, id: true },
        orderBy: { dateDrawn: "asc" },
        skip: skip,
        take: 20,
    });
    console.log("unfiltered");
    return r;
}

export async function getWinnersFiltered(creatorId: string, skip: number) {
    const r = await prisma.winners.findMany({
        where: { giveaway: { creatorId: creatorId }, paid: false },
        select: { giveaway: { select: { name: true, prize: true, id: true } }, viewer: { select: { name: true, id: true } }, paid: true, id: true },
        orderBy: { dateDrawn: "asc" },
        skip: skip,
        take: 20,
    });
    console.log("filtered");
    return r;
}
