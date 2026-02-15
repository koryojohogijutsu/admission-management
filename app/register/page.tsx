"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [step, setStep] = useState<"complete" | "survey">("complete");
  const [groupSize, setGroupSize] = useState<number | "">(1);
  const [transport, setTransport] = useState("");
  const router = useRouter();

  // visitor_id 必ず生成
  useEffect(() => {
    const existing = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="));

    if (!existing) {
      const newId = crypto.randomUUID();
      document.cookie = `visitor_id=${newId}; path=/; max-age=31536000`;
      console.log("visitor_id generated:", newId);
    }
  }, []);

  // 1秒後アンケート表示
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep("survey");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    const visitorId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="))
      ?.split("=")[1];

    if (!visitorId) {
      alert("visitor_id がありません");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-visitor-id": visitorId,
      },
      body: JSON.stringify({
        groupSize: Number(groupSize),
        transport,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      router.push("/");
    } else {
      alert("送信エラー: " + result.error);
    }
  };

  return (
    <main style={{ padding: "20px", textAlign: "center" }}>
      {step === "complete" && (
        <div>
          <h1>🎉 入場完了</h1>
          <p>アンケートを準備しています...</p>
        </div>
      )}

      {step === "survey" && (
        <div>
          <h2>アンケート</h2>

          <div style={{ margin: "10px 0" }}>
            <label>何人で来ましたか？</label>
            <br />
            <input
              type="number"
              value={groupSize}
              min={1}
              onChange={(e) => {
                const value = e.target.value;
                setGroupSize(value === "" ? "" : Number(value));
              }}
            />
          </div>

          <div style={{ margin: "10px 0" }}>
            <label>来場手段は？</label>
            <br />
            <select
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
            >
              <option value="">選択してください</option>
              <option value="walk">徒歩</option>
              <option value="bike">自転車</option>
              <option value="train">電車</option>
              <option value="car">車</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            style={{ marginTop: "15px", padding: "10px 20px" }}
          >
            送信してホームへ
          </button>
        </div>
      )}
    </main>
  );
}
