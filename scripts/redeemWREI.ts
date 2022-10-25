import { ethers } from "hardhat";
import axios from "axios";

async function main() {
  const signers = await ethers.getSigners();
  const signerLeakage = signers[0];
  const newSigner = signers[1];

  const WREI = await ethers.getContractAt(
    "Token",
    "0x2545AF3D8b11e295bB7aEdD5826021AB54F71630"
  );

  const balance = await WREI.balanceOf(signerLeakage.address);
  console.log("Balance of signerLeakage: ", balance.toString());
  // const gas = await ethers.provider.estimateGas({
  //   to: WREI.address,
  //   from: signerLeakage.address,
  //   data:
  //     ethers.utils
  //       .keccak256(ethers.utils.toUtf8Bytes("transfer(address,uint256)"))
  //       .slice(0, 10) +
  //     ethers.utils.defaultAbiCoder
  //       .encode(["address", "uint256"], [newSigner.address, balance])
  //       .slice(2),
  // });
  // console.log("gas:", gas.toString());
  // const leakageWallet = new ethers.Wallet(process.env.PRIVATE_KEY1!);
  // const nonce = await signerLeakage.getTransactionCount();
  // const raxTx = await leakageWallet.signTransaction({
  //   to: WREI.address,
  //   data:
  //     ethers.utils
  //       .keccak256(ethers.utils.toUtf8Bytes("transfer(address,uint256)"))
  //       .slice(0, 10) +
  //     ethers.utils.defaultAbiCoder
  //       .encode(["address", "uint256"], [newSigner.address, balance])
  //       .slice(2),
  //   gasLimit: gas,
  //   gasPrice: ethers.utils.parseUnits("2", "gwei"),
  //   nonce: nonce,
  // });
  // const result = await axios({
  //   method: "post",
  //   url: "https://rpc.rei.network",
  //   data: {
  //     jsonrpc: "2.0",
  //     method: "eth_sendRawTransaction",
  //     params: [raxTx],
  //     id: 1,
  //   },
  // });
  // const hash = await result.data.result;
  // console.log("hash:", hash);
  const balance2 = await WREI.balanceOf(newSigner.address);
  console.log("Balance of newSigner: ", balance2.toString());
  const tx2 = await WREI.connect(newSigner).withdraw(balance2);
  await tx2.wait();
  console.log(
    "balance:",
    (await newSigner.getBalance()).div(ethers.utils.parseEther("1")).toString()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
