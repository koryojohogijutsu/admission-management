"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import jsQR from "jsqr";

export default function EnterPage() {
  const params = useParams();
  const rawClass = params.class as string;

  const [status, setStatus] = useState("入場処理中…");
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 初期 visitor_id を生成 or 取得
  useEffect(() => {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("visitor_id", id);
    }
    setVisitorId(id);
  }, []);

  // QR読み取り開始
  const startScan = async () => {
    if (!visitorId) return;

    setScanning(true);
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = stream;
    await video.play();

    const scan = () => {
      if (!scanning) return;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          const classCode = code.data;

          // Supabaseに入場記録
          supabase
            .from("visits")
            .insert({
              visitor_id: visitorId,
              class_code: classCode,
            })
            .then(({ error }) => {
              if (error) {
                setStatus("入場エラー: " + error.message);
              } else {
                setStatus(`入場完了！クラス: ${classCode}`);
              }
            });

          stopScan();
          return;
        }
      }
      requestAnimationFrame(scan);
    };

    requestAnimationFrame(scan);
  };

  const stopScan = () => {
    setScanning(false);
    const video = videoRef.current!;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    video.srcObject = null;
  };

  return (
    <div>
      <h1>{status}</h1>

      <button onClick={startScan} disabled={scanning || !visitorId}>
        クラスQR読み取り
      </button>

      {scanning && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "#00000088" }}>
          <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}
    </div>
  );
}
