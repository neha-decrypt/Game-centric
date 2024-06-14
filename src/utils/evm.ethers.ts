import type { IProvider } from "@web3auth/base";
import { ethers } from "ethers";
import abi from "../utils/ERC20.abi.json";

export default class EthereumRpc {
  private provider: IProvider;

  constructor(provider: IProvider) {
    this.provider = provider;
  }


  async getAccounts(): Promise<string> {
    try {
      const provider = new ethers.providers.Web3Provider(this.provider as IProvider);
      const signer = provider.getSigner();
      const address = signer.getAddress();
      return address;
    } catch (error: unknown) {
      return error as string;
    }
  }

  async getSigner(): Promise<any> {
    try {
      const provider = new ethers.providers.Web3Provider(this.provider as IProvider);
      const signer = provider.getSigner();
      return signer;
    } catch (error: unknown) {
      return error as string;
    }
  }

  async getProvider(): Promise<any> {
    try {
      const provider = new ethers.providers.Web3Provider(this.provider as IProvider);
      return provider;
    } catch (error: unknown) {
      return error as string;
    }
  }

  async getContractInstance(): Promise<any> {
    try {
      const provider = new ethers.providers.Web3Provider(this.provider as IProvider);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS!,
        abi,
        signer
      );
      return contract;
    } catch (error: unknown) {
      return error as string;
    }
  }

  async getBalance(): Promise<string> {
    try {
      const provider = new ethers.providers.Web3Provider(this.provider as IProvider);
     
      const signer = provider.getSigner();
      const address = signer.getAddress();

  
      const balance = ethers.utils.formatEther(
      await provider.getBalance(address)
      );
    
      return balance;
    } catch (error) {
      return error as string;
    }
  }

   
}
