const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 배포 시작...");

  const VotingSystem = await hre.ethers.getContractFactory("VotingSystemSeasonal");
  const contract = await VotingSystem.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ VotingSystemSeasonal 컨트랙트 배포 완료!");
  console.log("📍 배포 주소:", address);

  // JSON 파일로 저장
  fs.writeFileSync("contractAddress.json", JSON.stringify({ address }, null, 2));
}

main().catch((error) => {
  console.error("❌ 배포 중 에러 발생:", error);
  process.exit(1);
});
