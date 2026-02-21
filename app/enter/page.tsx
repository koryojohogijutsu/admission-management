"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Page() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (decodedText: string) => {
    if (isRunningRef.current) return; // 二重防止

    isRunningRef.current = true;

    try {
      const res = await fetch("/api/enter-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classCode: decodedText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        isRunningRef.current = false;
        return;
      }

      // ✅ 成功時
      setMessage(`${decodedText} 入場完了！`);
      setError(null);

      // カメラ停止
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }

    } catch {
      setError("通信エラーが発生しました");
      isRunningRef.current = false;
    }
  };

  useEffect(() => {
    if (scannerRef.current) return; // 二重起動防止

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {}
      )
      .then(() => {
        isRunningRef.current = false;
      })
      .catch(() => {
        setError("カメラを起動できませんでした");
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>入場QRスキャン</h1>

      <div id="reader" style={{ width: "300px", margin: "auto" }} />

      {/* 成功ポップ */}
      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#4caf50",
            color: "white",
            borderRadius: "8px",
          }}
        >
          {message}
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f44336",
            color: "white",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
