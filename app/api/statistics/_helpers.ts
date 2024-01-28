import { prisma } from "@/lib/prisma";

export async function AggregateGiveaway(gaId: string): Promise<boolean> {
    // Get the redemptions for this giveaway
    const everything = await prisma.giveawayRedemptions.findMany({
        where: { giveawayId: gaId },
        select: { viewer: { select: { name: true, id: true } } },
    });
    if (everything.length > 0) {
        const reducedData = everything.reduce((accumulator, entry) => {
            const viewerId = entry.viewer.id;

            // If viewerId is already in accumulator, increment count; otherwise, add a new entry
            if (accumulator.some((item) => item.viewerId === viewerId)) {
                accumulator.find((item) => item.viewerId === viewerId)!.count++;
            } else {
                accumulator.push({ viewerId, count: 1, giveawayId: gaId });
            }

            return accumulator;
        }, [] as { viewerId: string; count: number; giveawayId: string }[]);
        try {
            // Create the aggregated entry
            const res = await prisma.agregated.createMany({ data: reducedData });
            // Sanity check, did the query succeed?
            if (res.count === reducedData.length) return true;
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    } else {
        return false;
    }
}
