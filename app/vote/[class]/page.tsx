"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VotePage() {
  const params = useParams();
  const classCode = params.class as string;

  const [message, setMessage] = useState("読み込み中…");
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    const visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      setMessage("入場者IDがありません。校門でQRを読み取ってください。");
      return;
    }

    const checkEntry = async () => {
      const { data } = await supabase
        .from("visits")
        .select("*")
        .eq("visitor_id", visitorId)
        .eq("class_code", classCode)
        .single();

      if (!data) {
        setMessage("このクラスには入場していません。");
        return;
      }

      setMessage("投票可能です！");
    };

    checkEntry();
  }, [classCode]);

  const vote = async () => {
    const visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) return;

    const { error } = await supabase.from("votes").insert({
      class_code: classCode,
      visitor_id: visitorId,
      voted_at: new Date().toISOString(),
    });

    if (error) {
      setMessage("投票エラー: " + error.message);
    } else {
      setVoted(true);
      setMessage("投票完了！");
    }
  };

  return (
    <div>
      <h1>{message}</h1>
      {!voted && <button onClick={vote}>投票する</button>}
    </div>
  );
}
