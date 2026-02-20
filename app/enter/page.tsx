"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";

export default function EnterPage() {
  const [statusMessage, setStatusMessage] = useState({ text: "", isError: false });
  const isProcessing = useRef(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // 既に初期化されている場合は何もしない（React 18の2重実行対策）
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    const handleScan = async (decodedText: string) => {
      if (isProcessing.current) return;
      isProcessing.current = true;
      
      setStatusMessage({ text: "照合中...", isError: false });

      try {
        const res = await fetch("/api/enter-class", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classCode: decodedText }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatusMessage({ 
            text: `エラー: ${data.error || "入場できません"}`, 
            isError: true 
          });
        } else {
          setStatusMessage({ text: "✅ 入場完了しました！", isError: false });
        }
      } catch (err) {
        setStatusMessage({ text: "❌ 通信エラーが発生しました", isError: true });
      } finally {
        // 2秒後に次のスキャンを可能にする
        setTimeout(() => {
          isProcessing.current = false;
          // 成功メッセージをクリアしたい場合はここで行う
        }, 2000);
      }
    };

    scanner.render(handleScan, (error) => {
      // 読み取り失敗（QRが枠に入っていない等）はログを出さない
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().then(() => {
          scannerRef.current = null;
        }).catch((err) => console.error("Scanner clear failed", err));
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>入場QRスキャナー</h1>
      
      {/* 読み取りエリア */}
      <div id="reader" style={{ width: "100%", borderRadius: "10px", overflow: "hidden" }} />

      {/* ステータス表示 */}
      {statusMessage.text && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "8px",
          backgroundColor: statusMessage.isError ? "#ffebee" : "#e8f5e9",
          color: statusMessage.isError ? "#c62828" : "#2e7d32",
          fontWeight: "bold",
          border: `1px solid ${statusMessage.isError ? "#ef9a9a" : "#a5d6a7"}`
        }}>
          {statusMessage.text}
        </div>
      )}

      <p style={{ marginTop: "15px", fontSize: "0.9rem", color: "#666" }}>
        QRコードをカメラにかざしてください
      </p>
    </div>
  );
}
