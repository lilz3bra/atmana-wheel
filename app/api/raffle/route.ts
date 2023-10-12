import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * 
 * @param req {
 *             title: String,
            cost: Number,
            is_user_input_required: Boolean,
            prompt: String,
            background_color: String,
            is_max_per_stream_enabled: Boolean,
            max_per_stream: Number | null,
            is_max_per_user_per_stream_enabled: Boolean,
            max_per_user_per_stream: Number | null,
            is_global_cooldown_enabled: Boolean,
            global_cooldown_seconds: Number | null,
            }
 */
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session?.user?.id;

    const data = await req.json();

    const thisUser = await prisma.account.findFirst({ where: { userId: currentUser }, select: { providerAccountId: true } });
    const url = `${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${thisUser?.providerAccountId}`;
    const cookie = "Bearer " + session.user.access_token;
    const option = {
        method: "POST",
        headers: { authorization: cookie, "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(data.twData),
    };
    const res = await fetch(url, option);
    const responseData = await res.json();
    if (res.status !== 200) {
        console.warn(url, option, currentUser);
    } else {
        const twitchId = responseData.data[0].id;
        console.log(twitchId);
        const db = await prisma.giveaways.create({
            data: { name: data.twData.title, cost: data.twData.cost, prize: data.prize, paid: false, hidden: false, creatorId: currentUser, winner: null, twitchId: twitchId },
        });
    }

    return NextResponse.json(responseData, { status: res.status });
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session?.user?.id;

    const raffle = req.nextUrl.searchParams.get("raffleId");
    if (!raffle || raffle === "") return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const thisUser = await prisma.account.findFirst({ where: { userId: currentUser }, select: { providerAccountId: true, access_token: true } });
    // const raffle = await prisma.giveaways.findFirst({ where: { twitchId: raffleId }, select: { twitchId: true } });

    if (!raffle || !thisUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const getPages = async (cursor?: string, accumulatedData: UsersList = {}): Promise<UsersList> => {
        const after = typeof cursor === "undefined" ? "" : `&after=${cursor}`;
        const cookie = "Bearer " + session.user.access_token;
        const broadcaster = thisUser?.providerAccountId;
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards/redemptions?broadcaster_id=${broadcaster}&reward_id=${raffle}&first=50&status=FULFILLED${after}`,
            {
                headers: { "Client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, Authorization: cookie },
            }
        );
        const d = await res.json();
        const data: any[] = d.data;
        if (data.length > 0) {
            const newData = sumData(data, accumulatedData);
            const updatedData = { ...accumulatedData, ...newData };

            if (d.pagination && d.pagination.cursor) {
                return getPages(d.pagination.cursor, updatedData);
            } else {
                return updatedData;
            }
        } else {
            return accumulatedData;
        }
    };
    const sumData = (data: any[], accumulatedData: UsersList): UsersList => {
        data.forEach((entry) => {
            // Accumulate data as needed
            const userName = entry.user_name;
            // Accumulate in the object
            if (userName) {
                accumulatedData[userName] = (accumulatedData[userName] || 0) + 1;
            }
        });
        return accumulatedData;
    };
    const result: UsersList = await getPages();
    return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session?.user?.id;

    const raffle = req.nextUrl.searchParams.get("raffleId");
    const thisUser = await prisma.account.findFirst({ where: { userId: currentUser }, select: { providerAccountId: true, access_token: true } });

    const cookie = "Bearer " + session.user.access_token;
    const broadcaster = thisUser?.providerAccountId;
    const res = await fetch(`${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${broadcaster}&id=${raffle}`, {
        method: "DELETE",
        headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: cookie },
    });

    return NextResponse.json({}, { status: res.status });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session?.user?.id;

    const raffle = req.nextUrl.searchParams.get("raffleId");
    if (!raffle || raffle === "") return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const data = await req.json();
    const db = await prisma.giveaways.update({ where: { creatorId: currentUser, id: raffle }, data: data });

    return NextResponse.json(db);
}
