import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { voteCode } = await req.json();

  // 環境変数に保存しておく
  const correctVotecode = process.env.VOTE_CODE;

  if (!voteCode) {
    return NextResponse.json(
      { error: "投票コード未入力" },
      { status: 400 }
    );
  }

  if (voteCode !== correctVotecode) {
    return NextResponse.json(
      { error: "投票コードが違います" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
