  "use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";

export default function StaffPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const scanningRef = useRef(false);

  const [classCode, setClassCode] = useState<string | null>(null);
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    // localStorageからクラス設定を取得
    const code = localStorage.getItem("staff_class_code");
    const label = localStorage.getItem("staff_class_label");
    if (!code) {
      router.push("/staff/settings");
      return;
    }
    setClassCode(code);
    setClassLabel(label);
  }, [router]);

  const handleScan = async (visitorId: string) => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setMessage(null);

    try {
      const res = await fetch("/api/enter-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, classCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "✅ 入場記録完了！", ok: true });
      } else {
        setMessage({ text: `❌ エラー: ${data.error || "不明"}`, ok: false });
      }
    } catch {
      setMessage({ text: "❌ 通信エラーが発生しました", ok: false });
    }

    // 2秒後にスキャン再開
    setTimeout(() => {
      scanningRef.current = false;
      setMessage(null);
    }, 2000);
  };

  useEffect(() => {
    if (!classCode) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        handleScan,
        () => {}
      )
      .catch(() => {
        setMessage({ text: "カメラを起動できませんでした", ok: false });
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [classCode]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>入場スキャン</h1>

      {classCode && (
        <p style={{ fontSize: "15px", color: "#333" }}>
          クラス:{" "}
          <strong>
            {classLabel ? `${classCode}（${classLabel}）` : classCode}
          </strong>
          　
          <a
            href="/staff/settings"
            style={{ fontSize: "12px", color: "#888" }}
          >
            変更
          </a>
        </p>
      )}

      <div id="reader" style={{ width: "300px", margin: "20px auto" }} />

      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "14px 20px",
            borderRadius: "8px",
            backgroundColor: message.ok ? "#4caf50" : "#f44336",
            color: "white",
            fontSize: "18px",
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
