"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import md5 from "md5";

type VisitorType = "smartphone" | "paper" | "student";
type Status =
  | { state: "loading" }
  | { state: "ok"; visitorId: string; type: VisitorType }
  | { state: "error"; message: string };

// useSearchParams() は Suspense でラップが必須
export default function Home() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#aaa" }}>読み込み中...</p>
        </main>
      }
    >
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>({ state: "loading" });

  useEffect(() => {
    const idParam = searchParams.get("id");
    const cdParam = searchParams.get("cd");

    // ── クエリなし：スマホ来場者 ──────────────────────
    if (!idParam) {
      let visitorId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("visitor_id="))
        ?.split("=")[1];

      if (!visitorId) {
        visitorId = crypto.randomUUID();
        document.cookie = `visitor_id=${visitorId}; path=/; SameSite=Lax`;
      }

      setStatus({ state: "ok", visitorId, type: "smartphone" });
      return;
    }

    // ── クエリあり：紙チケ or 前高生 ─────────────────
    if (!cdParam) {
      setStatus({ state: "error", message: "無効なURLです（cdパラメータがありません）" });
      return;
    }

    const isStudent = idParam.endsWith("m");
    const numericId = isStudent ? idParam.slice(0, -1) : idParam;
    const salt = isStudent ? "akagioroshi" : "kakouryubu";
    const expectedHash = md5(`${numericId}${salt}`);

    if (expectedHash !== cdParam) {
      setStatus({ state: "error", message: "チケットの認証に失敗しました。\nQRコードを正しく読み取ってください。" });
      return;
    }

    // 検証OK → cdをvisitor_idとしてcookieに保存
    const visitorId = cdParam;
    document.cookie = `visitor_id=${visitorId}; path=/; SameSite=Lax`;

    setStatus({
      state: "ok",
      visitorId,
      type: isStudent ? "student" : "paper",
    });
  }, [searchParams]);

  if (status.state === "loading") {
    return (
      <main style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#aaa" }}>読み込み中...</p>
      </main>
    );
  }

  if (status.state === "error") {
    return (
      <main style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h1 style={{ fontSize: "20px", marginBottom: "12px" }}>認証エラー</h1>
        <p style={{ color: "#888", whiteSpace: "pre-line", fontSize: "14px" }}>
          {status.message}
        </p>
      </main>
    );
  }

  // ── 正常表示 ───────────────────────────────────────
  const { visitorId, type } = status;

  const typeLabel =
    type === "student" ? "前高生" :
    type === "paper"   ? "一般来場者（紙チケ）" :
                         "一般来場者";

  return (
    <main style={{ padding: "40px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>蛟龍祭</h1>
      <p style={{ color: "#888", fontSize: "13px", marginBottom: "32px" }}>
        {typeLabel}
      </p>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        maxWidth: "280px",
        margin: "0 auto",
      }}>
        <button
          onClick={() => router.push("/myqr")}
          style={{
            padding: "16px",
            fontSize: "17px",
            cursor: "pointer",
            backgroundColor: "#e10102",
            color: "white",
            border: "none",
            borderRadius: "8px",
          }}
        >
          QRを表示する
        </button>

        <button
          onClick={() => router.push("/vote-auth")}
          style={{
            padding: "14px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#e10102",
            border: "2px solid #e10102",
            borderRadius: "8px",
          }}
        >
          投票はこちら
        </button>

        <button
          onClick={() => router.push(`/history?vid=${visitorId}`)}
          style={{
            padding: "14px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#555",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          履歴を見る
        </button>
      </div>
    </main>
  );
}
