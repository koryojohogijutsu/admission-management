import { NextResponse } from "next/server";

const VOTECODE = process.env.VOTE_CODE || "kakou";

export async function POST(req: Request) {
  const { voteCode } = await req.json();

  if (voteCode === VOTECODE) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Invalid Vote Code" },
    { status: 401 }
  );
}
