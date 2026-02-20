"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";

export default function EnterPage() {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    const handleScan = async (decodedText: string) => {
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
          return;
        }

        // ✅ 成功時のみ
        alert("入場完了");

      } catch {
        setErrorMessage("通信エラーが発生しました");
      }
    };

    // ★ 第2引数を追加（必須）
    scanner.render(
      handleScan,
      () => {} // 読み取り失敗時は何もしない
    );

    return () => {
      scanner.clear().catch(() => {});
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
