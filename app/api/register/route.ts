import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = Number(process.env.FESTIVAL_DAY || 1);
  const body = await req.json();

  // cookieから取得
  const cookie = req.headers.get("cookie");
  const cookieVisitorId = cookie
    ?.split("; ")
    .find((row) => row.startsWith("visitor_id="))
    ?.split("=")[1];

  let visitorId = cookieVisitorId ?? randomUUID();

  const { data: existing } = await supabase
    .from("visitors")
    .select("*")
    .eq("visitor_id", visitorId)
    .single();

  if (!existing) {
    // 初回登録
    await supabase.from("visitors").insert({
      visitor_id: visitorId,
      day1: today === 1,
      day2: today === 2,
      vote_limit: body.voteLimit, // アンケート人数
      created_at: new Date().toISOString(),
    });
  } else {
    // 2回目来場
    if (today === 2 && !existing.day2) {
      await supabase
        .from("visitors")
        .update({ day2: true })
        .eq("visitor_id", visitorId);
    }

    return NextResponse.json({
      success: true,
      secondVisit: true,
      voteLimit: existing.vote_limit,
    });
  }

  const response = NextResponse.json({
    success: true,
    secondVisit: false,
    voteLimit: body.voteLimit,
  });

  response.cookies.set("visitor_id", visitorId, { path: "/" });

  return response;
}
