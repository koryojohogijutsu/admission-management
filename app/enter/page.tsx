"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";

export default function EnterPage() {
  const [statusMessage, setStatusMessage] = useState({ text: "", isError: false });
  const isProcessing = useRef(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // マウント時に要素が存在するか確認
    const container = document.getElementById("reader");
    if (!container || scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );
    scannerRef.current = scanner;

    const handleScan = async (decodedText: string) => {
      if (isProcessing.current) return;
      isProcessing.current = true;
      
      setStatusMessage({ text: "照合中...", isError: false });

      try {
        const res = await fetch("/api/enter-class", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classCode: decodedText }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatusMessage({ text: `エラー: ${data.error || "入場できません"}`, isError: true });
        } else {
          setStatusMessage({ text: "✅ 入場完了しました！", isError: false });
          
          // 成功時、3秒後にメッセージを消して次の人を待ち受ける
          setTimeout(() => {
            setStatusMessage({ text: "", isError: false });
          }, 3000);
        }
      } catch (err) {
        setStatusMessage({ text: "❌ 通信エラーが発生しました", isError: true });
      } finally {
        // 1.5秒後にスキャン判定のみ再開
        setTimeout(() => {
          isProcessing.current = false;
        }, 1500);
      }
    };

    scanner.render(handleScan, () => {});

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().then(() => {
          scannerRef.current = null;
        }).catch((err) => console.error("Scanner clear failed", err));
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "20px" }}>
        入場QRスキャナー
      </h1>
      
      <div id="reader" style={{ width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #ddd" }} />

      {statusMessage.text && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "8px",
          backgroundColor: statusMessage.isError ? "#ffebee" : "#e8f5e9",
          color: statusMessage.isError ? "#c62828" : "#2e7d32",
          fontWeight: "bold",
          transition: "all 0.3s ease"
        }}>
          {statusMessage.text}
        </div>
      )}
    </div>
  );
}
