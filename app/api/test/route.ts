import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Inngest } from "inngest";

export async function POST(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    const name = req.nextUrl.searchParams.get("name");
    const giveaway = await prisma.giveaways.findFirst({ where: { twitchId: "1111" }, select: { id: true, creatorId: true } });
    if (!giveaway) return;
    const inngest = new Inngest({ eventKey: process.env.INNGEST_EVENT_KEY!, id: "atmana" });
    await inngest.send({
        name: "webhook.claim",
        data: {
            giveawayId: giveaway.id,
            creatorId: giveaway.creatorId,
            viewerId: id,
            viewerName: name,
        },
    });
    return NextResponse.json({});
}
