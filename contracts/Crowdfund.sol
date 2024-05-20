// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

contract Crowdfund{

    struct CrowdFund {
        string title; 
        uint256 fundingGoal;
        address owner;
        uint256 durationTime;
        bool isActive;
         uint256 fundingBalance;
         address[] contributors;  
    }
    uint256 public id;

    mapping(uint => CrowdFund) public crowd;
    //mapping of campaignid to address of contributors to amount contributed
    mapping(uint => mapping(address => uint)) public contribute;

    event ProposeCampaign(uint id, string _title, uint256 _fundingGoal, uint256 _durationTime);
    event ContributeEth(uint indexed _ID);
    event CampaignEnds(uint indexed _ID);

    
    function proposeCampaign(string memory _title, uint256 _fundingGoal, uint256 _durationTime) external {
        id++;
       CrowdFund storage crow = crowd[id];
      
       crow.title = _title;
       crow.fundingGoal = _fundingGoal;
       crow.owner = msg.sender;
       crow.durationTime = _durationTime + block.timestamp;
       crow.isActive = true;

       emit ProposeCampaign(id, _title, _fundingGoal, _durationTime);
    }



    
    function contributeEth(uint _ID) external payable{
         CrowdFund storage crow = crowd[_ID];
        require(crow.isActive == true, "not active");
        require(crow.fundingBalance < crow.fundingGoal, "Funding Goal Achieved");
        require(block.timestamp <= crow.durationTime, "Not in duration");
        contribute[_ID][msg.sender] += msg.value;
        crow.fundingBalance += msg.value;
        crow.contributors.push(msg.sender);

        emit ContributeEth(_ID);
    }

    function campaignEnds(uint _ID) external {
         CrowdFund storage crow = crowd[_ID];
         require(crow.isActive = true, "Already ended");
        require(msg.sender == crow.owner, "Only Campaign owner");
        require(crow.durationTime <= block.timestamp, "Time Has not been reached");
        if(crow.fundingBalance < crow.fundingGoal) {
            // to refund everyone because we didn't reach the funding goal
            refundContributors(_ID);
        } else {
            markSuccessful(_ID);
        }
        emit CampaignEnds(_ID);
    }


    function refundContributors(uint _ID) internal {
         CrowdFund storage crow = crowd[_ID];
        address[] memory contributors = crow.contributors;
        for(uint i= 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint amountToRefund =  contribute[_ID][contributor];
            crow.fundingBalance -= amountToRefund;
            contribute[_ID][contributor] -= amountToRefund;
            payable(contributor).transfer(amountToRefund);
        }
        crow.isActive = false;

    }

    function markSuccessful(uint _ID) internal {
        CrowdFund storage crow = crowd[_ID];
        payable(crow.owner).transfer(crow.fundingBalance);
        crow.fundingBalance = 0;
        crow.isActive = false;
    }

    function getContributors(uint _ID) external view returns (address[] memory){
       CrowdFund storage crow = crowd[_ID];
        return crow.contributors;
    }
}