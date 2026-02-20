const handleScan = async (decodedText: string) => {
  try {
    const res = await fetch("/api/enter-class", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ classCode: decodedText }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("エラー: " + data.error);
      return;
    }

    // ✅ 成功時
    alert("入場が完了しました");

  } catch (error) {
    alert("通信エラーが発生しました");
  }
};
