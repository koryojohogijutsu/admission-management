"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VotePage() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("visitor_id");
    if (!id) {
      setStatus("入場していません");
      return;
    }
    setVisitorId(id);

    const fetchClasses = async () => {
      const { data } = await supabase
        .from("visits")
        .select("class_code")
        .eq("visitor_id", id)
        .order("entered_at", { ascending: true });

      setClasses([...new Set(data?.map((v: any) => v.class_code))]);
    };

    fetchClasses();
  }, []);

  const vote = async () => {
    if (!visitorId || !selectedClass) return;

    const { error } = await supabase.from("votes").insert({
      visitor_id: visitorId,
      class_code: selectedClass,
    });

    if (error) {
      setStatus("投票エラー: " + error.message);
    } else {
      setStatus(`投票完了！クラス: ${selectedClass}`);
    }
  };

  return (
    <div>
      <h1>投票ページ</h1>
      {classes.length === 0 ? (
        <p>入場クラスがありません</p>
      ) : (
        <>
          <select
            onChange={(e) => setSelectedClass(e.target.value)}
            value={selectedClass ?? ""}
          >
            <option value="">選択してください</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button onClick={vote} disabled={!selectedClass}>
            投票
          </button>
          <p>{status}</p>
        </>
      )}
    </div>
  );
}
