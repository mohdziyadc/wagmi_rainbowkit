// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {

    //Create a variable for our faucet
    uint256 drip = 1 ether; // ether =  1 * (10 ** 18) 

    //Mapping to Keep Track of the Time Each Wallet Requests
    mapping (address => uint256) public addressTime;


    constructor(string memory _name, string memory symbol) ERC20(_name, symbol) {

        //Pre-Mint the Deployer 200 Tokens
        _mint(msg.sender, 200 * 10 ** decimals()); 
    }

    //Users can mint tokens to a specified address and the amount they want to send
    function mint(address to, uint256 amount) public  { // << Removed the onlyOwner Modifier to everybody can try
        _mint(to, amount);
    }

    //Users can claim a token from my token faucet - get users to keep coming back to your site
    function faucet() external {
        // Requirement to make each wallet wait a specific amount of time
        require(addressTime[msg.sender] < block.timestamp, "need to wait more time");
        //Let the user claim a token
        _mint(msg.sender, drip);
        //Update the address time, to make them wait the set amount of time
        addressTime[msg.sender] = block.timestamp + 1 minutes;  // Can use seconds, minutes, hours, days, etc
    }

     // Buy Tokens
     function buy (uint256 _amount) external payable {
        //Make sure they pay something 
         require(msg.value > 0, "send money");
         _mint(msg.sender, _amount);
     }

    //Withdraw any Eth from the contract
     function withdraw() external onlyOwner {     
        payable(msg.sender).transfer(address(this).balance);
    }

}
