import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { classCode } = await req.json();
  const visitorId = req.headers.get("x-visitor-id");

  if (!visitorId) {
    return NextResponse.json({ error: "visitor_idなし" }, { status: 400 });
  }

  const { error } = await supabase
    .from("class_votes")
    .insert({
      class_code: classCode,
      visitor_id: visitorId,
    });

  if (error) {
    return NextResponse.json({ error: "投票済みです" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
