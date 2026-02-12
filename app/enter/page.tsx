"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export default function EntrancePage() {
  const [status, setStatus] = useState("入場処理中…");
  const [groupSize, setGroupSize] = useState(1);

  useEffect(() => {
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = uuidv4();
      localStorage.setItem("visitor_id", visitorId);
    }
  }, []);

  const handleEnter = async () => {
    const visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) return setStatus("Visitor ID がありません");

    const { error } = await supabase.from("visits").insert({
      visitor_id: visitorId,
      group_size,
      entered_class: false,
    });

    if (error) setStatus("入場エラー: " + error.message);
    else setStatus(`入管完了！人数: ${groupSize}`);
  };

  return (
    <div>
      <h1>{status}</h1>
      <input
        type="number"
        min={1}
        value={groupSize}
        onChange={(e) => setGroupSize(Number(e.target.value))}
      />
      <button onClick={handleEnter}>入管完了</button>
    </div>
  );
}
