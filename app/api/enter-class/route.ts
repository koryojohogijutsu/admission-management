import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { classCode } = await req.json();

    if (!classCode) {
      return NextResponse.json({ error: "classCode missing" }, { status: 400 });
    }

    const visitorId = cookies().get("visitor_id")?.value;

    if (!visitorId) {
      return NextResponse.json({ error: "visitor_id missing" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { error } = await supabase.from("visits").insert({
      visitor_id: visitorId,
      class_code: classCode,
      entered_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
