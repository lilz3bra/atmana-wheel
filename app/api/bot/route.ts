import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        console.log(req.nextUrl.href);
        const sender = req.nextUrl.searchParams.get("sender");
        const channel = req.nextUrl.searchParams.get("channel");
        if (!sender || !channel) {
            console.log(req.nextUrl.searchParams);
            return new Response("Something happened, sorry ¯(°_o)/¯", { status: 500 });
        }

        const tickets = await prisma.giveawayRedemptions.findMany({
            where: {
                viewer: { name: { mode: "insensitive", equals: sender } },
                giveaway: { creator: { name: channel }, twitchId: { not: "" } },
            },
            select: { ammount: true, giveaway: { select: { name: true } } },
            orderBy: { giveaway: { createdAt: "desc" } },
        });
        if (tickets.length === 0) {
            console.log(req.nextUrl.searchParams);
            return new Response(`@${sender} you haven't entered any (active) giveaways`, { status: 500 });
        }
        const message = tickets.reduce((acc, t) => {
            if (acc !== `@${sender} you have these tickets: `) acc += "  |  ";
            const msg = t.giveaway.name + ": " + t.ammount;
            acc += msg;
            return acc;
        }, `@${sender} you have these tickets: `);
        return new Response(message, { status: 200 });
    } catch (error: any) {
        console.log(error.message);
        return new Response("Something happened, sorry ¯(°_o)/¯", { status: 500 });
    }
}
