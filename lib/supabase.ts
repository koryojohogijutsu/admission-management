// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!; // サーバー用
// クライアント用に anon key を使う場合もある
export const supabase = createClient(supabaseUrl, supabaseKey);
