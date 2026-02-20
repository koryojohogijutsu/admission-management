"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function EnterPage() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    const handleScan = async (decodedText: string) => {
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
          alert("エラー: " + data.error);
          return;
        }

        alert("入場が完了しました");

        scanner.clear(); // スキャン停止

      } catch (error) {
        alert("通信エラーが発生しました");
      }
    };

    scanner.render(handleScan, () => {});

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>入場QR読み取り</h1>
      <div id="reader" style={{ width: "300px", margin: "auto" }} />
    </div>
  );
}
