async function main() {
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    const contract = await VotingSystem.deploy();
    await contract.deployed();
    console.log("VotingSystem deployed to:", contract.address);
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  