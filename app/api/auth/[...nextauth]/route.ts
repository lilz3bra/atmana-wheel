import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import TwitchProvider from "next-auth/providers/twitch";
import { prisma } from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

async function validateToken(token: JWT): Promise<JWT> {
    const response = await fetch("https://id.twitch.tv/oauth2/validate ", {
        method: "GET",
        headers: { Authorization: `OAuth ${token.access_token}` },
    });
    const j = await response.json();
    if (!j.login) {
        return refreshAccessToken(token);
    } else {
        return { ...token, validate_time: Date.now() + 3600000 };
    }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
    console.log("refreshing");
    const data = new FormData();
    data.append("client_id", process.env.NEXT_PUBLIC_TWITCH_API_KEY);
    data.append("client_secret", process.env.TWITCH_API_SECRET);
    data.append("grant_type", "refresh_token");
    data.append("refresh_token", token.refresh_token as string);
    try {
        const response = await fetch("https://id.twitch.tv/oauth2/token ", {
            method: "POST",
            body: data,
        });
        const j = await response.json();
        return {
            ...token,
            access_token: j.access_token,
            validate_time: Date.now() + 3600000,
            refreshToken: j.refresh_token,
        };
    } catch (error) {
        return { ...token, error: "Refresh Token Error" };
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    callbacks: {
        session: async ({ session, token }) => {
            if (session?.user) {
                session.user.id = token.uid;
                session.user.access_token = token.access_token;
                session.user.validate_time = token.validate_time;
                session.user.error = token.error;
            }
            return session;
        },
        jwt: async ({ account, user, token }) => {
            if (user) {
                token.uid = user.id;
                token.access_token = account?.access_token;
                token.validate_time = Date.now() + 3600000;
                token.refresh_token = account?.refresh_token;
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
