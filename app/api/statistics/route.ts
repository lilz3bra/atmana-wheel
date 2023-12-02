import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    // // Validate authorization
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // // Get data stored in the jwt sent
    // const thisUser = session.user;

    const data = await req.json();
    const gaId = data.giveaway;
    const everything = await prisma.giveawayRedemptions.findMany({
        where: { giveawayId: gaId },
        select: { viewer: { select: { name: true, id: true } } },
    });
    // console.log(everything.length);

    // Assuming everything is an array of ViewerEntry
    type ViewerIdCountMap = Record<string, number>;
    const viewerIdCountMap: Record<string, number> = everything.reduce((countMap: ViewerIdCountMap, entry) => {
        const viewerId = entry.viewer.id;

        // Increment count for the viewerId or initialize to 1 if not present
        countMap[viewerId] = (countMap[viewerId] || 0) + 1;

        return countMap;
    }, {});

    const aggregatedEntriesData = Object.entries(viewerIdCountMap).map(([viewerId, count]) => ({
        viewerId,
        giveawayId: gaId,
        count,
    }));

    const res = await prisma.aggregatedEntries.createMany({ data: aggregatedEntriesData });
    return NextResponse.json({ res });

    // return NextResponse.json({ len: everything });
}
