"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ClassesAdminPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");

  const load = async () => {
    const { data } = await supabase.from("classes").select("*");
    setClasses(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const addClass = async () => {
    await supabase.from("classes").insert({ code, label });
    setCode("");
    setLabel("");
    load();
  };

  return (
    <div>
      <h1>クラス管理</h1>

      <input
        placeholder="コード（例: 2-4）"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <input
        placeholder="表示名"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <button onClick={addClass}>追加</button>

      <ul>
        {classes.map((c) => (
          <li key={c.id}>
            {c.code} → {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
