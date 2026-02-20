import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("BODY:", body);

    const visitorId = req.headers.get("x-visitor-id");
    console.log("VISITOR ID:", visitorId);

    console.log("ENV URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("ENV KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING");

    if (!visitorId) {
      return NextResponse.json({ error: "visitor_id missing" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("visits").insert({
      visitor_id: visitorId,
      class_code: body.classCode,
      entered_at: new Date().toISOString(),
    });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
