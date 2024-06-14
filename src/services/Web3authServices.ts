import BigNumber from "bignumber.js";
import EthereumRpc from "../utils/evm.ethers";
import { web3authSfa } from "./../utils/web3auth";
import { ethers } from "ethers";
import abi from "./../utils/ERC20.abi.json";

export const getAccount = async () => {
  if (!web3authSfa.provider) {
    console.log("No provider found");
    return;
  }
  const rpc = new EthereumRpc(web3authSfa.provider);
  const userAccount = await rpc.getAccounts();
  return userAccount;
};

export const getBalance = async () => {
  if (!web3authSfa.provider) {
    console.log("No provider found");
    return;
  }
  const rpc = new EthereumRpc(web3authSfa.provider);
  const balance = await rpc.getBalance();
  return balance;
};

export const contractInstance = async () => {
  if (!web3authSfa.provider) {
    console.log("No provider found");
    return;
  }
  const rpc = new EthereumRpc(web3authSfa.provider);
  const instance = await rpc.getContractInstance();
  return instance;
};

export const getSigner = async () => {
  if (!web3authSfa.provider) {
    console.log("No provider found");
    return;
  }
  const rpc = new EthereumRpc(web3authSfa.provider);
  const signer = await rpc.getSigner();
  return signer;
};

export const getProvider = async () => {
  if (!web3authSfa.provider) {
    console.log("No provider found");
    return;
  }
  const rpc = new EthereumRpc(web3authSfa.provider);
  const signer = await rpc.getProvider();
  return signer;
};

export const getPrivateKey = async () => {
  if (!web3authSfa.provider) {
    console.log("No provider found");
    return Error("No provider found");
  }
  const pk: any = await web3authSfa.provider.request({
    method: "private_key",
  });
  return pk;
};

export const tokenBalance = async (address: string) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_RPC_URL as string
    );
    let contract = new ethers.Contract(
      process.env.REACT_APP_CONTRACT_ADDRESS!,
      abi,
      provider
    );

    console.log("contract: ", contract)
    if (!contract) {
      console.error("Contract is undefined");
      return null;
    }
    const tb = await contract.balanceOf(address);

    if (tb === undefined) {
      console.error("Token balance is undefined");
      return null;
    }
    const bal = new BigNumber(tb.toString()).dividedBy(
      new BigNumber(10).pow(18)
    );
    return bal?.toString();
  } catch (error) {
    console.error(error);
    return null;
  }
};
