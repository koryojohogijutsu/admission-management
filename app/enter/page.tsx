"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Page() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const scanningRef = useRef(false);

  const [error, setError] = useState<string | null>(null);

  const handleScan = async (decodedText: string) => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    try {
      const res = await fetch("/api/enter-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode: decodedText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        scanningRef.current = false;
        return;
      }

      alert(`${decodedText} 入場完了！`);

      if (scannerRef.current) {
        // stopはPromiseを返すのでawaitしてOK
        await scannerRef.current.stop();
        // clearはvoidなのでawaitを外す
        scannerRef.current.clear();
        scannerRef.current = null;
      }

    } catch {
      setError("通信エラーが発生しました");
      scanningRef.current = false;
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        handleScan,
        () => {}
      )
      .catch(() => {
        setError("カメラを起動できませんでした");
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        // .catch() を削除
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>入場QRスキャン</h1>
      <div id="reader" style={{ width: "300px", margin: "auto" }} />
      {error && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f44336", color: "white", borderRadius: "8px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
