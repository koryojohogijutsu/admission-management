"use client";

import { useState, useEffect } from "react";
import QRScanner from "@/components/QRScanner";
import { v4 as uuidv4 } from "uuid"; // UUID生成用

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  // visitor_id が無ければ生成
  useEffect(() => {
    const existing = localStorage.getItem("visitor_id");
    if (!existing) {
      const newId = uuidv4();
      localStorage.setItem("visitor_id", newId);
      console.log("新しいvisitor_id生成:", newId);
    }
  }, []);

  const handleScan = async (classCode: string) => {
    setMessage("登録中...");

    const visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      setMessage("❌ visitor_id がありません");
      return;
    }

    const res = await fetch("/api/enter-class", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-visitor-id": visitorId,
      },
      body: JSON.stringify({ classCode }),
    });

    if (res.ok) {
      setMessage("✅ クラス入場完了！");
    } else {
      setMessage("❌ エラーが発生しました");
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
