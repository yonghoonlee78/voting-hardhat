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

    // 시즌별 후보자 목록: 시즌 번호 => 후보 ID => :후보 정보 셋 다 세부항목을 포함한다.
    mapping(uint256 => mapping(uint256 => Candidate)) public seasonCandidates;

    // 시즌별 후보자 수: 시즌 번호 => 후보 수 : 맵핑은 세부항목을 흡수하는 개념으로 본다.
    mapping(uint256 => uint256) public seasonCandidateCounts;

    // 시즌별 유권자별 투표 기록: 시즌 번호 => 유권자 주소 (세부항목을 포함한다)
    mapping(uint256 => mapping(address => Voter)) private seasonVoters;
    mapping(uint256 => bool) public seasonStarted;


    uint256 public latestSeason; 

    event CandidateAdded(uint256 seasonId, uint256 candidateId, string name);
    event VoteCasted(address voter, uint256 seasonId, uint256 candidateId, uint256 currentVoteCount);

    modifier validSeason(uint256 seasonId) {
        require(seasonId >= 1 && seasonId <= 3, "Invalid season (1~3 only)");
        _;
    }
     
    
    function addCandidate(uint256 seasonId, string memory _name) public validSeason(seasonId) {
        
        require(seasonStarted[seasonId], "Season not started");
        seasonCandidateCounts[seasonId]++;
        uint256 newId = seasonCandidateCounts[seasonId];
        seasonCandidates[seasonId][newId] = Candidate(newId, _name, 0);
        emit CandidateAdded(seasonId, newId, _name);
    }

    function vote(uint256 seasonId, uint256 candidateId) public validSeason(seasonId) {
        require(seasonStarted[seasonId], "Season not started");
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

    function startNewSeason() external {
        require(latestSeason < 3, "Only 3 seasons allowed");
        latestSeason++;
        uint256 seasonId = latestSeason;

        require(!seasonStarted[seasonId], "Season already started");

        uint256 count = seasonCandidateCounts[seasonId];
        for (uint256 i = 1; i <= count; i++) {
            delete seasonCandidates[seasonId][i];
        }

        seasonCandidateCounts[seasonId] = 0;
        seasonStarted[seasonId] = true;
    }

    mapping(uint => mapping(address => uint)) public abstentionCounts;
    mapping(uint => uint) public totalAbstentions;

   function recordAbstention(uint season, address voter, uint count) public {
    require(getVoteCount(season, voter) + count <= 10, "Total votes and abstentions exceed limit");
    abstentionCounts[season][voter] += count;
    totalAbstentions[season] += count;
   }

   function getAbstentionCount(uint season, address voter) public view returns (uint) {
    return abstentionCounts[season][voter];
   }

   function getTotalAbstentions(uint season) public view returns (uint) {
    return totalAbstentions[season];
   }




}
