import React, { useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { createTransaction } from "../../services/ApiServices";
import eventEmitter from "../../utils/events";
import { handleTransfer } from "../../services/wallet";
import { fetchAuthSession } from "aws-amplify/auth";
import { handleTokenTransferByUser } from "../../utils/suiFunctions";

const Transfer = (props: any) => {
  const { user, setLoader, setMessage } = props;
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState<string | number>("");

  const isValidEthereumAddress = (address: string) => {
    const ethereumAddressRegex = /^0x[0-9a-fA-F]{40}$/;

    return ethereumAddressRegex.test(address);
  };

  const handleTransferToken = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!toAddress) {
      toast.error("Please enter the recipient wallet address");
      return;
    }
    if (!isValidEthereumAddress(toAddress)) {
      toast.error("Please provide a valid address");
      return;
    }

    if (!amount) {
      toast.error("Please enter amount");
      return;
    }

    setLoader(true);
    setMessage("Handling transfer...");
    try {
      const { idToken } = (await fetchAuthSession()).tokens ?? {};
      console.log("session", idToken?.payload?.sub);
      let transferAmount: any = ethers.utils.parseUnits(amount?.toString(), 18);
      const response = await handleTransfer({
        sub_id: idToken?.payload?.sub as string,
        tokenAddress: process.env.REACT_APP_CONTRACT_ADDRESS as string,
        toAddress,
        tokenAmount: transferAmount?.toString(),
      });
      console.log("response", response);
      setMessage("Please wait...");
      const { status, data, message } = response;
      if (status === 200) {
        setMessage("Creating transaction...");
        const txn = await createTransaction({
          walletAddress: user.walletAddress,
          label: "Transfer Token",
          transactionHash: data.transactionHash,
          tokenValue: amount,
          chainId: 80002,
          web: 3,
          paymentRef: "Debit",
        });

        if (!txn.status) {
          throw new Error(txn.message);
        }

        toast.success("Transaction Successful");
        props.handleDataRefresh();
        props.handleTokeBalanceRefresh();

        eventEmitter.emit("transactionReload");
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("Error while transferring");
      console.log("Error in handle transfer: ", error);
    } finally {
      setLoader(false);
      setAmount(0);
      setToAddress("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow digits (0-9), backspace, and a decimal point
    const isValidInput = /^\d*\.?\d*$/.test(e.currentTarget.value + e.key);

    if (!isValidInput) {
      e.preventDefault();
    }
  };

  return (
    <div className="transfer">
      <h5>Transfer</h5>
      <div className="box">
        <span className="heading">Send Tokens</span>
        <div className="form-box d-flex justify-content-between align-items-start flex-column flex-wrap mb-2">
          <label>Recipient Name</label>
          <input
            type="text"
            className="w-100"
            placeholder="Enter recipient wallet address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          ></input>
        </div>
        <div className="d-flex align-items-end flex-wrap   gap-2">
          <div className="form-box d-flex justify-content-between align-items-start flex-column flex-wrap ">
            <label>Amount</label>
            <input
              type="text"
              className="w-100"
              placeholder="Enter amount"
              onKeyPress={handleKeyPress}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            ></input>
          </div>
          <button
            onClick={() => {
              handleTokenTransferByUser(amount, toAddress);
            }}
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
