import React, { useEffect, useRef, useState } from "react";
import "./Tabs.scss";
import Transaction from "../Transaction/Transaction";
import { getProvider, tokenBalance } from "../../services/Web3authServices";
import { getCookie } from "../../utils/helpers";
import abi from "../../utils/ERC20.abi.json";
import { toast } from "sonner";
import {
  createSession,
  createTransaction,
  getSessionStatus,
  updateSessionStatus,
} from "../../services/ApiServices";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import Loader from "../Common/Loader";
import Swap from "./Swap";
import { useNavigate } from "react-router-dom";
import Transfer from "./Transfer";
import eventEmitter from "../../utils/events";
import Redemption from "../Redemption/Redemption";
import Modal from "../Common/Modal";
import { ClipLoader } from "react-spinners";
import { IoReload } from "react-icons/io5";
import PaymentPopup from "../Common/PaymentPopup";
import {
  fetchSuiTokenBalance,
  handleTokenTransferByAdmin,
} from "../../utils/suiFunctions";

const Tabs = (props: any) => {
  const { call, user } = props;
  const navigate = useNavigate();
  const [balance, setBalance] = useState("none");
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState("");
  const sessionRef = useRef(false);
  const [balanceLoader, setBalanceLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [suiBalance, setSuiBalance] = useState(0);

  const fetch = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId: any = urlParams.get("session_id");
    if (sessionId) {
      setLoader(true);
      setMessage("Fetching session status...");
      if (!sessionRef.current)
        fetchSessionStatus(user.walletAddress, sessionId);
    }
  };

  useEffect(() => {
    fetch();
  }, [user.walletAddress]);

  // const fetchBalance = async () => {
  //   console.log("called");
  //   setBalanceLoader(true);

  //   if (user?.walletAddress) {
  //     // let b: any = await tokenBalance(user.walletAddress);
  //     b = Number(0.02)?.toFixed(2);
  //     setBalance(b);
  //   }
  //   setBalanceLoader(false);
  // };

  useEffect(() => {
    if (call) {
      fetchBalance();
    }
  }, [props]);

  const fetchBalance = async () => {
    console.log("called");
    setBalanceLoader(true);

    if (user?.walletAddress) {
      let { suiAmount, tokenBalance } = await fetchSuiTokenBalance();
      tokenBalance = tokenBalance / 10 ** 9;
      suiAmount = suiAmount / 10 ** 9;
      setBalance(tokenBalance.toString());
      setSuiBalance(suiAmount);
    }
    setBalanceLoader(false);
  };

  const handleTokeBalanceRefresh = () => {
    fetch();
  };

  const handleCheckout = async (e: any) => {
    e.preventDefault();
    if (!amount) {
      toast.error("Enter token value");
      return;
    }
    const email: any = getCookie("GCEmail");
    setLoader(true);
    setMessage("Creating checkout...");
    try {
      const session: any = await createSession({
        amount: Number(amount),
        email,
      });
      if (session.status) {
        setClientSecret(session.data.clientSecret);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  const fetchSessionStatus = async (
    walletAddress: string,
    sessionId: string
  ) => {
    try {
      if (walletAddress) {
        sessionRef.current = true;
        console.log("walletAddress", walletAddress);
        const session: any = await getSessionStatus(sessionId);
        console.log(session);
        if (session.status) {
          toast.success(session.message);
          setLoader(false);
          navigate("/dashboard");
          setShowPopup(true);

          return;
        } else {
          toast.error(session.message);
        }
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
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
    <>
      {loader && <Loader message={message} />}
      {clientSecret && (
        <Modal
          clientSecret={clientSecret}
          handleClose={() => {
            setClientSecret("");
            setAmount("");
          }}
        />
      )}
      {showPopup && (
        <PaymentPopup
          handleClose={() => {
            setShowPopup(false);
            window.location.reload();
          }}
        />
      )}
      <div className="tabbing">
        <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="pills-home-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-home"
              type="button"
              role="tab"
              aria-controls="pills-home"
              aria-selected="true"
            >
              ACCOUNT
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="pills-profile-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-profile"
              type="button"
              role="tab"
              aria-controls="pills-profile"
              aria-selected="false"
            >
              REDEMPTION
            </button>
          </li>
        </ul>
        <div className="tab-content" id="pills-tabContent">
          <div
            className="tab-pane fade show active"
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
          >
            <div className="row account">
              <div className="col-md-7 d-flex justify-content-start align-items-start flex-wrap flex-column">
                <div className="w-100 d-flex justify-content-center align-items-start flex-wrap gap-2">
                  <div className="balance mb-2">
                    <h5>Balance</h5>
                    <div className="upper-box">
                      <span className="heading">Token Balance </span>
                      <IoReload
                        title="reload balance"
                        className="mx-1 text-white"
                        size={14}
                        style={{ cursor: "pointer" }}
                        onClick={fetchBalance}
                      />
                      <h1 className="mt-2">
                        {!balanceLoader && balance !== "none" ? (
                          balance
                        ) : (
                          <ClipLoader color="#01f801" size={14} />
                        )}{" "}
                        GCDT
                      </h1>
                      <span>sui: {suiBalance}</span>
                    </div>
                    <div className="lower-box">
                      <span className="heading">Buy Tokens</span>
                      <div className="d-flex justify-content-between align-items-end">
                        <div className="form-box d-flex justify-content-between align-items-start flex-column">
                          <label>Enter Amount</label>
                          <input
                            type="text"
                            placeholder="Enter value"
                            onKeyPress={handleKeyPress}
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                          ></input>
                        </div>
                        <button
                          onClick={async () => {
                            console.log("fn called");
                            await handleTokenTransferByAdmin(amount);
                          }}
                        >
                          SUBMIT
                        </button>
                      </div>
                    </div>
                  </div>
                  <Swap
                    user={user}
                    setLoader={setLoader}
                    setMessage={setMessage}
                    handleDataRefresh={props.handleDataRefresh}
                    handleTokeBalanceRefresh={handleTokeBalanceRefresh}
                  />
                </div>
                <Transfer
                  user={user}
                  setLoader={setLoader}
                  setMessage={setMessage}
                  handleDataRefresh={props.handleDataRefresh}
                  handleTokeBalanceRefresh={handleTokeBalanceRefresh}
                />
              </div>
              <div className="col-md-5" style={{ maxHeight: "500px" }}>
                <Transaction />
              </div>
            </div>
          </div>
          <div
            className="tab-pane fade"
            id="pills-profile"
            role="tabpanel"
            aria-labelledby="pills-profile-tab"
          >
            <Redemption
              handleDataRefresh={props.handleDataRefresh}
              handleTokeBalanceRefresh={handleTokeBalanceRefresh}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Tabs;
