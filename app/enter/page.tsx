"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function EnterPage() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    const handleScan = async (decodedText: string) => {
      console.log("QR成功:", decodedText);
      alert("QRは読み取れている");

      try {
        const res = await fetch("/api/enter-class", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ classCode: decodedText }),
        });

        console.log("status:", res.status);

        const text = await res.text();
        console.log("response:", text);

        alert("APIまで到達している");

      } catch (error) {
        console.error(error);
        alert("通信エラー");
      }
    };

    scanner.render(handleScan, (err) => {
      console.log("scan失敗:", err);
    });

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
