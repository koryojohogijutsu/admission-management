import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing");
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: Request) {
  const supabase = getSupabase();

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
