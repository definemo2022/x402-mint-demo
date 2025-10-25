"use client";
import { useState } from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [status, setStatus] = useState("Ready");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);

  // 钱包连接
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWallet(accounts[0]);
        setStatus(`Wallet connected: ${accounts[0]}`);
      } catch (e: any) {
        setError(e?.message || "Wallet connection failed");
      }
    } else {
      setError("MetaMask not found");
    }
  }

  async function handleMint() {
    setLoading(true);
    setError(null);
    setStatus("Requesting payment info...");
    setTxHash(null);
    try {
      const res = await fetch("/api/mint-request");
      if (res.status === 402) {
        const info = await res.json();
        console.log("x402 info:", info);
        setStatus("Pretending to pay...");
        await new Promise(r => setTimeout(r, 2000));

        setStatus("Notifying server...");
        const paymentProof = {
          txHash: "0xMockTxHash",
          amount: info.maxAmountRequired,
          asset: info.asset,
          to: info.payTo,
          network: info.network,
          resource: info.resource,
          nonce: crypto.randomUUID()
        };
        const notify = await fetch("/api/payment-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: wallet, // 使用连接的钱包地址
            paymentProof
          }),
        });

        const result = await notify.json();
        if (result.success) {
          setStatus("Mint success!");
          setTxHash(result.tx);
        } else {
          setStatus("Mint failed");
          setTxHash(null);
          setError(result.error || "Unknown error");
        }
      } else {
        setStatus("Unexpected response");
        setError("API did not return 402");
      }
    } catch (e: any) {
      setStatus("Mint failed");
      setError(e?.message || "Network error");
      setTxHash(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-10">
      <h1 className="text-xl mb-4">x402 Mint Demo</h1>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        onClick={connectWallet}
        disabled={!!wallet}
      >
        {wallet ? "Wallet Connected" : "Connect Wallet"}
      </button>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleMint}
        disabled={loading || !wallet} // 未连接钱包时禁用
      >
        {loading ? "Processing..." : "Mint (mock pay)"}
      </button>
      <p className="mt-4">
        {status}
        {txHash && (
          <span>
            {" "}
            Tx: <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{txHash}</a>
          </span>
        )}
        {error && (
          <div style={{ color: '#dc2626', marginTop: '0.5rem', fontWeight: 'bold' }}>
            Error: {error}
            <button
              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', background: '#fee2e2', borderRadius: '0.25rem', border: '1px solid #f87171', color: '#dc2626', fontWeight: 'bold' }}
              onClick={handleMint}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}
      </p>
    </main>
  );
}
