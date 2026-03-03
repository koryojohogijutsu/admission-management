import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = Number(process.env.FESTIVAL_DAY || 1);
  const body = await req.json();

  const visitorId = req.headers.get("x-visitor-id");
  if (!visitorId) {
    return NextResponse.json({ error: "visitor_id missing" }, { status: 400 });
  }

  // visitor取得
  const { data: visitor } = await supabase
    .from("visitors")
    .select("*")
    .eq("visitor_id", visitorId)
    .single();

  if (!visitor) {
    return NextResponse.json({ error: "visitor not found" }, { status: 404 });
  }

  // 人数制限チェック
  const { count } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("visitor_id", visitorId)
    .eq("festival_day", today);

  if ((count ?? 0) >= visitor.vote_limit) {
    return NextResponse.json({ error: "投票上限に達しています" }, { status: 400 });
  }

  // 重複防止（UNIQUE制約前提）
  await supabase.from("votes").upsert(
    {
      visitor_id: visitorId,
      class_code: body.classCode,
      festival_day: today,
      voted_at: new Date().toISOString(),
    },
    { onConflict: "visitor_id,festival_day,class_code" }
  );

  return NextResponse.json({ success: true });
}
