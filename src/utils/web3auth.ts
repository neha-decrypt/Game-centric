import { Web3Auth } from "@web3auth/single-factor-auth";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

const verifier = process.env.REACT_APP_VERIFIER!;
const clientId = process.env.REACT_APP_CLIENT_ID!;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: process.env.REACT_APP_CHAIN_ID!,
  rpcTarget: process.env.REACT_APP_RPC_URL!,
  displayName: process.env.REACT_APP_DISPLAY_NAME!,
  blockExplorer: process.env.REACT_APP_EXPLORER_URL!,
  ticker: "MATIC",
  tickerName: "Matic",
};

const web3authSfa = new Web3Auth({
  clientId,
  web3AuthNetwork: "testnet",
  usePnPKey: false,
});

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

export  { web3authSfa, ethereumPrivateKeyProvider, verifier };

