import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  addPoint,
  createTransaction,
  updatePoint,
} from "../../services/ApiServices";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import {
  contractInstance,
  getPrivateKey,
  getProvider,
} from "../../services/Web3authServices";
import abi from "../../utils/ERC20.abi.json";
import eventEmitter from "../../utils/events";
import moment from "moment";
import {
  handlePointsToTokenService,
  handleTokensToPointService,
} from "../../services/wallet";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  handleTokenTransferByAdmin,
  handleTokenTransferByUser,
  mintNft,
  privateWallet,
  stake,
  unstake,
} from "../../utils/suiFunctions";

const Swap = (props: any) => {
  const { user, setLoader, setMessage } = props;
  const navigate = useNavigate();
  const [payLabel, setPayLabel] = useState("GCDT");
  const [receiveLabel, setReceiveLabel] = useState("Points");
  const [pay, setPay] = useState<string>("");
  const [receive, setReceive] = useState<number>(0);
  const [swap, setSwap] = useState(0); // 0 - token to point & 1 - point to token

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow digits (0-9), backspace, and a decimal point
    const isValidInput = /^\d*\.?\d*$/.test(e.currentTarget.value + e.key);

    if (!isValidInput) {
      e.preventDefault();
    }
  };

  const handleSwap = () => {
    if (payLabel === "GCDT") {
      setPayLabel("Points");
      setReceiveLabel("GCDT");
      setSwap(1);
    } else {
      setPayLabel("GCDT");
      setReceiveLabel("Points");
      setSwap(0);
    }
    setPay("");
    setReceive(0);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (pay === "" || Number(pay) === 0) {
      toast.error("Please enter amount");
      return;
    }
    if (swap) {
      //logic for point to token conversion
      console.log("point to token");
      if (Number(pay) > user.points) {
        toast.error("You don't have enough points");
        return;
      }
      await handlePointsToToken();
    } else {
      //logic for point to token conversion
      console.log("token to point");
      await handleTokenToPoint();
    }
  };

  const handlePointsToToken = async () => {
    setLoader(true);
    setMessage("Conversion started. Please wait...");
    try {
      const { idToken } = (await fetchAuthSession()).tokens ?? {};
      console.log("session", idToken?.payload?.sub);
      // let transferAmount: any = ethers.utils.parseUnits(pay?.toString(), 18);
      // const response = await handlePointsToTokenService({
      //   sub_id: idToken?.payload?.sub as string,
      //   tokenAddress: process.env.REACT_APP_CONTRACT_ADDRESS as string,
      //   pointsAmount: transferAmount?.toString(),
      // });

      // const { status, data, message } = response;
      let res = await handleTokenTransferByAdmin(Number(pay));
      console.log("resssssss", res);
      // if (status === 200) {
      setMessage("Updating points...");
      // const updtPointRes = await updatePoint({
      //   points: Number(pay),
      // });
      // if (!updtPointRes.status) {
      //   throw new Error(updtPointRes.message);
      // }
      setMessage("Creating transaction...");
      // const txn1 = await createTransaction({
      //   walletAddress: user.walletAddress,
      //   label: "Points to Tokens Conversion",
      //   transactionHash: data.transactionHash,
      //   tokenValue: pay,
      //   chainId: 80001,
      //   web: 3,
      //   paymentRef: "Credit",
      // });

      // const txn2 = await createTransaction({
      //   walletAddress: user.walletAddress,
      //   label: "Points to Tokens Conversion",
      //   transactionHash: data.transactionHash,
      //   amount: pay,
      //   chainId: 80001,
      //   web: 3,
      //   paymentRef: "Debit",
      // });

      // if (!txn1.status || !txn2.status) {
      //   throw new Error(txn1.message);
      // }

      toast.success("Conversion Successful");
      props.handleTokeBalanceRefresh();
      props.handleDataRefresh();
      setPay("");
      setReceive(0);
      eventEmitter.emit("transactionReload");
      // } else {
      //   toast.error(message);
      // }
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error:", error);
    } finally {
      setLoader(false);
    }
  };

  const handleTokenToPoint = async () => {
    setLoader(true);
    try {
      setMessage("Please wait...");
      const { idToken } = (await fetchAuthSession()).tokens ?? {};
      console.log("session", idToken?.payload?.sub);
      const { walletAddress } = privateWallet();
      let res = await handleTokenTransferByUser(Number(pay), walletAddress);
      console.log("resssssss", res);
      // let transferAmount: any = ethers.utils.parseUnits(pay?.toString(), 18);
      // const response = await handleTokensToPointService({
      //   sub_id: idToken?.payload?.sub as string,
      //   tokenAddress: process.env.REACT_APP_CONTRACT_ADDRESS as string,
      //   toAddress: process.env.REACT_APP_CONTRACT_OWNER_ADDRESS as string,
      //   tokenAmount: transferAmount?.toString(),
      // });
      setMessage("Conversion started. Please wait...");

      // const { status, data, message } = response;
      // if (status === 200) {
      setMessage("Updating points...");
      // const updtPointRes = await addPoint({
      //   points: Number(pay),
      // });
      // if (!updtPointRes.status) {
      //   throw new Error(updtPointRes.message);
      // }
      setMessage("Creating transaction");
      //   const txn1 = await createTransaction({
      //     walletAddress: user.walletAddress,
      //     label: "Tokens to Points Conversion",
      //     transactionHash: data.transactionHash,
      //     tokenValue: pay,
      //     chainId: 80002,
      //     web: 3,
      //     paymentRef: "Debit",
      //   });

      //   const txn2 = await createTransaction({
      //     walletAddress: user.walletAddress,
      //     label: "Tokens to Points Conversion",
      //     transactionHash: data.transactionHash,
      //     amount: pay,
      //     chainId: 80002,
      //     web: 3,
      //     paymentRef: "Credit",
      //   });

      //   if (!txn1.status || !txn2.status) {
      //     throw new Error(txn1.message);
      //   }

      //   toast.success("Conversion Successful");
      //   props.handleDataRefresh();
      //   props.handleTokeBalanceRefresh();

      //   eventEmitter.emit("transactionReload");
      // } else {
      //   toast.error(message);
      // }
    } catch (error) {
      toast.error("Error while transferring");
      console.log("Error in handle transfer: ", error);
    } finally {
      setLoader(false);
      setPay("");
      setReceive(0);
    }
  };

  return (
    <div className="converter mb-2">
      <h5>Converter</h5>
      <div className="upper-box">
        <span className="heading">You Give</span>
        <div className="form-box d-flex justify-content-between align-items-center">
          <input
            type="text"
            placeholder="Enter value"
            onKeyPress={handleKeyPress}
            style={{ marginRight: "5px" }}
            value={pay}
            onChange={(e) => {
              setPay(e.target.value);
              setReceive(Number(e.target.value));
            }}
          />
          <h1>{payLabel}</h1>
        </div>
      </div>
      <div className="swap-icon" onClick={handleSwap}>
        <img src="/images/swap-icon.png" alt="swap" />
      </div>
      <div className="lower-box">
        <span className="heading">You Receive</span>
        <div className="d-flex justify-content-between align-items-center">
          <div className="form-box d-flex justify-content-between align-items-end w-100">
            <h1 style={{ lineHeight: "0px" }}>
              {receive}
              <span style={{ marginLeft: "5px" }}>{receiveLabel}</span>
            </h1>
            <button onClick={handleSubmit}>SUBMIT</button>
            <button onClick={mintNft}>Mint</button>
            <button onClick={stake}>Stake</button>
            <button onClick={unstake}>Unstake</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
