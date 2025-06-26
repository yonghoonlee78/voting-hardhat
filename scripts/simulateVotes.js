// scripts/simulateVotes.js (시즌 1~3 전체 처리 및 요약 출력, 유권자수 × 후보자수 증가)
const { ethers } = require("hardhat");
const fs = require("fs");

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // 배포된 컨트랙트 주소
  const contract = await ethers.getContractAt("VotingSystemSeasonal", contractAddress);
  const accounts = await ethers.getSigners();
  const summary = [];

  for (let season = 1; season <= 3; season++) {
    const latest = await contract.latestSeason();
    if (season <= latest) {
      console.log(`⏩ 시즌 ${season} 이미 시작됨. 후보 및 투표 진행 계속함.`);
    } else {
      console.log(`📢 시즌 ${season} 시작`);
      const tx = await contract.connect(accounts[0]).startNewSeason();
      await tx.wait();
      console.log(`✅ 시즌 ${season} 시작 완료`);
    }

    // 후보 등록 (최대 101명)
    const candidateCount = await contract.seasonCandidateCounts(season);
    const start = Number(candidateCount) + 1;
    for (let i = start; i <= 101; i++) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const tx = await contract.connect(accounts[0]).addCandidate(season, `Candidate ${i}`);
          await tx.wait();
          console.log(`✅ 후보 ${i} 등록됨`);
          break;
        } catch (err) {
          console.warn(`❌ 후보 ${i} 등록 실패 (시도 ${attempt + 1}): ${err.message}`);
          await delay(500);
        }
      }
    }

    let totalVotes = 0;
    let totalAbstain = 0;
    let votersWithActivity = 0;
    const voteLog = [];

    // 투표자당 3~10표 랜덤 투표
    for (const voter of accounts) {
      const targetVotes = Math.floor(Math.random() * 8) + 3;
      let voteCount = 0;

      for (let j = 0; j < targetVotes; j++) {
        const currentCount = await contract.seasonCandidateCounts(season);
        const currentCountNum = Number(currentCount);
        if (currentCountNum < 1) continue;

        const candidateId = Math.floor(Math.random() * currentCountNum) + 1;
        try {
          const tx = await contract.connect(voter).vote(season, candidateId);
          await tx.wait();
          voteCount++;
        } catch (err) {
          voteLog.push(`❌ 투표 실패 (voter: ${voter.address}, 후보: ${candidateId}): ${err.message}`);
          await delay(300);
        }
      }

      const abstainCount = 10 - voteCount;
      if (voteCount > 0 || abstainCount > 0) votersWithActivity++;
      if (abstainCount > 0) {
        try {
          const tx = await contract.connect(accounts[0]).recordAbstention(season, voter.address, abstainCount);
          await tx.wait();
          totalAbstain += abstainCount;
        } catch (err) {
          voteLog.push(`❌ 기권 실패 (voter: ${voter.address}): ${err.message}`);
        }
      }
      totalVotes += voteCount;
    }

    fs.writeFileSync(`vote_failures_season${season}.log`, voteLog.join("\n"));
    summary.push({
      season,
      candidates: await contract.seasonCandidateCounts(season),
      voters: votersWithActivity,
      abstentions: totalAbstain
    });
    console.log(`🎯 시즌 ${season}: 총 투표 ${totalVotes}표, 기권 ${totalAbstain}표`);
  }

  console.log("\n📊 전체 시즌 요약");
  console.log("──────────────────────────────────────────────");
  console.log("| Season | #Candidates | #Voters | #Abstentions |");
  console.log("|--------|-------------|---------|---------------|");
  for (const s of summary) {
    console.log(`|   ${s.season}    |     ${s.candidates.toString().padEnd(5)}      |   ${s.voters.toString().padEnd(3)}   |      ${s.abstentions.toString().padEnd(5)}     |`);
  }
  console.log("──────────────────────────────────────────────");
}

main().catch(console.error);
