import { prisma } from "@/lib/prisma";

export async function AggregateGiveaway(gaId: string): Promise<boolean> {
    // Get the redemptions for this giveaway
    const redemptions = await prisma.giveawayRedemptions.findMany({
        where: { giveawayId: gaId },
        select: { viewerId: true },
    });

    // Aggregate the redemptions
    type CountMap = { viewerId: string; count: number };
    const viewerIdCountMap: CountMap[] = Array.from(
        redemptions.reduce((counted, entry) => {
            const { viewerId } = entry;
            if (counted.has(viewerId)) {
                // If the viewerId exists, increment its count
                counted.set(viewerId, counted.get(viewerId)! + 1);
            } else {
                // If the viewerId doesn't exist, add a new entry to the map
                counted.set(viewerId, 1);
            }
            return counted;
        }, new Map<string, number>())
    ).map(([viewerId, count]) => ({ viewerId, count }));

    try {
        // Create the aggregated entry
        const res = await prisma.agregated.createMany({ data: { giveawayId: gaId, participants: viewerIdCountMap } });
        // Sanity check, did the query succeed?
        if (res.count === 1) return true;
        console.log(res);
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}
