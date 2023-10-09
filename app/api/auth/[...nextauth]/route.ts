import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import TwitchProvider from "next-auth/providers/twitch";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    callbacks: {
        session: async ({ session, token }) => {
            if (session?.user) {
                session.user.id = token.uid;
            }
            return session;
        },
        jwt: async ({ user, token }) => {
            if (user) {
                token.uid = user.id;
            }
            return token;
        },
    },
    session: { strategy: "jwt" },
    providers: [
        TwitchProvider({
            clientId: process.env.NEXT_PUBLIC_TWITCH_API_KEY!,
            clientSecret: process.env.TWITCH_API_SECRET!,
            authorization: { params: { scope: "openid user:read:email channel:manage:redemptions" }, url: "http://localhost:8080/mock/auth" },
        }),
    ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
