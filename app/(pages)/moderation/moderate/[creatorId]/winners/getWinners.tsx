"use server";
import { prisma } from "@/lib/prisma";

export default async function getWinners(creatorId: string, skip: number, filter: boolean | null) {
    let whereQuery = {};
    if (filter !== null) {
        whereQuery = { ...whereQuery, giveaway: { creatorId: creatorId }, paid: filter };
    } else {
        whereQuery = { ...whereQuery, giveaway: { creatorId: creatorId } };
    }
    return await prisma.winners.findMany({
        where: whereQuery,
        select: { giveaway: { select: { name: true, prize: true, id: true } }, viewer: { select: { name: true, id: true } }, paid: true, id: true },
        orderBy: { dateDrawn: "asc" },
        skip: skip,
        take: 20,
    });
}
