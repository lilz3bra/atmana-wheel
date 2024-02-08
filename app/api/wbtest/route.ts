import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ var: process.env.NEXT_PUBLIC_REDIRECT_URL });
}
