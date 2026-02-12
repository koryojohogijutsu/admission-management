"use client";

import { useState } from "react";
import QRScanner from "@/components/QRScanner";

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  const handleScan = async (classCode: string) => {
    setMessage("登録中...");

    const res = await fetch("/api/enter-class", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
