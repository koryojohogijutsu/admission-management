"use client";

import { useEffect, useState } from "react";

export default function VotePage() {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const EXIT_PASSWORD = "kakou";

  const getVisitorId = () =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("visitor_id="))
      ?.split("=")[1];

  const handleAuth = () => {
    if (password === EXIT_PASSWORD) {
      setAuthorized(true);
      fetchClasses();
    } else {
      alert("コードが違います");
    }
  };

  const fetchClasses = async () => {
    const visitorId = getVisitorId();

    const res = await fetch("/api/get-entered-classes", {
      headers: { "x-visitor-id": visitorId! },
    });

    const data = await res.json();
    setClasses(data.classCodes || []);
  };

  const handleVote = async () => {
    if (!selected) {
      alert("クラスを選択してください");
      return;
    }

    const visitorId = getVisitorId();

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-visitor-id": visitorId!,
      },
      body: JSON.stringify({ classCode: selected }),
    });

    if (res.ok) {
      alert("投票完了：" + selected);
    } else {
      const data = await res.json();
      alert("エラー：" + data.error);
    }
  };

  if (!authorized) {
    return (
      <main style={{ padding: 20, textAlign: "center" }}>
        <h1>投票コード入力</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={handleAuth}>確認</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 20, textAlign: "center" }}>
      <h1>投票</h1>

      {classes.map((cls) => (
        <div
          key={cls}
          onClick={() => setSelected(cls)}
          style={{
            margin: "10px",
            padding: "15px",
            border: selected === cls ? "3px solid blue" : "1px solid gray",
            cursor: "pointer",
          }}
        >
          {cls}
        </div>
      ))}

      <br />
      <button onClick={handleVote}>送信</button>
    </main>
  );
}
