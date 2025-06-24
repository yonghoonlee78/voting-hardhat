// scripts/simulateVotes.local.js
const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners(); // 하드햇 노드가 제공하는 100개 계정

  const VotingSystemSeasonal = await hre.ethers.getContractFactory("VotingSystemSeasonal");
  const contract = await VotingSystemSeasonal.connect(signers[0]).deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\u2705 Contract deployed to:", address);

  // 후보자 등록 (시즌 1~3, 각 시즌당 101명)
  for (let season = 1; season <= 3; season++) {
    for (let cid = 1; cid <= 101; cid++) {
      await contract.connect(signers[0]).addCandidate(season, `Candidate ${cid}`);
    }
    console.log(`\u2705 Season ${season}: 101 candidates added`);
  }

  // 투표 시뮬레이션 (유권자 100명 * 시즌당 10번 * 3시즌 = 총 3000투표)
  for (let season = 1; season <= 3; season++) {
    for (let v = 1; v <= 100; v++) {
      const voter = signers[v];
      for (let i = 0; i < 10; i++) {
        const randomCid = Math.floor(Math.random() * 101) + 1; // 1~101 랜덤
        try {
          const tx = await contract.connect(voter).vote(season, randomCid);
          await tx.wait();
        } catch (err) {
          console.warn(`\u26a0\ufe0f Voter ${v} failed vote ${i + 1} in season ${season}:`, err.message);
        }
      }
    }
    console.log(`\u2705 Season ${season}: 1000 votes completed`);
  }

  console.log("\ud83c\udf89 All 3000 votes completed successfully (on localhost)");
}

main().catch((err) => {
  console.error("\u274c Error in simulation:", err);
  process.exit(1);
});
