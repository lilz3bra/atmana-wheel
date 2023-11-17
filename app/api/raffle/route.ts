import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { createRewardsSub, deleteListener } from "../webhooks/helpers";

/** Create a new reward and save it to the db */
export async function PUT(req: Request) {
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
}

export async function GET(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get data stored in the jwt sent
    const thisUser = session.user;

    // Get the raffle id from req and make sure one was passed
    const raffle = req.nextUrl.searchParams.get("raffleId");
    if (!raffle || raffle === "") return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    /**
     * Recursive function to fetch all the redemptions
     * @param cursor    String returned by twitch if there are more pages to the response
     * @param accumulatedData   Object containing what we got and proccessed so far
     * @returns
     */
    // const getPages = async (cursor?: string, accumulatedData: UsersList = {}): Promise<UsersList> => {
    //     // Get the cursor, only works if there are more pages
    //     const after = typeof cursor === "undefined" ? "" : `&after=${cursor}`;
    //     // Make the request
    //     const res = await fetch(
    //         `${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards/redemptions?broadcaster_id=${thisUser?.providerAccountId}&reward_id=${raffle}&first=50&status=FULFILLED${after}`,
    //         {
    //             headers: { "Client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, Authorization: "Bearer " + thisUser.access_token },
    //         }
    //     );
    //     const d = await res.json();
    //     const data: any[] = d.data;
    //     if (d.error) {
    //         throw Error;
    //     }
    //     // Check if we got a valid response
    //     if (data && data.length > 0) {
    //         // Proccess and aggregate the new data
    //         const newData = sumData(data, accumulatedData);
    //         const updatedData = { ...accumulatedData, ...newData };
    //         // Check if there are more pages
    //         if (d.pagination && d.pagination.cursor) {
    //             // We need to go deeper
    //             return getPages(d.pagination.cursor, updatedData);
    //         } else {
    //             // We delved too deeply, we need to go back
    //             return updatedData;
    //         }
    //     } else {
    //         // We got nothing back, return whatever we had so far
    //         return accumulatedData;
    //     }
    // };
    // /**
    //  * Proccess the json sent by twitch
    //  * @param data The data[] sent in twitch's json
    //  * @param accumulatedData What we had accumulated so far
    //  * @returns
    //  */
    // const sumData = (data: any[], accumulatedData: UsersList): UsersList => {
    //     data.forEach((entry) => {
    //         // Accumulate every entry in the object
    //         if (entry.user_name) {
    //             accumulatedData[entry.user_name] = (accumulatedData[entry.user_name] || 0) + 1;
    //         }
    //     });
    //     return accumulatedData;
    // };
    const redemptions = await prisma.giveawayRedemptions.findMany({
        where: { giveawayId: raffle },
        include: {
            viewer: {
                select: {
                    name: true,
                },
            },
        },
    });

    const result: Record<string, number> = redemptions.reduce((acc, redemption) => {
        const viewerName = redemption.viewer?.name || "Unknown Viewer";

        if (acc[viewerName]) {
            acc[viewerName]++;
        } else {
            acc[viewerName] = 1;
        }

        return acc;
    }, {} as Record<string, number>);

    const arrayResult = Object.keys(result).map((viewerName) => ({ [viewerName]: result[viewerName] }));

    try {
        // const result: UsersList = await getPages();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({}, { status: 404 });
    }
}

export async function DELETE(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get data stored in the jwt sent
    const thisUser = session.user;

    // Get the raffle id from req and make sure one was passed
    const raffle = req.nextUrl.searchParams.get("raffleId");
    const id = req.nextUrl.searchParams.get("id");

    if (!!id && !!raffle) {
        // Send the delete request
        const res = await fetch(`${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${thisUser?.providerAccountId}&id=${raffle}`, {
            method: "DELETE",
            headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: "Bearer " + thisUser.access_token },
        });
        console.log(res.status);
        if (res.status === 204) {
            // Remove the twitch id from the database, so we know it doesnt exist anymore
            const modifiedEntry = await prisma.giveaways.update({ where: { twitchId: raffle, id: id }, data: { twitchId: "" } });
            // Remove the eventsub listener
            console.log(modifiedEntry);
            if (modifiedEntry.listenerId) deleteListener(modifiedEntry.listenerId);
        } else {
            console.log(res.status, res.statusText);
        }
        // Return 200 if deleted successfully, otherwise pass the code
        return NextResponse.json({}, { status: res.status === 204 ? 200 : res.status });
    }
}

export async function POST(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get data stored in the jwt sent
    const thisUser = session.user;

    // Get the raffle id from req and make sure one was passed
    const raffle = req.nextUrl.searchParams.get("raffleId");
    if (!raffle || raffle === "") return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const data = await req.json();
    // Make the db query
    const db = await prisma.giveaways.update({ where: { creatorId: thisUser.id, id: raffle }, data: data });
    // Send the results
    return NextResponse.json(db);
}

export async function PATCH(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get data stored in the jwt sent
    const thisUser = session.user;

    // Get the raffle id from req and make sure one was passed
    const raffle = req.nextUrl.searchParams.get("raffleId");
    if (!raffle || raffle === "") return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    // Get whatever was json sent in the body
    const op = await req.json();
    const options = JSON.stringify(op);
    // Send the request
    const res = await fetch(`${process.env.NEXT_PUBLIC_TWITCH_URL}/channel_points/custom_rewards?broadcaster_id=${thisUser?.providerAccountId}&id=${raffle}`, {
        method: "PATCH",
        headers: { "client-id": process.env.NEXT_PUBLIC_TWITCH_API_KEY, authorization: "Bearer " + thisUser.access_token, "Content-type": "Application/Json" },
        body: options,
    });
    const resData = await res.json();
    // Return whatever twitch sent back
    return NextResponse.json(resData, { status: res.status });
}
