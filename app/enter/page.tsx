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
      setErrorMessage(""); // エラー初期化

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

        // ✅ 成功時のみalert
        alert("入場完了");

      } catch (error) {
        setErrorMessage("通信エラーが発生しました");
      }
    };

    scanner.render(handleScan);

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
