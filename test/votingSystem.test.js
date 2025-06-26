// test/votingSystem.test.js (시즌 1~3 요약 포함)
const { expect } = require("chai");
const { ethers } = require("hardhat");

function printSeasonSummary(summary) {
  console.log("\n\n📊 시즌별 요약");
  console.log("──────────────────────────────────────────────");
  console.log("| Season | #Candidates | #Voters | #Abstentions |");
  console.log("|--------|-------------|---------|---------------|");
  for (const s of summary) {
    console.log(`|   ${s.season}    |     ${s.candidates}       |   ${s.voters}    |      ${s.abstentions}       |`);
  }
  console.log("──────────────────────────────────────────────\n");
}

describe("VotingSystemSeasonal", function () {
  let contract;
  let owner;
  let voters;
  const seasonSummary = [];

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    voters = accounts.slice(1, 11);

    const Factory = await ethers.getContractFactory("VotingSystemSeasonal");
    contract = await Factory.connect(owner).deploy();
    await contract.waitForDeployment();

    for (let season = 1; season <= 3; season++) {
      await contract.connect(owner).startNewSeason();
      await contract.connect(owner).addCandidate(season, `Alice`);
    }
  });

  it("시즌 시작 전에는 투표할 수 없다", async () => {
    const Factory = await ethers.getContractFactory("VotingSystemSeasonal");
    const newContract = await Factory.connect(owner).deploy();
    await newContract.waitForDeployment();
    await expect(
      newContract.connect(voters[0]).vote(1, 1)
    ).to.be.revertedWith("Season not started");
  });

  it("시즌 시작 후에는 후보를 등록할 수 없다", async () => {
    await expect(
      contract.connect(owner).addCandidate(1, "Bob")
    ).to.be.revertedWith("Season has already started");
  });

  it("하나의 주소가 시즌당 최대 10표까지만 투표 가능하다", async () => {
    for (let i = 0; i < 10; i++) {
      await contract.connect(voters[0]).vote(1, 1);
    }

    await expect(
      contract.connect(voters[0]).vote(1, 1)
    ).to.be.revertedWith("Max 10 votes per season");
  });

  it("투표가 10표 미만인 경우 기권 처리 가능하다", async () => {
    await contract.connect(voters[1]).vote(1, 1);
    await contract.connect(owner).recordAbstention(1, voters[1].address, 9);

    const result = await contract.getAbstentionCount(1, voters[1].address);
    expect(result).to.equal(9);
  });

  it("기권 수는 전체 투표 수 대비 추적 가능하다", async () => {
    await contract.connect(voters[2]).vote(1, 1);
    await contract.connect(owner).recordAbstention(1, voters[2].address, 9);

    const totalAbstain = await contract.getTotalAbstentions(1);
    expect(totalAbstain).to.equal(9);
  });

  it("시즌당 10표 초과 투표는 실패해야 함", async () => {
    for (let i = 0; i < 10; i++) {
      await contract.connect(voters[3]).vote(1, 1);
    }

    await expect(
      contract.connect(voters[3]).vote(1, 1)
    ).to.be.revertedWith("Max 10 votes per season");
  });

  it("투표 없이 기권만 기록 가능", async () => {
    await contract.connect(owner).recordAbstention(1, voters[4].address, 10);

    const result = await contract.getAbstentionCount(1, voters[4].address);
    expect(result).to.equal(10);
  });

  it("유권자별 총 투표+기권 수가 10을 초과할 수 없음", async () => {
    await contract.connect(voters[5]).vote(1, 1);
    await expect(
      contract.connect(owner).recordAbstention(1, voters[5].address, 10)
    ).to.be.revertedWith("Total votes and abstentions exceed limit");
  });

  after(async () => {
    for (let season = 1; season <= 3; season++) {
      const candidates = await contract.seasonCandidateCounts(season);
      let totalVoters = 0;
      for (const v of voters) {
        const voteCount = await contract.getVoteCount(season, v.address);
        const abstain = await contract.getAbstentionCount(season, v.address);
        if (voteCount + abstain > 0) totalVoters++;
      }
      const abstentions = await contract.getTotalAbstentions(season);

      seasonSummary.push({
        season,
        candidates: Number(candidates),
        voters: totalVoters,
        abstentions: Number(abstentions)
      });
    }
    printSeasonSummary(seasonSummary);
  });
});
