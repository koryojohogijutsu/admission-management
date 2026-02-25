"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import QRScanner from "@/components/QRScanner";

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  // ★ 追加：連続実行防止フラグ
  const hasScanned = useRef(false);

  const handleScan = async (classCode: string) => {
    // すでに実行済みなら何もしない
    if (hasScanned.current) return;
    hasScanned.current = true;

    setScanning(false); // ← まず止める（超重要）

    const visitorId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="))
      ?.split("=")[1];

    if (!visitorId) {
      alert("visitor_id がありません");
      return;
    }

    try {
      const res = await fetch("/api/enter-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-visitor-id": visitorId,
        },
        body: JSON.stringify({ classCode }),
      });

      if (res.ok) {
        alert("入場が完了しました：" + classCode);
      } else {
        const data = await res.json();
        alert("エラー: " + (data.error || "不明"));
      }
    } catch {
      alert("通信エラーが発生しました");
    }
  };

  return (
    <main style={{ padding: "20px", textAlign: "center" }}>
      <h1>クラス入場</h1>

      {!scanning && (
        <button
          onClick={() => {
            hasScanned.current = false; // ← 再スキャン時にリセット
            setScanning(true);
          }}
          style={{ padding: "15px 30px", fontSize: "18px", cursor: "pointer" }}
        >
          QRを読み込む
        </button>
      )}

      {scanning && <QRScanner onScan={handleScan} />}

      <div style={{ marginTop: "40px" }}>
        <button
          onClick={() => router.push("/vote")}
          style={{
            padding: "12px 25px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          投票はこちら
        </button>
      </div>
    </main>
  );
}
