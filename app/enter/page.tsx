"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

export default function EnterPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false); // 二重防止

  useEffect(() => {
    if (scannerRef.current) return; // ★ 二重起動防止

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scannerRef.current = scanner;

    const handleScan = async (decodedText: string) => {
      if (isScanning) return; // ★ 二重読み取り防止
      setIsScanning(true);
      setErrorMessage("");

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
          setErrorMessage(data.error || "エラーが発生しました");
          setIsScanning(false);
          return;
        }

        // ✅ 読み取った文字列付きポップ
        alert(`${decodedText} 入場完了！`);

        // 読み取り停止（完全停止）
        await scanner.clear();
        scannerRef.current = null;

      } catch {
        setErrorMessage("通信エラーが発生しました");
        setIsScanning(false);
      }
    };

    scanner.render(
      handleScan,
      () => {} // エラー無視
    );

    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>入場QR読み取り</h1>
      <div id="reader" style={{ width: "300px", margin: "auto" }} />

      {errorMessage && (
        <p style={{ color: "red", marginTop: "20px" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
