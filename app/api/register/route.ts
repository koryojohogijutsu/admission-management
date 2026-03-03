import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST() {

  const today = 2; // ← 手動 or envで切替（1 or 2）

  let visitorId = null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // visitorId無いなら新規
  visitorId = randomUUID();

  const { data: existing } = await supabase
    .from("visitors")
    .select("*")
    .eq("visitor_id", visitorId)
    .single();

  if (!existing) {
    // 新規
    await supabase.from("visitors").insert({
      visitor_id: visitorId,
      day1: today === 1,
      day2: today === 2,
      created_at: new Date().toISOString(),
    });
  } else {
    // 既存 → 両日処理
    if (today === 2) {
      await supabase
        .from("visitors")
        .update({ day2: true })
        .eq("visitor_id", visitorId);
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("visitor_id", visitorId, { path: "/" });

  return response;
}
