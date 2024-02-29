"use server";

import { prisma } from "@/lib/prisma";

export async function markViewerPaid(id: string, paid: boolean) {
    const r = await prisma.winners.update({ where: { id: id }, data: { paid: paid } });
    console.log(r);
    return r.paid;
}
