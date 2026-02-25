"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRScanner from "@/components/QRScanner";

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  // visitor_id がなければ生成
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
        alert("入場完了：" + classCode);
      } else {
        const data = await res.json();
        alert("エラー：" + (data.error || "不明"));
      }
    } catch (err) {
      alert("通信エラー");
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

      {/* 投票ページへ遷移 */}
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
