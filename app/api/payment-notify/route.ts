import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 解析请求体
  const body = await req.json();
  // 这里可以添加支付凭证校验逻辑，当前先 mock 通过
  // TODO: 校验 paymentProof、幂等、合约 mint

  // mock 返回 mint 成功
  return NextResponse.json({
    success: true,
    tx: "0xmockminttxhash",
    tokenId: 123
  });
}
