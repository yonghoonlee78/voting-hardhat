🗳️ VotingSystemSeasonal - 스마트컨트랙트 기반 시즌별 투표 시스템

이 프로젝트는 Hardhat을 이용한 Solidity 스마트 컨트랙트 프로젝트입니다.
시즌별 후보 등록, 유권자별 최대 10표 투표, 기권 처리 등을 시뮬레이션할 수 있습니다.

✅ 설치 방법

로컬에 클론 이후 npm insatll
하드헷 노드 실행 npx hardhat node 

새 터미널 창을 실행하고 
npx hardhat run scripts/deploy.js --network localhost

컨트렉트가 배포한 상황이 되면 
npx hardhat run scripts/simulateVotes.js --network localhost

 시즌 1~3에 대한 후보 등록, 유권자별 랜덤 투표, 기권 처리가 자동 수행됩니다.
 결과는 콘솔에 출력되며, 실패 로그는 vote_failures_seasonX.log 파일을 생성하면서 저장됩니다
