import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabaseクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 今日が何日目か自動判定する（テスト用にtoday固定も可能）
function getFestivalDay() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const DAY1 = process.env.DAY1 || "2026-03-01";
  const DAY2 = process.env.DAY2 || "2026-03-02";

  if (todayStr === DAY1) return 1;
  if (todayStr === DAY2) return 2;
  return null;
}

// POST: 投票
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const visitorId = req.headers.get("x-visitor-id");
    if (!visitorId) return NextResponse.json({ error: "visitor_id required" }, { status: 400 });

    const today = getFestivalDay();
    if (!today) return NextResponse.json({ error: "今日は投票できません" }, { status: 400 });

    // visitor情報取得
    const { data: visitor, error: visitorError } = await supabase
      .from("visitors")
      .select("*")
      .eq("visitor_id", visitorId)
      .single();
    if (visitorError || !visitor) return NextResponse.json({ error: "visitor not found" }, { status: 400 });

    if (today === 1) {
      // 1日目はinsert
      await supabase.from("votes").insert({
        visitor_id: visitorId,
        class_code: body.classCode,
        festival_day: 1,
        voted_at: new Date().toISOString(),
      });
    }

    if (today === 2) {
      if (visitor.day1) {
        // 両日来場者 → 1日目の投票を更新
        await supabase
          .from("votes")
          .update({ class_code: body.classCode, voted_at: new Date().toISOString() })
          .eq("visitor_id", visitorId)
          .eq("festival_day", 1);
      } else {
        // 2日目のみ → insert
        await supabase.from("votes").insert({
          visitor_id: visitorId,
          class_code: body.classCode,
          festival_day: 2,
          voted_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Vote API error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// GET: 管理者用集計API
export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("votes")
      .select("class_code, festival_day, count:visitor_id", { count: "exact" })
      .group("class_code,festival_day");

    if (error) throw error;

    // 日別に集計
    const result: Record<string, { day1: number; day2: number }> = {};
    data.forEach((row: any) => {
      if (!result[row.class_code]) result[row.class_code] = { day1: 0, day2: 0 };
      if (row.festival_day === 1) result[row.class_code].day1 = row.count;
      if (row.festival_day === 2) result[row.class_code].day2 = row.count;
    });

    return NextResponse.json({ votes: result });
  } catch (err: any) {
    console.error("Admin vote summary error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
