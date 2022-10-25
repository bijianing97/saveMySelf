// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import axios from "axios";

async function main() {
  const signers = await ethers.getSigners();
  const signerLeakage = signers[0];
  const newSigner = signers[1];

  const reiGBP = await ethers.getContractAt(
    "nft",
    "0x4035374c2c157F46effeA16e71A62b8992F2AD1b"
  );
  const reiFans = await ethers.getContractAt(
    "nft",
    "0x490b641A3B87c3C769E24e850163E9aAb23b4E8B"
  );
  const oldOwnerGBP = await reiGBP.owner();
  const oldOwnerFans = await reiFans.owner();
  console.log("old ownerGBP:", oldOwnerGBP);
  console.log("old ownerFans:", oldOwnerFans);
  const nonce = await signerLeakage.getTransactionCount();
  console.log("nonce:", nonce);

  // await newSigner.sendTransaction({
  //   to: signerLeakage.address,
  //   value: ethers.utils.parseEther("0.1"),
  // });
  const func = ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes("transferOwnership(address)"))
    .slice(0, 10);

  const data1 = new ethers.utils.AbiCoder()
    .encode(["address"], [newSigner.address])
    .slice(2);
  const data2 = ethers.utils.defaultAbiCoder
    .encode(["address"], [newSigner.address])
    .slice(2);

  console.log("data1:", data1);
  console.log("data2:", data2);
  const gas1 = await ethers.provider.estimateGas({
    to: reiGBP.address,
    data:
      func +
      new ethers.utils.AbiCoder()
        .encode(["address"], [newSigner.address])
        .slice(2),
  });
  const gas2 = await ethers.provider.estimateGas({
    to: reiFans.address,
    data:
      func +
      new ethers.utils.AbiCoder()
        .encode(["address"], [newSigner.address])
        .slice(2),
  });
  console.log("gas1:", gas1.toString());
  console.log("gas2:", gas2.toString());

  // 先estimate gas，然后组成交易
  // 与合约的交互data是function selector + abi.encode
  // function selector是keccak256(函数名+参数类型)的前4个字节
  // abi.encode是将参数编码成bytes,去掉前面的0x,用ethers.utils.AbiCoder().encode(["address"], [newSigner.address]).slice(2)
  const signerLeakageWallet = new ethers.Wallet(
    "0x7955eb198556111a61668515bea07da45265a88548e5fe02ad593e9354bd779b"
  );
  const rawTx1 = await signerLeakageWallet.signTransaction({
    to: "0x4035374c2c157f46effea16e71a62b8992f2ad1b",
    data:
      func +
      new ethers.utils.AbiCoder()
        .encode(["address"], [newSigner.address])
        .slice(2),
    gasLimit: gas1,
    nonce: nonce,
    gasPrice: ethers.utils.parseUnits("4", "gwei"),
  });
  const rawTx2 = await signerLeakageWallet.signTransaction({
    to: "0x490b641A3B87c3C769E24e850163E9aAb23b4E8B",
    data:
      func +
      new ethers.utils.AbiCoder()
        .encode(["address"], [newSigner.address])
        .slice(2),
    gasLimit: gas2,
    nonce: nonce + 1,
    gasPrice: ethers.utils.parseUnits("4", "gwei"),
  });

  console.log("rawTx1:", rawTx1);
  console.log("rawTx2:", rawTx2);

  const response1 = await axios({
    method: "post",
    url: "https://rpc.rei.network",
    data: {
      jsonrpc: "2.0",
      method: "eth_sendRawTransaction",
      params: [rawTx1],
      id: 1,
    },
  });

  const response2 = await axios({
    method: "post",
    url: "https://rpc.rei.network",
    data: {
      jsonrpc: "2.0",
      method: "eth_sendRawTransaction",
      params: [rawTx2],
      id: 1,
    },
  });

  console.log("response1:", await response1.data.result);
  console.log("response2:", await response2.data.result);
  const newOwnerGBP = await reiGBP.owner();
  const newOwnerFans = await reiFans.owner();
  console.log("new owner", newOwnerGBP, newOwnerFans);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
