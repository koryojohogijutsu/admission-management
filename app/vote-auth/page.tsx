"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VoteAuthPage() {
  const [voteCode, setVotecode] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("/api/vote-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voteCode }),
    });

    if (res.ok) {
      router.push("/vote");
    } else {
      alert("投票コードが違います");
    }
  };

  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>投票コード入力</h1>

      <input
        type="password"
        value={voteCode}
        onChange={(e) => setVotecode(e.target.value)}
        placeholder="投票コードを入力"
        style={{ padding: "10px", fontSize: "16px" }}
      />

      <br /><br />

      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        確認
      </button>
    </main>
  );
}
