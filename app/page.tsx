"use client";

import { useState, useEffect } from "react";
import QRScanner from "@/components/QRScanner";

export default function Home() {
  const [scanning, setScanning] = useState(false);

  // visitor_id 生成
  useEffect(() => {
    const cookies = document.cookie.split("; ").reduce((acc: any, row) => {
      const [key, value] = row.split("=");
      acc[key] = value;
      return acc;
    }, {});

    let visitorId = cookies["visitor_id"];
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      document.cookie = `visitor_id=${visitorId}; path=/; SameSite=Lax`;
    }
  }, []);

  const handleScan = async (classCode: string) => {
    if (!scanning) return;   // 二重防止
    setScanning(false);      // まず止める（無限alert防止）

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
        alert("入場が完了しました");
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
          onClick={() => setScanning(true)}
          style={{ padding: "15px 30px", fontSize: "18px", cursor: "pointer" }}
        >
          QRを読み込む
        </button>
      )}

      {scanning && <QRScanner onScan={handleScan} />}
    </main>
  );
}
