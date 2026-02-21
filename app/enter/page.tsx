"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function ScannerComponent() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false); // 二重起動防止

  useEffect(() => {
    const startScanner = async () => {
      if (isRunningRef.current) return; // 二重起動防止
      isRunningRef.current = true;

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            try {
              // 読み取り停止
              await scanner.stop();
              await scanner.clear();
              scannerRef.current = null;
              isRunningRef.current = false;

              // 成功ポップ
              alert(`${decodedText} 入場完了！`);
            } catch (err) {
              console.error("停止エラー:", err);
            }
          },
          (errorMessage) => {
            // 読み取り失敗時（表示しない）
          }
        );
      } catch (err) {
        console.error("カメラ起動エラー:", err);
        isRunningRef.current = false;
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
        isRunningRef.current = false;
      }
    };
  }, []);

  return <div id="reader" style={{ width: "100%" }} />;
}
