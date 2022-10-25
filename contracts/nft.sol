//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface nft {
    function owner() external view returns (address);

    function transferOwnership(address newOwner) external;
}
