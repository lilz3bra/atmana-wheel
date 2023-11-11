import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for");
    console.log(ip);
    return NextResponse.json({ ip: ip });
}
