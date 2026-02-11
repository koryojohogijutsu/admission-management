"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("visits")
        .select("*")
        .order("created_at", { ascending: false });

      setVisits(data ?? []);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>入場一覧</h1>
      <ul>
        {visits.map((v, i) => (
          <li key={i}>
            {v.class_code} / {v.visitor_id}
          </li>
        ))}
      </ul>
    </div>
  );
}
