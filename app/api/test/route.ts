import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Inngest } from "inngest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const n = Number(req.nextUrl.searchParams.get("n")) || 1;
    const id = req.nextUrl.searchParams.get("id");
    if (id === null) return NextResponse.json({});
    for (var i = 0; i < n; i++) {
        flood(id);
        await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return NextResponse.json({});
}

async function flood(id: string) {
    const giveaway = await prisma.giveaways.findFirst({ where: { twitchId: "1111" }, select: { id: true, creatorId: true } });
    if (!giveaway) return;
    const inngest = new Inngest({ eventKey: process.env.INNGEST_EVENT_KEY!, id: "atmana" });
    await inngest.send({
        name: "webhook.claim",
        data: {
            giveawayId: giveaway.id,
            creatorId: giveaway.creatorId,
            viewerId: id,
            viewerName: "lilz3bra",
        },
    });
}
