// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystemSeasonal {
    struct Voter {
        uint256 voteCount;
        mapping(uint256 => uint256) votes;
    }

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => mapping(uint256 => Candidate)) public seasonCandidates;
    mapping(uint256 => uint256) public seasonCandidateCounts;
    mapping(uint256 => mapping(address => Voter)) private seasonVoters;

    event CandidateAdded(uint256 seasonId, uint256 candidateId, string name);
    event VoteCasted(address voter, uint256 seasonId, uint256 candidateId, uint256 currentVoteCount);

    modifier validSeason(uint256 seasonId) {
       require(seasonId >= 1 && seasonId <= 3, "Invalid season (1~3 only)");
        _;
    }

    function addCandidate(uint256 seasonId, string memory _name) public validSeason(seasonId) {
        seasonCandidateCounts[seasonId]++;
        uint256 newId = seasonCandidateCounts[seasonId];
        seasonCandidates[seasonId][newId] = Candidate(newId, _name, 0);
        emit CandidateAdded(seasonId, newId, _name);
    }

    function vote(uint256 seasonId, uint256 candidateId) public validSeason(seasonId) {
        require(candidateId > 0 && candidateId <= seasonCandidateCounts[seasonId], "Invalid candidate ID");

        Voter storage voter = seasonVoters[seasonId][msg.sender];
        require(voter.voteCount < 10, "Max 10 votes per season");

        voter.voteCount++;
        voter.votes[voter.voteCount] = candidateId;
        seasonCandidates[seasonId][candidateId].voteCount++;

        emit VoteCasted(msg.sender, seasonId, candidateId, voter.voteCount);
    }

    function getVoteCount(uint256 seasonId, address _voter) public view returns (uint256) {
        return seasonVoters[seasonId][_voter].voteCount;
    }
    
    function getVotedCandidate(uint256 seasonId, address _voter, uint256 nthVote) public view returns (uint256) {
        require(nthVote > 0 && nthVote <= seasonVoters[seasonId][_voter].voteCount, "Invalid vote index");
        return seasonVoters[seasonId][_voter].votes[nthVote];
    }

    function getTotalVotes(uint256 seasonId) public view returns (uint256 totalVotes) {
       uint256 count = seasonCandidateCounts[seasonId];
       for (uint256 i = 1; i <= count; i++) {
          totalVotes += seasonCandidates[seasonId][i].voteCount;
       }
    }

    function getTotalVotesAllSeasons() public view returns (uint256 totalVotes) {
        for (uint256 season = 1; season <= 3; season++) {
            uint256 count = seasonCandidateCounts[season];
            for (uint256 i = 1; i <= count; i++) {
                totalVotes += seasonCandidates[season][i].voteCount;
            }
        }
    }

    function getTotalVotesByVoterAcrossSeasons(address voter) public view returns (uint256 totalVotes) {
        for (uint256 season = 1; season <= 3; season++) {
            totalVotes += seasonVoters[season][voter].voteCount;
        }
    }

    function getRemainingVotes(uint256 seasonId, address _voter) public view returns (uint256) {
        return 10 - seasonVoters[seasonId][_voter].voteCount;
    }

    function getVotesByCandidate(uint256 seasonId, uint256 candidateId) public view returns (uint256) {
        require(candidateId > 0 && candidateId <= seasonCandidateCounts[seasonId], "Invalid candidate ID");
        return seasonCandidates[seasonId][candidateId].voteCount;
    }
}
