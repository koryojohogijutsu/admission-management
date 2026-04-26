"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyQRPage() {
  const router = useRouter();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // visitor_id を取得
    const id = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="))
      ?.split("=")[1];

    if (!id) {
      router.push("/register");
      return;
    }

    setVisitorId(id);

    // QRコード生成
    QRCode.toDataURL(id, { width: 280, margin: 2 })
      .then((url) => setQrDataUrl(url))
      .catch(console.error);

    // Supabase Realtime：自分のvisitor_idへの入場記録をリアルタイムで監視
    const channel = supabase
      .channel(`visits:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "visits",
          filter: `visitor_id=eq.${id}`,
        },
        (payload) => {
          const classCode = payload.new.class_code;
          setNotification(`✅ 読み取られました！\nクラス: ${classCode}`);
          setTimeout(() => setNotification(null), 4000);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [router]);

  return (
    <main style={{ padding: "30px 20px", textAlign: "center" }}>
      <h1>あなたのQRコード</h1>
      <p style={{ color: "#555", fontSize: "14px" }}>
        係員に向けてこの画面を見せてください
      </p>

      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt="QRコード"
          style={{ margin: "20px auto", display: "block", borderRadius: "8px" }}
        />
      ) : (
        <p>生成中...</p>
      )}

      <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
        ID: {visitorId}
      </p>

      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: "30px",
          padding: "10px 24px",
          fontSize: "15px",
          cursor: "pointer",
          backgroundColor: "white",
          color: "#555",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      >
        ホームに戻る
      </button>
    </main>
  );
}
