import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get("id");
        const channel = req.nextUrl.searchParams.get("channel");
        if (!id || !channel) return NextResponse.json({}, { status: 500 });
        const tickets = await prisma.giveawayRedemptions.findMany({
            where: { viewer: { twitchId: id }, giveaway: { creator: { name: channel }, twitchId: { not: "" } } },
            select: { ammount: true, giveaway: { select: { name: true } } },
            orderBy: { giveaway: { createdAt: "desc" } },
        });

        if (tickets.length === 0) return NextResponse.json({ tickets: 0 });
        return NextResponse.json({ tickets });
    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json({}, { status: 500 });
    }
}
