import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { createRewardsSub, deleteListener } from "../webhooks/_helpers";

/** Create a new reward and save it to the db */
export async function PUT(req: Request) {
    try {
        // Validate authorization
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get the json sent
        const data = await req.json();
        // Get data stored in the jwt sent
        const thisUser = session.user;
        // Make the request
        const res = await fetch(`${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${thisUser.providerAccountId}`, {
            method: "POST",
            headers: { authorization: "Bearer " + thisUser.access_token, "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify(data.twData),
        });
        const responseData = await res.json();
        // Check if the request was succesful
        if (res.status !== 200) {
            // Log the error and send the response back
            console.error(responseData, res.status, res.body);
            return NextResponse.json(responseData, { status: res.status });
        } else {
            // Reward was created, create the EventSub
            const eventData = await createRewardsSub(session, responseData.data[0].id);
            let db;
            if (data.twData.is_user_input_required) {
                // This was a prompt, store it in the correct document
                db = await prisma.prompts.create({
                    data: {
                        name: data.twData.title,
                        cost: data.twData.cost,
                        prize: data.prize,
                        paid: false,
                        prompt: data.twData.prompt,
                        hidden: false,
                        creatorId: thisUser.id,
                        winner: null,
                        twitchId: responseData.data[0].id,
                        paused: false,
                        listenerId: eventData.data[0].id,
                    },
                });
            } else {
                // This was a giveaway, store it in the correct document
                db = await prisma.giveaways.create({
                    data: {
                        name: data.twData.title,
                        cost: data.twData.cost,
                        prize: data.prize,
                        paid: false,
                        hidden: false,
                        creatorId: thisUser.id,
                        winner: null,
                        twitchId: responseData.data[0].id,
                        paused: false,
                        listenerId: eventData.data[0].id,
                    },
                }); // Return the db document
            }
            return NextResponse.json(db, { status: res.status });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

/** Return the participants for a giveaway */
export async function GET(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get data stored in the jwt sent
    const thisUser = session.user;

    // Get the raffle id from req and make sure one was passed
    const raffle = req.nextUrl.searchParams.get("raffleId");
    if (!raffle || raffle === "") return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    const creator = req.nextUrl.searchParams.get("creatorId");
    let creatorId;
    if (creator && creator !== thisUser.id) {
        const isMod = await prisma.moderator.findFirst({ where: { creatorId: creator, moderatorId: thisUser.id } });
        if (isMod) {
            creatorId = creator;
        } else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    } else {
        creatorId = thisUser.id;
    }
    try {
        const temp = await prisma.giveawayRedemptions.findMany({
            where: {
                AND: [
                    { giveawayId: raffle },
                    { giveaway: { creatorId: creatorId } },
                    {
                        viewer: {
                            streams: {
                                some: {
                                    creatorId: {
                                        equals: creatorId,
                                    },
                                },
                                none: { isBanned: true },
                            },
                        },
                    },
                ],
            },
            select: {
                viewer: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
                ammount: true,
            },
        });
        const list = temp.map((i) => {
            return { ...i.viewer, ammount: i.ammount };
        });
        let tot = 0;
        Object.keys(list).forEach((_, index) => {
            const weight = list[index].ammount;
            tot += weight;
        });
        return NextResponse.json({ total: tot, list: list });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        // Validate authorization
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get data stored in the jwt sent
        const thisUser = session.user;

        // Get the raffle id from req and make sure one was passed
        const raffle = req.nextUrl.searchParams.get("raffleId");
        const id = req.nextUrl.searchParams.get("id");

        if (!!raffle) {
            // Send the delete request
            const res = await fetch(`${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${thisUser?.providerAccountId}&id=${raffle}`, {
                method: "DELETE",
                headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: "Bearer " + thisUser.access_token },
            });
            if (res.status === 204 && !!id) {
                // Remove the twitch id from the database, so we know it doesnt exist anymore
                const giveaway = await prisma.giveaways.findFirst({ where: { twitchId: raffle, id: id }, select: { listenerId: true } });
                // Remove the eventsub listener. Check added to provide backwards compatibility
                if (giveaway?.listenerId !== null && typeof giveaway?.listenerId !== "undefined") {
                    const status = await deleteListener(giveaway.listenerId);
                    if (status === 204) {
                        await prisma.giveaways.update({ where: { id: id }, data: { listenerId: "", twitchId: "" } });
                    }
                }
            } else {
                console.error(res.status, res.statusText);
                return NextResponse.json({}, { status: res.status === 204 ? 200 : res.status });
            }
            // Return 200 if deleted successfully, otherwise pass the code
            return NextResponse.json({}, { status: res.status === 204 ? 200 : res.status });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Validate authorization
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get data stored in the jwt sent
        const thisUser = session.user;
        const creator = await prisma.giveaways.findFirst({ where: { creatorId: thisUser.id } });
        if (!creator) return NextResponse.json({}, { status: 403 });

        // Get the raffle id from req and make sure one was passed
        const raffle = req.nextUrl.searchParams.get("raffleId");
        if (!raffle || raffle === "") return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

        const data = await req.json();

        // Insert into the db
        const db = await prisma.winners.create({ data: { giveawayId: raffle, viewerId: data.winner } });
        // Send the results back
        return NextResponse.json(db);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        // Validate authorization
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get data stored in the jwt sent
        const thisUser = session.user;

        // Get the raffle id from req and make sure one was passed
        const raffle = req.nextUrl.searchParams.get("raffleId");
        if (!raffle || raffle === "") return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

        // Get whatever was json sent in the body
        const bodyJson = await req.json();
        let options;

        // Send the request
        if (bodyJson.twData) {
            const creator = await prisma.giveaways.findFirst({ where: { id: bodyJson.id }, select: { creatorId: true } });
            if (creator?.creatorId !== thisUser.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            options = JSON.stringify(bodyJson.twData);
        } else {
            options = JSON.stringify({ is_paused: bodyJson.is_paused });
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${thisUser?.providerAccountId}&id=${raffle}`, {
            method: "PATCH",
            headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: "Bearer " + thisUser.access_token, "Content-type": "Application/Json" },
            body: options,
        });
        const resData = await res.json();
        if (bodyJson.twData) {
            await prisma.giveaways.update({
                where: { id: bodyJson.id },
                data: {
                    name: bodyJson.twData.title,
                    cost: bodyJson.twData.cost,
                    prize: bodyJson.prize,
                    streamLimitEnabled: bodyJson.twData.is_max_per_stream_enabled,
                    userLimitEnabled: bodyJson.twData.is_max_per_user_per_stream_enabled,
                    streamLimit: bodyJson.twData.max_per_stream,
                    userLimit: bodyJson.twData.max_per_user_per_stream,
                },
            }); // Return the db document
        }
        if (bodyJson.is_paused) {
            await prisma.giveaways.update({
                where: { id: bodyJson.id },
                data: { paused: bodyJson.is_paused },
            });
        }
        // Return whatever twitch sent back
        return NextResponse.json(resData, { status: res.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
