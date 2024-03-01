"use server";
import { prisma } from "@/lib/prisma";

export async function getViewers(creatorId: string, skip: number, filter: boolean | null, username: string) {
    let whereQuery = {};
    if (filter) whereQuery = { ...whereQuery, isBanned: true };
    if (filter === false) whereQuery = { ...whereQuery, isBanned: false };

    if (username !== "") whereQuery = { ...whereQuery, viewer: { name: { contains: username, mode: "insensitive" } } };

    whereQuery = { ...whereQuery, creatorId: creatorId };
    console.log(whereQuery, username);
    const viewers = await prisma.streamViewers.findMany({
        where: whereQuery,
        select: { viewer: { select: { name: true, id: true } }, isBanned: true, id: true },
        orderBy: { viewer: { name: "asc" } },
        skip: skip,
        take: 20,
    });
    return viewers;
}
