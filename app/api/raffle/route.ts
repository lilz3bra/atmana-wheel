import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session?.user?.id;

    const data = await req.json();

    const thisUser = await prisma.account.findFirst({ where: { id: currentUser } });
    const res = await fetch(`${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${thisUser?.providerAccountId}`, {
        method: "POST",
        headers: { authorization: "Bearer " + thisUser?.access_token, "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY },
        body: data,
    });
    console.warn(thisUser?.access_token);
    const responseData = await res.json();

    return NextResponse.json(responseData, { status: res.status });
}
