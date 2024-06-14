import React, { useEffect, useRef, useState } from "react";
import { IoIosWarning } from "react-icons/io";
import { FiShare2 } from "react-icons/fi";
import { HiUsers } from "react-icons/hi2";
import { RiUserFollowLine } from "react-icons/ri";
import "./Dashboard.scss";
import Tabs from "./Tabs/Tabs";
import {
  checkTokenValidity,
  fetchProfile,
  getUserTotalPoints,
} from "../services/ApiServices";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { clearCookie, getCookie } from "../utils/helpers";
import { ethereumPrivateKeyProvider, web3authSfa } from "../utils/web3auth";
import { FaCopy } from "react-icons/fa6";
import { ClipLoader } from "react-spinners";
import PaymentPopup from "./Common/PaymentPopup";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>("");
  const [name, setName] = useState("");
  const [call, setCall] = useState(false);
  const userRef = useRef(false);
  

  useEffect(() => {
    (async () => {
      const cookieToken = getCookie("GCToken");
      if(!cookieToken){
        navigate("/");
        return
      }
    
    })();
    fetchUser()
  }, []);

  // useEffect(() => {
  //   const abortController = new AbortController();
  //   const fetchData = async () => {
  //     try {
  //       const signal = abortController.signal;

  //       const _profile = await getUserTotalPoints(signal);
  //       if (!_profile.status) {
  //         throw new Error(_profile.message);
  //       }
  //       const _name = getCookie("GCName") ?? "User";
  //       setName(_name);
  //       setUser(_profile.data);
  //       setCall(true);
  //     } catch (error: any) {
  //       // Check if the error is due to the fetch being aborted
  //       if (error?.name === "AbortError") {
  //         console.log("Fetch operation was aborted");
  //       } else {
  //         if (error?.message?.includes("Unauthorized")) {
  //           localStorage.clear();
  //           clearCookie();
  //           toast.error(error?.message);
  //           navigate("/");
  //         }
  //         console.trace(error);
  //       }
  //     } finally {
  //       abortController.abort();
  //     }
  //   };

  //   fetchData();
  //   return () => abortController.abort();
  // }, []);

  const fetchUser = async () => {
    userRef.current = true;
    try {
      const _validToken = await checkTokenValidity();
      if (!_validToken.status) {
        throw new Error(_validToken.message);
      }
      const _profile = await fetchProfile();
      if (!_profile.status) {
        throw new Error(_profile.message);
      }
      const _name = getCookie("GCName") ?? "User";
      setName(_name);
      console.log(_profile)
      setUser(_profile.data);
      console.log(_profile.data)
      setCall(true);
    } catch (error: any) {
      console.log("error in fetchUser", error);
      if (error?.message?.includes("Unauthorized")) {
        localStorage.clear();
        clearCookie();
        toast.error(error?.message);
        navigate("/");
      } else {
        toast.error(error?.message);
      }
    }
  };

  const handleDataRefresh = () => {
    fetchUser();
  };

  const copyToClipboard = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copied to clipboard")
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

 

  return (
    <section className="p-4">
      <div className="up container">
        <div className="row">
          <div className="col-md-12 d-flex align-items-center justify-content-center flex-wrap p-2 col-container">
            <div className="profile">
              <h6>80%</h6>
              <div className="completion-progress">
                <img src="/images/Profile Picture.png" />
              </div>
              {/* <span className="warning">
                Profile Completion <IoIosWarning />
              </span> */}
            </div>
            <div className="card-box">
              {user  ?
              <div className="top">
                <div className="d-flex align-items-center justify-content-between">

                <h4 className="m-0">
                  { user?.walletAddress?.slice(0, 6) +
                      "..." +
                      user?.walletAddress?.slice(-6)
                    }
                </h4>
                  <div className="mx-2" style={{cursor:"pointer"}} onClick={()=>copyToClipboard(user?.walletAddress)}>
                    <FaCopy size={15} />
                  </div>
                </div>
                <div className="my-1 d-flex align-items-center justify-content-start">
                <h5 className="m-0">Email: {user.email} </h5> 
                  </div>
              </div> : <ClipLoader color="#01f801" size={14} />}
              <div className="bottom d-flex align-items-center justify-content-between">
                {/* <button type="button" className="share btnn">
                  <FiShare2 />
                  SHARE
                </button> */}
                 {/* <div className="text-end">
                        {user.points ? (
                          user.points
                        ) : (
                          <ClipLoader color="#01f801" size={14} />
                        )}{" "}
                        Points
                      </div> */}
                <div className="d-flex align-items-end justify-content-around">
              <div className="share btnn ">
                    POINTS - {user ? user.points :   <ClipLoader color="#01f801" size={14} />}
                  </div>
                  
                  {/* <button type="button" className="follow btnn">
                    <RiUserFollowLine />
                    Follow
                  </button> */}
                </div>
              </div>
            </div>
          </div>
          {/* <div className="col-md-12 user-data d-flex align-items-center justify-content-center flex-wrap">
            <div className="items d-flex align-items-center justify-content-center mx-3">
              <div className="label">RANK</div>
              <div className="value">IRON</div>
            </div>
            <div className="items d-flex align-items-center justify-content-center mx-3">
              <div className="label">TOURNAMENTS</div>
              <div className="value">00000</div>
            </div>
            <div className="items d-flex align-items-center justify-content-center mx-3">
              <div className="label">MEMBER SINCE</div>
              <div className="value">MM/DD/YYYY</div>
            </div>
            <div className="items d-flex align-items-center justify-content-center mx-3">
              <div className="label">POINTS</div>
              <div className="value">00000</div>
            </div>
          </div> */}
        </div>
      </div>
      <div className="down container py-5">
        <Tabs call={call} user={user} handleDataRefresh={handleDataRefresh} />
      </div>
    </section>
  );
};

export default Dashboard;
