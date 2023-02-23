//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IStakedPunk.sol";

contract CrytoDevToken is ERC20, Ownable {
    uint256 public constant tokenPrice = 0.001 ether;

    uint256 public constant tokensPerNFT = 10 * 10 ** 18;

    uint256 public constant maxTotalSupply = 10000 * 10 ** 18;

    IStakedPunks StakedPunkNFT;

    mapping(uint256 => bool) public tokensIdsClaimed;

    constructor(address _StakedPunk) ERC20("StakedPunk Token", "CD") {
        StakedPunkNFT = IStakedPunks(_StakedPunk);
    }

    /**
     * @dev Mints `amount` number of tokens
     * Requirements:
     *  - msg.value should be equal or greater than the tokenPrice * amount;
     */
    function mint(uint256 amount) public payable {
        uint256 _requiredAmount = tokenPrice * amount;
        require(msg.value >= _requiredAmount, "Ether sent might be too small");

        uint256 amountWithDecimals = amount * 10 ** 18;
        require(
            totalSupply() + amountWithDecimals <= maxTotalSupply,
            "Exceeds the max total supply"
        );

        _mint(msg.sender, amountWithDecimals);
    }

    /**
     * @dev Mints tokens based on the number of NFT's held by the sender
     * Requirements:
     * balance of Crypto Dev NFT's owned by the sender should be greater than 0
     * Tokens should have not been claimed for all the NFTs owned by the sender
     */
    function claim() public {
        address sender = msg.sender;

        uint256 balance = StakedPunkNFT.balanceOf(sender);
        require(balance > 0, "You don't own any Staked Punk NFT");
        //amount keeps track of number of unclaimed tokens
        uint256 amount = 0;
        //loop over the balance and get the token ID owned by `sender` at at a given `index` of its token list.
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenID = StakedPunkNFT.tokenOfOwnerbyIndex(sender, i);
            // if the tokens for this tokenID have not been claimed, increase the amount
            if (!tokensIdsClaimed[tokenID]) {
                amount += 1;
                tokensIdsClaimed[tokenID] = true;
            }
        }
        //if all the tokens for the tokenID has been claimed, revert the transaction
        require(amount == 0, "You have already claimed all the tokens");
        _mint(msg.sender, amount ** tokensPerNFT);
    }

    /**
     * @dev withdraw all eth sent to the contract
     * Requirements - should only be callable by contract owner
     */
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw, contract balance empty");

        address _owner = owner();
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "withdrawal failed");
    }

    //function to receive ether -- msg.data must be empty
    receive() external payable {}

    //fallback to be executed if msg.data is not empty
    fallback() external payable {}
}
