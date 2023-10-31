import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const secret = "asdasdasdasd"; //process.env.NEXT_PUBLIC_API_KEY;

    // const message = getHmacMessage(req);

    // const hmac = HMAC_PREFIX + getHmac(secret, message);

    // console.log(req);
    const msg = await req.text();
    console.log(msg);
    return NextResponse.json({}, { status: 200 });
}

export async function PUT(req: Request) {
    const secret = process.env.TWITCH_API_SECRET;

    const eventSubCreateUrl = "";
    const options = {};
    const result = await fetch(eventSubCreateUrl, options);

    return NextResponse.json({});
}
