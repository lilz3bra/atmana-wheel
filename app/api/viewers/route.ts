import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { checkModerator } from "../moderation/_moderationHelpers";

export async function GET(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get data stored in the jwt sent
    const thisUser = session.user;
    const userId = thisUser.id;
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;

    const creatorId = req.nextUrl.searchParams.get("creator");
    const filter = req.nextUrl.searchParams.get("filter");
    const modCheck = await checkModerator(creatorId, userId);
    if (modCheck.invalid) {
        // User is not authorized to moderate the requested channel
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else {
        let where = {};
        // Set the creatorId based on the mod status
        where = modCheck.creator ? { creatorId: userId } : { creatorId: creatorId! };
        // If we got requested a list of banned users, append that to the query
        if (filter === "banned") where = { ...where, isBanned: true };

        // Get the viewers
        const viewers = await prisma.streamViewers.findMany({
            where: where,
            select: { viewer: { select: { name: true, id: true } }, isBanned: true },
            orderBy: { viewer: { name: "asc" } },
            skip: (page - 1) * 20,
            take: 20,
        });
        // Map it to a neat array
        const viewerMap = viewers.map((item) => {
            return { isBanned: item.isBanned, name: item.viewer.name, id: item.viewer.id };
        });
        return NextResponse.json(viewerMap);
    }
}
