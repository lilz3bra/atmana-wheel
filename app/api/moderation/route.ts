import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    // Validate authorization
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const banUnban = async (data: { action: string; viewerId: string; creator: string }) => {
        let res;
        if (data.action === "ban") {
            res = await prisma.streamViewers.update({
                where: {
                    UniqueViewerForCreator: {
                        creatorId: data.creator,
                        viewerId: data.viewerId,
                    },
                },
                data: { isBanned: true },
            });
        }
        if (data.action === "unban") {
            res = await prisma.streamViewers.update({
                where: {
                    UniqueViewerForCreator: {
                        creatorId: data.creator,
                        viewerId: data.viewerId,
                    },
                },
                data: { isBanned: false },
            });
        }
        return NextResponse.json({ res });
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
