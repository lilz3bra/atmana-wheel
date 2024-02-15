import { prisma } from "@/lib/prisma";

interface modStatus {
    creator: boolean;
    moderator: boolean;
    invalid: boolean;
}

export async function checkModerator(creatorId: string | null, userId: string): Promise<modStatus> {
    const status: modStatus = { creator: false, moderator: false, invalid: false };
    // Extract the id from the request
    if (creatorId) {
        if (userId === creatorId) {
            // Moderating own channel
            status.creator = true;
        } else {
            // Is this user on the moderator's list?
            const validModerator = await prisma.moderator.findFirst({ where: { creatorId: creatorId, moderatorId: userId } });
            if (validModerator !== null) {
                status.moderator = true;
            } else {
                status.invalid = true;
            }
        }
    }
    return status;
}
