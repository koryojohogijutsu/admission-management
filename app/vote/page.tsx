"use client";

import { useEffect, useState } from "react";

export default function VotePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [voteLimit, setVoteLimit] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // cookieからvisitor_id取得
  const getVisitorId = () => {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="));
    return match?.split("=")[1];
  };

  // 初期ロード時にvoteLimit取得（registerで保存済み想定）
  useEffect(() => {
    const init = async () => {
      const visitorId = getVisitorId();
      if (!visitorId) {
        setMessage("来場登録が必要です");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });

      const data = await res.json();

      if (data.voteLimit) {
        setVoteLimit(data.voteLimit);
      }

      setLoading(false);
    };

    init();
  }, []);

  const toggleSelect = (code: string) => {
    if (selected.includes(code)) {
      setSelected(selected.filter((c) => c !== code));
    } else {
      if (selected.length >= voteLimit) return;
      setSelected([...selected, code]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    setSubmitting(true);

    for (const classCode of selected) {
      await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-visitor-id": visitorId,
        },
        body: JSON.stringify({ classCode }),
      });
    }

    setMessage("投票が完了しました");
    setSubmitting(false);
  };

  if (loading) return <p>読み込み中...</p>;

  const remaining = voteLimit - selected.length;

  return (
    <div style={{ padding: "20px" }}>
      <h1>投票ページ</h1>

      <p>投票可能数: {voteLimit}</p>
      <p>あと {remaining} 件選択できます</p>

      <div style={{ marginTop: "20px" }}>
        {["A", "B", "C", "D", "E"].map((code) => (
          <button
            key={code}
            onClick={() => toggleSelect(code)}
            disabled={
              !selected.includes(code) && selected.length >= voteLimit
            }
            style={{
              margin: "5px",
              padding: "10px",
              backgroundColor: selected.includes(code)
                ? "#4CAF50"
                : "#eee",
            }}
          >
            {code}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSubmit} disabled={submitting}>
          投票する
        </button>
      </div>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}
    </div>
  );
}
