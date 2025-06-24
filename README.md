Voting System (Hardhat 기반)

이 프로젝트는 Solidity와 Hardhat을 기반으로 한 시즌제 투표 시스템입니다.  
총 3개의 시즌이 존재하며, 시즌마다 고유한 후보자와 투표자를 관리합니다.  
또한 Hardhat 로컬 네트워크에서 총 3000개의 랜덤 투표를 시뮬레이션합니다.

 ✅ 주요 기능

1. 스마트 컨트랙트
- 시즌별 후보자 등록
- 시즌별 유권자 투표 (1인당 시즌당 10표)
- 모든 유권자의 투표 수 확인
- 특정 시즌 또는 전체 시즌의 총 투표 수 확인

2. 이벤트 및 구조체 활용
- `Voter` 구조체에 `mapping(uint => uint)`으로 투표 내역 저장
- `Candidate` 구조체로 후보자별 ID, 이름, 득표 수 관리
- 이벤트 로그: 후보 등록, 투표 완료

# 디렉토리 구조
voting-hardhat/
├── contracts/
│ └── VotingSystemSeasonal.sol # 주요 컨트랙트
├── scripts/
│ ├── deploy.js # 배포 스크립트
│ └── simulateVotes.local.js # 3000표 시뮬레이션 스크립트 (Hardhat 로컬)
├── .env.sample # 환경 변수 샘플
├── hardhat.config.js # 하드햇 설정
└── README.md # 설명 파일

