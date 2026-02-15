"use client";

import { useEffect, useState } from "react";
import QRScanner from "@/components/QRScanner";

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  // visitor_id がなければ生成
  useEffect(() => {
    const existing = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="));

    if (!existing) {
      const newId = crypto.randomUUID();
      document.cookie = `visitor_id=${newId}; path=/; max-age=31536000`;
      console.log("visitor_id generated:", newId);
    }
  }, []);

  const handleScan = async (classCode: string | null) => {
    if (!classCode) {
      setMessage("QRが読み取れませんでした");
      return;
    }

    try {
      setMessage("登録中...");

      const res = await fetch("/api/enter-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classCode }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ クラス入場完了！");
      } else {
        setMessage("❌ エラー: " + result.error);
      }

    } catch (err) {
      console.error(err);
      setMessage("❌ 通信エラー");
    }

    setScanning(false);
  };

  return (
    <main style={{ padding: "20px", textAlign: "center" }}>
      <h1>クラス入場</h1>

      {!scanning && (
        <button
          onClick={() => setScanning(true)}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          QRを読み込む
        </button>
      )}

      {scanning && <QRScanner onScan={handleScan} />}

      <p style={{ marginTop: "20px" }}>{message}</p>
    </main>
  );
}
