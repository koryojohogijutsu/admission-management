"use client";

import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onScan: (result: string) => void;
};

export default function QRScanner({ onScan }: Props) {
  useEffect(() => {
    const scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250,
      },
      (decodedText) => {
        scanner.stop();
        onScan(decodedText);
      },
      (errorMessage) => {
        // 無視
      }
    );

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return <div id="reader" style={{ width: "100%" }} />;
}
