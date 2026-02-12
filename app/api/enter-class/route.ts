import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { classCode } = await req.json();

  const cookieStore = cookies();
  const visitorId = cookieStore.get("visitor_id")?.value;

  if (!visitorId) {
    return NextResponse.json({ error: "visitor not found" }, { status: 400 });
  }

  const { error } = await supabase.from("visits").insert({
    visitor_id: visitorId,
    class_code: classCode,
    entered_at: new Date(),
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
