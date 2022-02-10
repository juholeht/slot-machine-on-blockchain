// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract OwlsJackpot is VRFConsumerBase  {
  mapping(address => uint256) private winners;
  address internal owner;
  bytes32 internal keyHash;
  uint256 internal fee;
  uint256 internal jackpotPrize;
  address private vrfCoordinatorAddress;

  event LogContractCreated(address);
  event LogRequestedRandomness(bytes32 requestId);
  event LogRandomnessFulfilled(bytes32 requestId, uint256 randomness);
  event LogRoundResult(bytes32 requestId, address player, uint256 betSize, uint256[] multipliers, uint256[] winningIncrements, uint256 jackpotPrize);
  event LogUserWithdrawWinnings(address user, uint256 winnings);
  event LogCurrentRound(bytes32 requestId, uint256 betSize, address player, uint256 spinCount);

  uint256 constant public MAX_INT = 2**256 - 1;
  // 20% change to win: (MAX_INT + 1) / 5
  uint256 constant public DOUBLE_WIN_BOUNDARY = MAX_INT / 5;
  // 5% change to win: DOUBLE_WIN_BOUNDARY / 20
  uint256 constant public QUADRUPLE_WIN_BOUNDARY = MAX_INT / 20;
  // 2.5% change to win: QUADRUPLE_WIN_BOUNDARY / 40
  uint256 constant public OCTUPLE_WIN_BOUNDARY = MAX_INT / 40;


  struct Round {
    bytes32 requestId;
    uint256 betSize;
    address player;
    uint256 spinCount;
  }

  mapping(bytes32 => Round) public rounds;

  modifier onlyAdmin() {
    require(msg.sender == owner, 'function can be called only contract owner');
    _;
  }

  modifier onlyVFRCoordinator() {
    require(msg.sender == vrfCoordinatorAddress, 'function can be called only VRF coordinator');
    _;
  }

  /**
    * Constructor inherits VRFConsumerBase
    * 
    * Network: Kovan
    * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
    * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
    * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
    */
  constructor(address _linkTokenAddress, bytes32 _keyHash, 
  address _vrfCoordinatorAddress, uint256 _fee)
    VRFConsumerBase(
        _vrfCoordinatorAddress, // VRF Coordinator
        _linkTokenAddress  // LINK Token
    ) public payable
  {
    keyHash = _keyHash;
    fee = _fee;
    owner = payable(msg.sender);
    vrfCoordinatorAddress = _vrfCoordinatorAddress;
    emit LogContractCreated(msg.sender);
  }

  /**
    * Callback function used by VRF Coordinator
    */
  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
      emit LogRandomnessFulfilled(requestId, randomness);
      resolveWinnings(requestId, randomness);
  }

  function getRandomValues(uint256 randomness, uint256 spinCount) private returns (uint256[] memory expandedValues) {
    if (spinCount > 1) {
      return expand(randomness, spinCount);
    } else {
      uint256[] memory singleRandomValue = new uint256[](1);
      singleRandomValue[0] = uint256(randomness);
      return singleRandomValue;
    }
  }

  function resolveWinnings(bytes32 requestId, uint256 randomness) public {
    Round memory currentRound = rounds[requestId];
    uint256[] memory multipliers = new uint256[](currentRound.spinCount);
    uint256[] memory randomValues = getRandomValues(randomness, currentRound.spinCount);
    uint256 updatedWinnings = winners[currentRound.player];
    uint256[] memory winningIncrements = new uint256[](currentRound.spinCount);
    for (uint256 i = 0; i < currentRound.spinCount; i++) {
      uint256 multiplier = getWinMultiplier(randomValues[i]);
      multipliers[i] = multiplier;
      updatedWinnings = updatedWinnings + (currentRound.betSize * multiplier);
      winningIncrements[i] = updatedWinnings;
    }
    winners[currentRound.player] = updatedWinnings;
    
    delete rounds[requestId];
    
    emit LogRoundResult(requestId, currentRound.player, currentRound.betSize, multipliers, winningIncrements, jackpotPrize);
  }

  function getWinMultiplier(uint256 randomness) public returns (uint256) {
    if (OCTUPLE_WIN_BOUNDARY >= randomness) {
      return 8;
    } else if (QUADRUPLE_WIN_BOUNDARY >= randomness) {
      return 4;
    } else if (DOUBLE_WIN_BOUNDARY >= randomness) {
      return 2;
    }
    return 0;
  }

function expand(uint256 randomValue, uint256 n) public pure returns (uint256[] memory expandedValues) {
    expandedValues = new uint256[](n);
    for (uint256 i = 0; i < n; i++) {
        expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i)));
    }
    return expandedValues;
}

  /** 
    * Requests randomness from a user-provided seed
    */
  function startRound(uint256 spinCount) public payable returns (bytes32 requestId) {
      // require(address(this).balance>= (msg.value * 8), 'Error, insufficent vault balance');
      requestId = requestRandomness(keyHash, fee);
      emit LogRequestedRandomness(requestId);
      uint256 betSize = msg.value / spinCount;
      rounds[requestId] = Round(requestId, betSize, msg.sender, spinCount);
  }

  function getWinningsForUser(address userAddress) public view returns (uint256) {
    return winners[userAddress];
  }

  function withdrawUserFunds() external payable {
    uint256 userWinnings = winners[msg.sender];
    require(address(this).balance>=userWinnings, 'Error, contract has insufficent balance');
    payable(msg.sender).transfer(userWinnings);
    emit LogUserWithdrawWinnings(msg.sender, userWinnings);
    winners[msg.sender] = 0;
    
  }

  function getJackpotPrize() public view returns (uint256) {
    return jackpotPrize;
  }

  receive() external payable {}
}
