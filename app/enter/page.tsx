"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";

export default function EnterPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const isProcessing = useRef(false); // 連続リクエスト防止用

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      /* verbose= */ false
    );

    const handleScan = async (decodedText: string) => {
      // 処理中ならスキップ
      if (isProcessing.current) return;
      
      isProcessing.current = true;
      setErrorMessage("");

      try {
        const res = await fetch("/api/enter-class", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classCode: decodedText }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "エラーが発生しました");
        } else {
          alert("入場完了");
        }
      } catch {
        setErrorMessage("通信エラーが発生しました");
      } finally {
        // 1.5秒後にスキャン再開を許可（連続検知防止）
        setTimeout(() => {
          isProcessing.current = false;
        }, 1500);
      }
    };

    scanner.render(handleScan, () => {});

    return () => {
      scanner.clear().catch((error) => console.error("Scanner clear failed", error));
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>入場QR読み取り</h1>
      <div id="reader" style={{ width: "300px", margin: "auto" }} />
      {errorMessage && (
        <p style={{ color: "red", marginTop: "20px" }}>{errorMessage}</p>
      )}
    </div>
  );
}
