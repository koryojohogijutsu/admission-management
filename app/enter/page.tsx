"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Page() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);      // カメラ起動済みか
  const scannedRef = useRef(false);      // 既に読み取ったか

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (decodedText: string) => {
    if (scannedRef.current) return;   // 2回目以降無視
    scannedRef.current = true;

    try {
      const res = await fetch("/api/enter-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode: decodedText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        scannedRef.current = false;   // エラー時だけ再読み取り許可
        return;
      }

      setMessage(`${decodedText} 入場完了！`);
      setError(null);

      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }

    } catch {
      setError("通信エラーが発生しました");
      scannedRef.current = false;
    }
  };

  useEffect(() => {
    if (startedRef.current) return;  // StrictMode対策
    startedRef.current = true;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      handleScan
    ).catch(() => {
      setError("カメラを起動できませんでした");
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>入場QRスキャン</h1>

      <div id="reader" style={{ width: "300px", margin: "auto" }} />

      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#4caf50",
            color: "white",
            borderRadius: "8px",
            fontSize: "18px",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
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
