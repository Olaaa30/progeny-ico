//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStakedPunks {
    /**
     * @dev returns a token ID by `owner` from a given `index` of its token list
     */
    function tokenOfOwnerbyIndex(
        address owner,
        uint256 index
    ) external view returns (uint256 tokenId);

    /**
     * @dev returns number of tokens in `owner's` account
     */
    function balanceOf(address owner) external view returns (uint256 balance);
}
