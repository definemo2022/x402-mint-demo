import { NextRequest, NextResponse } from "next/server";

// 402 payment info（应与 mint-request 保持一致，实际可从数据库或缓存获取）
const PAYMENT_INFO = {
  maxAmountRequired: "0.01",
  asset: "0xA0b86991C6218b36c1d19D4a2e9Eb0cE3606EB48",
  payTo: process.env.PAY_TO,
  network: "base-sepolia",
  resource: "/api/mint",
};

// 幂等记录（内存 Map，生产建议用数据库）
const processedMap = new Map();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { recipient, paymentProof } = body;

  // 校验字段完整性
  if (!recipient || !paymentProof) {
    return NextResponse.json({ error: "missing recipient or paymentProof" }, { status: 400 });
  }

  // nonce 校验（必须有且唯一）
  const nonce = paymentProof.nonce;
  if (!nonce) {
    return NextResponse.json({ error: "missing nonce" }, { status: 400 });
  }
  const idempotentKey = `${paymentProof.resource}:${nonce}`;
  if (processedMap.has(idempotentKey)) {
    // 已处理，返回历史结果
    return NextResponse.json({ ...processedMap.get(idempotentKey), idempotent: true });
  }

  // 校验规则 1-5
  const errors = [];
  if (paymentProof.network !== PAYMENT_INFO.network) errors.push("network mismatch");
  if (paymentProof.asset !== PAYMENT_INFO.asset) errors.push("asset mismatch");
  if (paymentProof.to !== PAYMENT_INFO.payTo) errors.push("payTo mismatch");
  if (Number(paymentProof.amount) < Number(PAYMENT_INFO.maxAmountRequired)) errors.push("insufficient amount");
  if (paymentProof.resource !== PAYMENT_INFO.resource) errors.push("resource mismatch");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  // 合约 mint 调用
  try {
    const { mintToUser } = await import("@/utils/contract");
    const txHash = await mintToUser(recipient);
    const result = {
      success: true,
      tx: txHash,
      tokenId: null,
      nonce,
      idempotent: false
    };
    processedMap.set(idempotentKey, result);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "mint failed" }, { status: 500 });
  }
}
