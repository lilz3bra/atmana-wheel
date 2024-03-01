import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const banUnban = async (data: { state: boolean; viewerId: string; creator: string }) => {
        await prisma.streamViewers.update({
            where: {
                UniqueViewerForCreator: {
                    creatorId: data.creator,
                    viewerId: data.viewerId,
                },
            },
            data: { isBanned: !data.state },
        });
    };

    if (data.creator) {
        if (data.creator === session.user.id) {
            banUnban(data);
            return NextResponse.json({});
        } else {
            const validModerator = await prisma.moderator.findFirst({ where: { creatorId: data.creator, moderatorId: session.user.id } });
            if (validModerator !== null) {
                banUnban(data);
                return NextResponse.json({});
            } else {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }
    } else {
        return NextResponse.json({}, { status: 400 });
    }
}
