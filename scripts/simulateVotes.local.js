const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners(); // 하드헷 노드로 100개 지갑을 만들어야 속도가 느리지 않는다.

  const VotingSystemSeasonal = await hre.ethers.getContractFactory("VotingSystemSeasonal");
  const contract = await VotingSystemSeasonal.connect(signers[0]).deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\u2705 Contract deployed to:", address);

  for (let season = 1; season <= 3; season++) {
    await contract.connect(signers[0]).startNewSeason(season);
    console.log(`🕒 Season ${season} started`);
  
    for (let cid = 1; cid <= 101; cid++) {
      await contract.connect(signers[0]).addCandidate(season, `Candidate ${cid}`);
    }
    console.log(`✅ Season ${season}: 101 candidates added`);
  }
  

  for (let season = 1; season <= 3; season++) {
    await contract.connect(signers[0]).startNewSeason(season);
    console.log(`\u23F1️ Season ${season} started`);

    for (let v = 1; v <= 100; v++) {
      const voter = signers[v];
      let votes = 0;
      const voteCount = Math.floor(Math.random() * 11); // 0~10표수 를 랜덤으로 표시한다.

      for (let i = 0; i < voteCount; i++) {
        const randomCid = Math.floor(Math.random() * 101) + 1; // 후보자 1~101 랜덤으로 표시한다.
        try {
          const tx = await contract.connect(voter).vote(season, randomCid);
          await tx.wait();
          votes++;
        } catch (err) {
          console.warn(`\u26a0\uFE0F Voter ${v} failed vote ${i + 1} in season ${season}:`, err.message);
        }
      }

      // 10개의 투표를 다하지 않을경후 나머지는 기권 처리 (10 - votes)
      const abstention = 10 - votes;
      if (abstention > 0) {
        try {
          const tx = await contract.connect(signers[0]).recordAbstention(season, voter.address, abstention);
          await tx.wait();
        } catch (err) {
          console.warn(`\u26a0\uFE0F Abstention record failed for voter ${v} in season ${season}:`, err.message);
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
