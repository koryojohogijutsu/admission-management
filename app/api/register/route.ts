import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();

  // cookieからvisitor_idを取得、なければ新規生成
  const cookie = req.headers.get("cookie");
  const cookieVisitorId = cookie
    ?.split("; ")
    .find((row) => row.startsWith("visitor_id="))
    ?.split("=")[1];

  const visitorId = cookieVisitorId ?? randomUUID();

  // 既存チェック
  const { data: existing } = await supabase
    .from("visitors")
    .select("*")
    .eq("visitor_id", visitorId)
    .single();

  if (!existing) {
    // 新規登録
    await supabase.from("visitors").insert({
      visitor_id: visitorId,
      group_size: body.groupSize,
      transport: body.transport,
      created_at: new Date().toISOString(),
    });
  }
  // 既存の場合は何もしない（再登録不要）

  const response = NextResponse.json({ success: true });
  response.cookies.set("visitor_id", visitorId, { path: "/", sameSite: "lax" });

  return response;
}
