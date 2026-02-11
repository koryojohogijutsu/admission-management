"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export default function EnterPage() {
  const params = useParams();
  const rawClass = params.class as string;

  const [status, setStatus] = useState("入場処理中…");

  useEffect(() => {
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = uuidv4();
      localStorage.setItem("visitor_id", visitorId);
    }

    const insertVisit = async () => {
      // クラスコード変換（classes テーブルがある場合）
      const { data } = await supabase
        .from("classes")
        .select("label")
        .eq("code", rawClass)
        .single();

      const classCode = data?.label ?? rawClass;

      const { error } = await supabase.from("visits").insert({
        class_code: classCode,
        visitor_id: visitorId,
      });

      if (error) {
        if (error.code === "23505") {
          setStatus("すでに入場済みです");
        } else {
          setStatus("入場エラー: " + error.message);
        }
      } else {
        setStatus(`入場完了！クラス: ${classCode}`);
      }
    };

    insertVisit();
  }, [rawClass]);

  return <h1>{status}</h1>;
}
