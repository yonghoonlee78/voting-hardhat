const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x7B027275ab6B0f7b6aB847b1d99877d6459F6184"; 
  const contract = await ethers.getContractAt("VotingSystemSeasonal", contractAddress);

  const latestSeason = await contract.latestSeason();
  console.log(`\n🔖 현재 마지막 시즌 번호: ${Number(latestSeason)}\n`);

  let grandTotal = 0;

  for (let seasonId = 1; seasonId <= Number(latestSeason); seasonId++) {
    console.log(`==============================`);
    console.log(`📋 시즌 ${seasonId} 결과`);

    const candidateCount = await contract.seasonCandidateCounts(seasonId);
    const countNum = Number(candidateCount);

    if (countNum === 0) {
      console.log(`⚠️ 시즌 ${seasonId}: 후보 없음`);
      continue;
    }

    console.log(`📂 후보 수: ${countNum}`);
    let seasonTotal = 0;

    for (let i = 1; i <= countNum; i++) {
      const votes = await contract.getVotesByCandidate(seasonId, i);
      const numVotes = Number(votes);
      seasonTotal += numVotes;
      console.log(`   👤 후보 ${i}: ${numVotes.toLocaleString()}표`);
    }

    grandTotal += seasonTotal;
    console.log(`🌟 시즌 ${seasonId} 총 투표 수: ${seasonTotal.toLocaleString()}`);
    console.log(`==============================\n`);
  }

  console.log(`📊 전체 시즌 총 투표 수 (시즌 1~${Number(latestSeason)}): ${grandTotal.toLocaleString()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
