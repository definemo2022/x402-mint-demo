import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const paymentInfo = {
    maxAmountRequired: "0.01",
    asset: "0xA0b86991C6218b36c1d19D4a2e9Eb0cE3606EB48", // 示例：USDC
    payTo: process.env.PAY_TO,
    network: "base-sepolia",
    resource: "/api/mint",
    description: "Pay 0.01 USDC to mint 1 demo NFT"
  };

  return new NextResponse(JSON.stringify(paymentInfo), {
    status: 402,
    headers: { "Content-Type": "application/json" },
  });
}
