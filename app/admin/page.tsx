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
            visitor_id: {v.visitor_id} / class: {v.class_code ?? "-"} / 
            入場済み: {v.entered_class ? "はい" : "いいえ"} / 
            人数: {v.group_size}
          </li>
        ))}
      </ul>
    </div>
  );
}
