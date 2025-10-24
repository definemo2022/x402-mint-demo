import { NextRequest, NextResponse } from "next/server";
import { mintToUser } from "@/utils/contract";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { recipient, paymentProof } = body;

  // TODO: 替换成实际 facilitator 验证逻辑
  const isValid = paymentProof === "mock-ok";

  if (!isValid)
    return NextResponse.json({ error: "invalid payment" }, { status: 400 });

  const tx = await mintToUser(recipient);
  return NextResponse.json({ success: true, tx });
}
