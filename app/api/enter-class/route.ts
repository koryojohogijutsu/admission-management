import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { classCode } = await req.json();

    if (!classCode) {
      return NextResponse.json({ error: "classCode missing" }, { status: 400 });
    }

    // x-visitor-id ヘッダから取得
    const visitorId = req.headers.get("x-visitor-id");
    if (!visitorId) {
      return NextResponse.json({ error: "visitor_id missing" }, { status: 400 });
    }

    // Supabase クライアントを Service Role Key で初期化
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // secret key を必ず使用
    );

    const { data, error } = await supabase
      .from("visits")
      .insert({
        visitor_id: visitorId,
        class_code: classCode,
        entered_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
