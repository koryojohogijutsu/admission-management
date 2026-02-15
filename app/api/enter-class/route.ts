"use client";

import { useEffect, useState } from "react";
import QRScanner from "@/components/QRScanner";

function generateVisitorId() {
  return crypto.randomUUID();
}

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  // 初回アクセス時に visitor_id を必ず作る
  useEffect(() => {
    let visitorId = localStorage.getItem("visitor_id");

    if (!visitorId) {
