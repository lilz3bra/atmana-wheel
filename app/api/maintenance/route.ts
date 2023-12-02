import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
    // // Validate authorization
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // // Get data stored in the jwt sent
    // const thisUser = session.user;

    //TODO: Validate this user is an admin

    const userId = req.nextUrl.searchParams.get("user");
    if (!userId) return NextResponse.json({}, { status: 400 });

    const everything = await prisma.giveawayRedemptions.findMany({
        where: { giveaway: { creatorId: userId } },
        select: { giveaway: { select: { name: true, twitchId: true, id: true } } },
    });

    return NextResponse.json({ everything });
}

export async function DELETE(req: NextRequest) {
    // // Validate authorization
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // // Get data stored in the jwt sent
    // const thisUser = session.user;

    //TODO: Validate this user is an admin

    const userId = req.nextUrl.searchParams.get("user");
    const giveaway = req.nextUrl.searchParams.get("giveaway");
    const deleted = req.nextUrl.searchParams.get("deleted");

    const where: any = { giveaway: {} };

    if (userId) where.giveaway.creatorId = userId;
    if (giveaway) where.giveawayId = giveaway;
    if (deleted) where.giveaway.twitchId = "";

    // const res = await prisma.giveawayRedemptions.deleteMany({ where });
    return NextResponse.json({ where });
}
