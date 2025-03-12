import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const sender = req.nextUrl.searchParams.get("sender");
        const channel = req.nextUrl.searchParams.get("channel");
        if (!sender || !channel) return NextResponse.json({}, { status: 500 });
        const tickets = await prisma.giveawayRedemptions.findMany({
            where: {
                viewer: { name: { mode: "insensitive", equals: sender } },
                giveaway: { creator: { name: channel }, twitchId: { not: "" } },
            },
            select: { ammount: true, giveaway: { select: { name: true } } },
            orderBy: { giveaway: { createdAt: "desc" } },
        });
        if (tickets.length === 0) return NextResponse.json({ message: "You haven't entered any (active) giveaways" });
        const message = tickets.reduce((acc, t) => {
            const msg = t.giveaway.name + ": " + t.ammount + "  |  ";
            acc += msg;
            return acc;
        }, "");
        return NextResponse.json({ message });
    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json({}, { status: 500 });
    }
}
