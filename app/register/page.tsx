"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"survey" | "submitting">("survey");
  const [groupSize, setGroupSize] = useState(1);
  const [transport, setTransport] = useState("");

  useEffect(() => {
    // visitor_id をcookieから取得 or 新規生成
    const existing = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="))
      ?.split("=")[1];

    if (!existing) {
      const id = crypto.randomUUID();
      document.cookie = `visitor_id=${id}; path=/; SameSite=Lax`;
    }
  }, []);

  const handleSubmit = async () => {
    if (!transport) {
      alert("来場手段を選択してください");
      return;
    }

    setStep("submitting");

    const visitorId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="))
      ?.split("=")[1];

    if (!visitorId) {
      alert("エラー: visitor_id が見つかりません");
      setStep("survey");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-visitor-id": visitorId,
      },
      body: JSON.stringify({ groupSize, transport }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      const result = await res.json();
      alert("エラー: " + result.error);
      setStep("survey");
    }
  };

  if (step === "submitting") {
    return (
      <main style={{ padding: "40px", textAlign: "center" }}>
        <p>送信中...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "30px 20px", textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
      <h1>入場登録</h1>
      <p style={{ color: "#555", fontSize: "14px", marginBottom: "30px" }}>
        アンケートにご協力ください
      </p>

      <div style={{ margin: "16px 0", textAlign: "left" }}>
        <label style={{ fontWeight: "bold" }}>グループの人数</label>
        <br />
        <select
          value={groupSize}
          onChange={(e) => setGroupSize(Number(e.target.value))}
          style={{ marginTop: "8px", padding: "10px", fontSize: "16px", width: "100%" }}
        >
          {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}人
            </option>
          ))}
        </select>
      </div>

      <div style={{ margin: "16px 0", textAlign: "left" }}>
        <label style={{ fontWeight: "bold" }}>来場手段</label>
        <br />
        <select
          value={transport}
          onChange={(e) => setTransport(e.target.value)}
          style={{ marginTop: "8px", padding: "10px", fontSize: "16px", width: "100%" }}
        >
          <option value="">選択してください</option>
          <option value="car">車</option>
          <option value="bike">自転車・バイク</option>
          <option value="train">電車</option>
          <option value="walk">徒歩</option>
          <option value="bus">バス</option>
          <option value="other">その他</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: "24px",
          padding: "14px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        登録してホームへ
      </button>
    </main>
  );
}
