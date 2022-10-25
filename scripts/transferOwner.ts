import { ethers } from "hardhat";

async function main() {
  const defaultSigner = (await ethers.getSigners())[1];
  const newAddress = "0x68324902cEB8D188c09909Fb94584B4603e8E7bb";
  const reiFans = await ethers.getContractAt(
    "nft",
    "0x490b641A3B87c3C769E24e850163E9aAb23b4E8B"
  );
  //   const tx = await reiFans.connect(defaultSigner).transferOwnership(newAddress);
  //   await tx.wait();
  //   console.log("tx:", tx);
  console.log("new owner:", await reiFans.owner());
  const tx2 = await defaultSigner.sendTransaction({
    to: newAddress,
    value: ethers.utils.parseEther("0.5"),
  });
  await tx2.wait();
  console.log("tx2:", tx2);
  console.log("balance:", await ethers.provider.getBalance(newAddress));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
