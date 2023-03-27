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
import TokenContract from "../contracts/tokenContract.json";

export default function Home() {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const [isDefinitelyConnected, setIsDefinitelyConnected] = useState(false);
  const { address, isConnected } = useAccount();
  const [supplyData, setSupplyData] = useState(0);

  console.log("Token Contract: ", TokenContract);

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

  const { config: mintConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: TokenContract.abi,
    functionName: "mint",
    args: [
      "0x7AcB5786b586b42c14510227A52b6EC769FB2f3f",
      ethers.utils.parseEther("3"),
    ],
  });
  const { config: buyConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: TokenContract.abi,
    functionName: "buy",
    args: [ethers.utils.parseEther("3")],
    overrides: {
      value: ethers.utils.parseEther("0.01"),
    },
  });

  const { config: faucetConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: TokenContract.abi,
    functionName: "faucet",
    args: [],
  });

  //Must alias it since the return type of useContractWrite is same each time
  //if not aliased we can't call other write function.
  const {
    data: mintData,
    write: mintToken, //when called, this will actually execute the function.
    isLoading: isMintLoading,
    isSuccess: isMintSuccess,
    error: mintError,
  } = useContractWrite(mintConfig);

  const {
    data: buyData,
    write: buyToken,
    isLoading: isBuying,
    isSuccess: isBuySuccess,
    error: buyError,
  } = useContractWrite(buyConfig);

  const {
    data: faucetData,
    write: faucetToken,
    isLoading: isFaucetLoading,
    isSuccess: isFaucetStarted,
    error: faucetError,
  } = useContractWrite(faucetConfig);

  const { isSuccess: mintSuccess, isLoading: mintLoading } =
    useWaitForTransaction({
      confirmations: 1,
      hash: mintData?.hash,
    });
  const { isSuccess: faucetSuccess, isLoading: faucetLoading } =
    useWaitForTransaction({
      confirmations: 1,
      hash: faucetData?.hash,
    });

  const { isSuccess: buySuccess, isLoading: buyLoading } =
    useWaitForTransaction({
      confirmations: 1,
      hash: buyData?.hash,
    });

  const { data: totalSupplyData } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: TokenContract.abi,
    functionName: "totalSupply",
    watch: true,
  });

  // claim faucet
  const claimFaucet = async () => {
    await faucetToken();
  };

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
          <>
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
            {mintSuccess && (
              <div className="text-center">
                Minting Success. Check out{" "}
                <a
                  href={`https://mumbai.polygonscan.com/tx/${mintData?.hash}`}
                  className="underline"
                >
                  Polyscan
                </a>
              </div>
            )}
            <div className="flex flex-col mb-4 mt-4">
              <button
                onClick={() => {
                  buyToken();
                }}
                className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
              >
                {buySuccess ? (
                  <p>Bought Tokens</p>
                ) : buyLoading || isBuying ? (
                  <p>Buying...</p>
                ) : (
                  <p>Buy Tokens</p>
                )}
              </button>
              {/* No success tag */}
            </div>
            {buySuccess && (
              <div className="text-center">
                Tokens Bought. Check out{" "}
                <a
                  href={`https://mumbai.polygonscan.com/tx/${buyData?.hash}`}
                  className="underline"
                >
                  Polyscan
                </a>
              </div>
            )}

            <div className="flex flex-col mb-4">
              <button
                onClick={claimFaucet}
                className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
              >
                {faucetSuccess ? (
                  <p>Claimed</p>
                ) : isFaucetLoading || faucetLoading ? (
                  <p>Claiming...</p>
                ) : faucetError ? (
                  <p>Claim Failed</p>
                ) : (
                  <p>Claim Faucet</p>
                )}
              </button>
              {/* No success tag */}
            </div>
            {faucetSuccess && (
              <div className="text-center">
                Faucet Claimed. Check out{" "}
                <a
                  href={`https://mumbai.polygonscan.com/tx/${faucetData?.hash}`}
                  className="underline"
                >
                  Polyscan
                </a>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-lg ">Total minted</h3>

              <h3 className="text-lg">{supplyData}</h3>
            </div>
          </>
        )}
      </div>
    </>
  );
}
