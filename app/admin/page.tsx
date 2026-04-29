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
        .order("entered_at", { ascending: false });
      setVisits(data ?? []);
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <a href="/" style={{ fontSize: "13px", color: "#888", textDecoration: "none" }}>← ホームに戻る</a>
      <h1>入場一覧</h1>
      <p style={{ color: "#666", fontSize: "14px" }}>{visits.length} 件</p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {visits.map((v, i) => (
          <li
            key={i}
            style={{ padding: "8px 0", borderBottom: "1px solid #eee", fontSize: "14px" }}
          >
            <span style={{ color: "#888", marginRight: "12px" }}>
              {v.entered_at ? new Date(v.entered_at).toLocaleString("ja-JP") : "-"}
            </span>
            クラス: <strong>{v.class_code ?? "-"}</strong>
            　visitor: {v.visitor_id?.slice(0, 8)}...
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "30px" }}>
        <a href="/admin/classes" style={{ marginRight: "16px" }}>クラス管理</a>
      </div>
    </div>
  );
}
