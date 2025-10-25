"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Ready");
  const [txHash, setTxHash] = useState<string | null>(null);

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
      // 构造真实 paymentProof（与 402 响应保持一致）
      const paymentProof = {
        txHash: "0xMockTxHash", // 实际可用真实支付 txHash
        amount: info.maxAmountRequired,
        asset: info.asset,
        to: info.payTo,
        network: info.network,
        resource: info.resource,
        nonce: crypto.randomUUID()
        // nonce、facilitatorSig 可补充
      };
      const notify = await fetch("/api/payment-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: "0xc55d46058e01c32e764e395afed6333513a2353a", // 替换为你要 mint 的地址
          paymentProof
        }),
      });

      const result = await notify.json();
      if (result.success) {
        setStatus("Mint success!");
        setTxHash(result.tx);
      } else {
        setStatus(`Mint failed: ${result.error}`);
        setTxHash(null);
      }
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
      <p className="mt-4">
        {status}
        {txHash && (
          <span>
            {" "}
            Tx: <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{txHash}</a>
          </span>
        )}
      </p>
    </main>
  );
}
