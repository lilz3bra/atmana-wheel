"use server";

import { prisma } from "@/lib/prisma";

export async function banViewer(viewerId: string, status: boolean) {
    console.log(viewerId);
    const re = await prisma.streamViewers.update({ where: { id: viewerId }, data: { isBanned: status } });
    return re.isBanned;
}
