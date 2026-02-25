// app/api/verify-password/route.ts
import { NextRequest, NextResponse } from "next/server";

// ここで固定パスワードを管理（将来的にDBに置き換え可能）
const PASSWORD = process.env.VOTE_PASSWORD || "kakou";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ ok: false, error: "パスワード未入力" });
    }

    if (password === PASSWORD) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ ok: false, error: "パスワードが違います" });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "通信エラー" });
  }
}
