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

    const res = await prisma.viewerOnStream.findMany({
        where: { streamerId: thisUser.id },
        select: { viewer: { select: { name: true, id: true } } },
        skip: (page - 1) * 20,
        take: 20,
    });
    return NextResponse.json(res);
}
