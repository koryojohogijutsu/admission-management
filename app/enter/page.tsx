"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Page() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const scanningRef = useRef(false);

  const [error, setError] = useState<string | null>(null);

  // QR読み取り成功時
  const handleScan = async (decodedText: string) => {
    if (scanningRef.current) return; // 二重実行防止
    scanningRef.current = true;

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
        scanningRef.current = false;
        return;
      }

      // ✅ 成功時：これだけ alert
      alert(`${decodedText} 入場完了！`);

      // カメラ停止
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }

    } catch {
      setError("通信エラーが発生しました");
      scanningRef.current = false;
    }
  };

  useEffect(() => {
    if (startedRef.current) return; // 二重起動防止
    startedRef.current = true;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        handleScan,
        () => {} // 必須のエラーコールバック
      )
      .catch(() => {
        setError("カメラを起動できませんでした");
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>入場QRスキャン</h1>

      <div id="reader" style={{ width: "300px", margin: "auto" }} />

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
