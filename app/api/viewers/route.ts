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

    let creatorId = req.nextUrl.searchParams.get("creator");
    if (creatorId) {
        if (session.user.id === creatorId) {
            const viewers = await prisma.streamViewers.findMany({
                where: { creatorId: thisUser.id },
                select: { viewer: { select: { name: true, id: true } }, isBanned: true },
                orderBy: { viewer: { name: "asc" } },
                skip: (page - 1) * 20,
                take: 20,
            });
            const viewerMap = viewers.map((item) => {
                return { isBanned: item.isBanned, name: item.viewer.name, id: item.viewer.id };
            });
            return NextResponse.json(viewerMap);
        } else {
            const validModerator = await prisma.moderator.findFirst({ where: { creatorId: creatorId, moderatorId: session.user.id } });
            if (validModerator !== null) {
                const viewers = await prisma.streamViewers.findMany({
                    where: { creatorId: creatorId },
                    select: { viewer: { select: { name: true, id: true } }, isBanned: true },
                    orderBy: { viewer: { name: "asc" } },

                    skip: (page - 1) * 20,
                    take: 20,
                });
                const viewerMap = viewers.map((item) => {
                    return { isBanned: item.isBanned, name: item.viewer.name, id: item.viewer.id };
                });
                return NextResponse.json(viewerMap);
            } else {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }
    } else {
        return NextResponse.json({}, { status: 400 });
    }
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
