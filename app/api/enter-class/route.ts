import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { classCode, peopleCount } = await req.json();
    const visitorId = req.headers.get("x-visitor-id");

    if (!visitorId) {
      return NextResponse.json({ error: "visitor_idなし" }, { status: 400 });
    }

    if (!peopleCount || peopleCount < 1) {
      return NextResponse.json({ error: "人数が不正" }, { status: 400 });
    }

    // 同じ行を人数分作る
    const rows = Array.from({ length: peopleCount }).map(() => ({
      class_code: classCode,
      visitor_id: visitorId,
    }));

    const { error } = await supabase
      .from("survey_responses")
      .insert(rows);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
