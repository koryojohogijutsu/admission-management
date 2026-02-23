"use client";

import { useState, useEffect } from "react";
import QRScanner from "@/components/QRScanner";

export default function Home() {
  const [scanning, setScanning] = useState(false);

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
    const visitorId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="))
      ?.split("=")[1];

    if (!visitorId) {
      alert("visitor_id がありません");
      setScanning(false);
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
        alert("クラス入場完了！");
      } else {
        const data = await res.json();
        alert("エラー: " + (data.error || "不明なエラー"));
      }
    } catch (error) {
      alert("通信エラーが発生しました");
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
    </main>
  );
}
