"use client";

import { useState, useRef, useEffect } from "react";
import QRScanner from "@/components/QRScanner";
import { useRouter } from "next/navigation";

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const [alerted, setAlerted] = useState(false);
  const hasScanned = useRef(false);
  const router = useRouter();

  // QRを読み込んだとき
  const handleScan = async (classCode: string) => {
    if (hasScanned.current) return; // 二重読み取り防止
    hasScanned.current = true;

    setScanning(false);

    // visitor_idを取得
    let visitorId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="))
      ?.split("=")[1];

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      document.cookie = `visitor_id=${visitorId}; path=/`;
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
        // cookieに保存
        document.cookie = `class_code=${classCode}; path=/`;

        if (!alerted) {
          alert("入場完了: " + classCode);
          setAlerted(true);
        }
      } else {
        const data = await res.json();
        alert("エラー: " + (data.error || "不明"));
        hasScanned.current = false;
      }
    } catch {
      alert("通信エラーが発生しました");
      hasScanned.current = false;
    }
  };

  // 投票ページに遷移
  const goToVote = () => {
    router.push("/vote-password"); // パスワード確認ページ
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

      {/* QRを読み込んだら投票ページへ */}
      {document.cookie.includes("class_code") && !scanning && (
        <button
          onClick={goToVote}
          style={{
            marginTop: "20px",
            padding: "15px 30px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          投票はこちら
        </button>
      )}
    </main>
  );
}
