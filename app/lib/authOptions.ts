import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import TwitchProvider from "next-auth/providers/twitch";
import { prisma } from "@/lib/prisma";
import { validateToken } from "@/lib/validateToken";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    callbacks: {
        session: async ({ session, token }) => {
            if (session?.user) {
                session.user.id = token.uid;
                session.user.access_token = token.access_token;
                session.user.validate_time = token.validate_time;
                session.user.error = token.error;
                session.user.providerAccountId = token.providerAccountId;
            }
            return session;
        },
        jwt: async ({ account, user, token }) => {
            if (user) {
                token.uid = user.id;
                token.access_token = account?.access_token;
                token.validate_time = Date.now() + 3600000;
                token.refresh_token = account?.refresh_token;
                token.providerAccountId = account?.providerAccountId;
            }
            if ((token.validate_time as number) < Date.now()) {
                token = await validateToken(token);
            }
            return token;
        },
    },
    session: { strategy: "jwt", maxAge: 36000000 },
    providers: [
        TwitchProvider({
            clientId: process.env.NEXT_PUBLIC_TWITCH_API_KEY!,
            clientSecret: process.env.TWITCH_API_SECRET!,
            authorization: { params: { scope: "openid user:read:email channel:manage:redemptions" } },
        }),
    ],
};
