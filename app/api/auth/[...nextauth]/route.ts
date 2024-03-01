import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export interface TwitchToken {
    access_token: string;
    expires_in: number;
    token_type: string;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
