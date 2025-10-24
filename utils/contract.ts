import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);
const wallet = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY!, provider);
const nftAbi = [
  "function mint(address to) external returns (uint256)"
];
const nft = new ethers.Contract(process.env.NFT_ADDRESS!, nftAbi, wallet);

export async function mintToUser(to: string) {
  const tx = await nft.mint(to);
  await tx.wait();
  return tx.hash;
}
