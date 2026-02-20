"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onScan: (result: string) => void;
};

export default function QRScanner({ onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {}
      )
      .catch(console.error);

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch(() => {
            // すでに止まっている場合は無視
          });
      }
    };
  }, [onScan]);

  return <div id="reader" style={{ width: "300px", margin: "auto" }} />;
}
