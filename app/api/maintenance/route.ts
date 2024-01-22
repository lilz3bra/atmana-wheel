import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { AggregateGiveaway } from "../statistics/helpers";

export async function GET(req: NextRequest) {
    // // Validate authorization
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // // Get data stored in the jwt sent
    // const thisUser = session.user;

    //TODO: Validate this user is an admin

    const userId = req.nextUrl.searchParams.get("user");
    if (!userId) return NextResponse.json({}, { status: 400 });

    const everything = await prisma.giveaways.findMany({
        where: { creatorId: userId, hidden: false, paid: false, redemptions: { some: {} } },
        select: { winner: true, name: true, prize: true },
        // include: { },
        // take: 30,
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

    const where: Prisma.GiveawaysWhereInput = {};

    if (userId) where.creatorId = userId;
    if (giveaway) where.id = giveaway;
    if (deleted) where.twitchId = "";

    const res = await prisma.giveaways.deleteMany({ where });
    return NextResponse.json({ res });
}

export async function POST(req: NextRequest) {
    // // Validate authorization
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // // Get data stored in the jwt sent
    // const thisUser = session.user;
    //TODO: Validate this user is an admin
    const data = await req.json();
    const gaId = data.giveaway;
    const aggregated = await AggregateGiveaway(gaId);
    // const everything = await prisma.giveawayRedemptions.findMany({
    //     where: { giveawayId: gaId },
    //     select: { viewer: { select: { name: true, id: true } } },
    // });

    // const reducedData = everything.reduce((accumulator, entry) => {
    //     const viewerId = entry.viewer.id;

    //     // If viewerId is already in accumulator, increment count; otherwise, add a new entry
    //     if (accumulator.some((item) => item.viewerId === viewerId)) {
    //         accumulator.find((item) => item.viewerId === viewerId)!.count++;
    //     } else {
    //         accumulator.push({ viewerId, count: 1, giveawayId: gaId });
    //     }

    //     return accumulator;
    // }, [] as { viewerId: string; count: number; giveawayId: string }[]);

    // const res = await prisma.agregated.createMany({ data: reducedData });

    // if (reducedData.length === res.count) {
    //     //     const dres = await prisma.giveawayRedemptions.deleteMany({ where: { giveawayId: gaId } });
    //     //     return NextResponse.json(dres);
    // }
    return NextResponse.json(aggregated);
}

// export async function PUT(req: NextRequest) {
// const data = await req.json();
// const gaId = data.giveaway;
// const everything = await prisma.giveawayRedemptions.findMany({
//     where: { giveawayId: gaId },
//     select: { viewerId: true },
// });
// type ViewerIdCountMap = { viewerId: string; count: number };
// const viewerIdCountMap: ViewerIdCountMap[] = Array.from(
//     everything.reduce((countMap, entry) => {
//         const { viewerId } = entry;

//         if (countMap.has(viewerId)) {
//             // If the viewerId exists, increment its count
//             countMap.set(viewerId, countMap.get(viewerId)! + 1);
//         } else {
//             // If the viewerId doesn't exist, add a new entry to the map
//             countMap.set(viewerId, 1);
//         }

//         return countMap;
//     }, new Map<string, number>())
// ).map(([viewerId, count]) => ({ viewerId, count }));
// try {
//     const d = { giveawayId: gaId, participants: viewerIdCountMap };

//     // const res = await prisma.agregated.createMany({ data: d });

//     const dres = await prisma.giveawayRedemptions.deleteMany({ where: { giveawayId: gaId } });
//     return NextResponse.json(dres);
// } catch (error) {
//     return NextResponse.json(error);
// }
// }
