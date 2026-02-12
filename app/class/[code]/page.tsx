"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ClassEntrancePage() {
  const params = useParams();
  const classCode = params.code;
  const [status, setStatus] = useState("クラス入場処理中…");

  const handleEnterClass = async () => {
    const visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) return setStatus("Visitor ID がありません");

    const { error } = await supabase
      .from("visits")
      .update({ class_code: classCode, entered_class: true })
      .eq("visitor_id", visitorId);

    if (error) setStatus("入場エラー: " + error.message);
    else setStatus(`クラス入場完了！クラス: ${classCode}`);
  };

  return (
    <div>
      <h1>{status}</h1>
      <button onClick={handleEnterClass}>クラス入場</button>
    </div>
  );
}
