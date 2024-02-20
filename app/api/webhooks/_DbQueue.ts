import { prisma } from "@/lib/prisma";

const queue: Record<string, number> = {};
const locked: Record<string, boolean> = {};

function addToQueue(uniquePair: string) {
    if (!queue[uniquePair]) {
        // If the unique pair isn't in the queue, we initialize it
        queue[uniquePair] = 0;
    }
    // Add to the queue count
    queue[uniquePair] += 1;
}

function isLocked(uniquePair: string): boolean {
    return !!locked[uniquePair];
}

async function processQueue(uniquePair: string): Promise<void> {
    if (isLocked(uniquePair)) {
        // If the DB entry is locked
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retrying, in case more requests are arriving
        await processQueue(uniquePair);
    }
    if (!queue[uniquePair]) return; // If there is nothing for this pair in the queue we return without doing anything

    const item = queue[uniquePair];
    delete queue[uniquePair];

    locked[uniquePair] = true; // Lock this item
    const [giveawayId, viewerId] = splitIds(uniquePair);
    try {
        await prisma.giveawayRedemptions.upsert({
            where: { ViewerRedemptions: { viewerId: viewerId, giveawayId: giveawayId } },
            update: { ammount: { increment: item } },
            create: { viewerId: viewerId, giveawayId: giveawayId },
        });
        delete locked[uniquePair];
        return;
    } catch (error) {
        console.log(error, uniquePair, queue);
        delete locked[uniquePair];
    }
}

function joinIds(giveawayId: string, viewerId: string): string {
    return `${giveawayId}:${viewerId}`;
}
function splitIds(uniquePair: string): [string, string] {
    return uniquePair.split(":") as [string, string];
}

export default async function QueueOperation(giveawayId: string, viewerId: string) {
    const pair = joinIds(giveawayId, viewerId);
    addToQueue(pair);
    await processQueue(pair);
}
