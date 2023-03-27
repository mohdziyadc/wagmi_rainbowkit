import { ConnectButton } from "@rainbow-me/rainbowkit";

import {
  useAccount,
  useConnect,
  useNetwork,
  useContract,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import TokenContract from "../../artifacts/contracts/MyToken.sol/MyToken.json";

export default function Home() {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const [isDefinitelyConnected, setIsDefinitelyConnected] = useState(false);
  const { address, isConnected } = useAccount();
  const [supplyData, setSupplyData] = useState(0);

  //To avoid hydration error caused by the useAccount hook.
  useEffect(() => {
    if (isConnected) {
      setIsDefinitelyConnected(true);
    } else {
      setIsDefinitelyConnected(false);
    }
  }, [address]);

  console.log("Contract Address: ", CONTRACT_ADDRESS);
  console.log("Wallet Address: ", address);

  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: TokenContract.abi,
    functionName: "mint",
    args: [
      "0x7AcB5786b586b42c14510227A52b6EC769FB2f3f",
      ethers.utils.parseEther("3"),
    ],
  });

  //Must alias it since the return type of useContractWrite is same each time
  //if not aliased we can't call other write function.
  const {
    data: mintData,
    write: mintToken, //when called, this will actually execute the function.
    isLoading: isMintLoading,
    isSuccess: isMintSuccess,
    error: mintError,
  } = useContractWrite(config);

  const { isSuccess: mintSuccess, isLoading: mintLoading } =
    useWaitForTransaction({
      confirmations: 1,
      hash: mintData?.hash,
    });

  const { data: totalSupplyData } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: TokenContract.abi,
    functionName: "totalSupply",
    watch: true,
  });

  useEffect(() => {
    if (totalSupplyData) {
      let temp = totalSupplyData / 10 ** 18;
      setSupplyData(temp);
    }
  }, [totalSupplyData]);
  useEffect(() => {
    console.log("mintData:", mintData);
    console.log("isMintLoading:", isMintLoading);
    console.log("isMintStarted", isMintSuccess);
    console.log("mintError:", mintError);
    console.log("___________");
  }, [mintData, isMintLoading, isMintSuccess]);
  return (
    <>
      <div className="container flex flex-col  items-center mt-10">
        <div className="flex mb-6">
          <ConnectButton showBalance={false} />
        </div>
        <h3 className="text-5xl font-bold mb-20">
          {"Frosty Ninja's token drop"}
        </h3>

        {isDefinitelyConnected && (
          <div className="flex flex-col">
            <button
              onClick={() => {
                mintToken();
                console.log(mintData);
              }}
              className="bg-blue-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
              disabled={isMintLoading}
            >
              {mintSuccess ? (
                <p>Minted Successfully!</p>
              ) : isMintLoading || mintLoading ? (
                <p>Minting....</p>
              ) : (
                <p>Mint Tokens</p>
              )}
            </button>
          </div>
        )}
        <div className="text-center">
          <h3 className="text-lg ">Total minted</h3>

          <h3 className="text-lg">{supplyData}</h3>
        </div>
      </div>
    </>
  );
}
