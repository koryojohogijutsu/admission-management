"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";

export default function EnterPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const isScanning = useRef(false); // 連続スキャン防止フラグ

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      /* verbose= */ false
    );

    const handleScan = async (decodedText: string) => {
      // 処理中、またはエラー表示直後はスキップ
      if (isScanning.current) return;
      isScanning.current = true;

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
          // エラー時は数秒後に再スキャン可能にする
          setTimeout(() => { isScanning.current = false; }, 2000);
          return;
        }

        alert("入場完了");
        // 成功後、別のページへ遷移させるなどの処理が一般的です
        // location.href = "/success"; 
      } catch {
        setErrorMessage("通信エラーが発生しました");
        setTimeout(() => { isScanning.current = false; }, 2000);
      }
    };

    scanner.render(handleScan, (error) => {
      // 読み取り失敗（カメラに何も映っていない等）は無視してOK
    });

    return () => {
      scanner.clear().catch((err) => console.error("Failed to clear scanner", err));
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>入場QR読み取り</h1>
      <div id="reader" style={{ width: "300px", margin: "auto" }} />
      {errorMessage && (
        <p style={{ color: "red", marginTop: "20px", fontWeight: "bold" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
