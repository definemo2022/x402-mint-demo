"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Ready");

  async function handleMint() {
    setStatus("Requesting payment info...");
    const res = await fetch("/api/mint-request");

    if (res.status === 402) {
      const info = await res.json();
      console.log("x402 info:", info);
      setStatus("Pretending to pay...");
      // 模拟用户支付
      await new Promise(r => setTimeout(r, 2000));

      setStatus("Notifying server...");
      const notify = await fetch("/api/payment-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: "0xYourTestWalletAddress",
          paymentProof: "mock-ok"
        }),
      });

      const result = await notify.json();
      setStatus(`Mint success! Tx: ${result.tx}`);
    } else {
      setStatus("Unexpected response");
    }
  }

  return (
    <main className="p-10">
      <h1 className="text-xl mb-4">x402 Mint Demo</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleMint}
      >
        Mint (mock pay)
      </button>
      <p className="mt-4">{status}</p>
    </main>
  );
}
