import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get data stored in the jwt sent
    const thisUser = session.user;
    let page = Number(req.nextUrl.searchParams.get("page"));

    if (!page) page = 1;

    const res = await prisma.giveawayRedemptions.findMany({
        where: { giveaway: { creatorId: thisUser.id } },
        select: { viewer: { select: { name: true, id: true, isBanned: true } } },
        skip: (page - 1) * 20,
        take: 20,
    });
    return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    let status = 404;

    if (data.action === "ban" && data.viewerId && typeof data.state === "boolean") {
        const res = await prisma.viewer.update({ where: { id: data.viewerId }, data: { isBanned: data.state } });
        if (res) status = 200;
    }

    return NextResponse.json({}, { status });
}
