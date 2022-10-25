//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface Token {
    function transfer(address dst, uint256 wad) external returns (bool);

    function balanceOf(address guy) external view returns (uint256);

    function withdraw(uint256 wad) external;
}
