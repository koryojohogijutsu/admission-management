"use client";

import { useState, useEffect } from "react";
import QRScanner from "@/components/QRScanner";

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  // visitor_id がなければ生成して cookie に保存
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
      console.log("visitor_id generated:", visitorId);
    }
  }, []);

  const handleScan = async (classCode: string) => {
    setMessage("登録中...");

    const visitorId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="))
      ?.split("=")[1];

    if (!visitorId) {
      setMessage("❌ visitor_id がありません");
      setScanning(false);
      return;
    }

    const res = await fetch("/api/enter-class", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-visitor-id": visitorId, // API にも同じ ID を送る
      },
      body: JSON.stringify({ classCode }),
    });

    if (res.ok) {
      setMessage("✅ クラス入場完了！");
    } else {
      const data = await res.json();
      setMessage("❌ エラー: " + (data.error || "不明"));
    }

    setScanning(false);
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

      <p style={{ marginTop: "20px" }}>{message}</p>
    </main>
  );
}
