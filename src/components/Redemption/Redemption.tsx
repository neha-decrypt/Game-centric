import { useEffect, useState } from "react";
import { dummyItems } from "../../utils/dummyData";
import "./Redemption.scss";
import { AiOutlineGlobal } from "react-icons/ai";
import {
  checkTokenValidity,
  createTransaction,
  fetchProfile,
  redeemItem,
} from "../../services/ApiServices";
import { clearCookie } from "../../utils/helpers";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Loader from "../Common/Loader";
import eventEmitter from "../../utils/events";
import { ethers } from "ethers";
import {
  contractInstance,
  getPrivateKey,
} from "../../services/Web3authServices";
import BigNumber from "bignumber.js";
import moment from "moment";
import abi from "../../utils/ERC20.abi.json";
import { fetchAuthSession } from "aws-amplify/auth";
import { handleRedeemService } from "../../services/wallet";

const Redemption = (props: any) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>([]);
  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const _validToken = await checkTokenValidity();
      if (!_validToken.status) {
        throw new Error(_validToken.message);
      }
      const _profile = await fetchProfile();
      if (!_profile.status) {
        throw new Error(_profile.message);
      }
      setUser(_profile.data);
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

  const handleRedeemItem = async (
    e: { preventDefault: () => void },
    item: any
  ) => {
    e.preventDefault();
    setLoader(true);
    setMessage("Loading...");

    const _validToken = await checkTokenValidity();
    if (!_validToken.status) {
      setLoader(false);
      throw new Error(_validToken.message);
    }
    try {
      setMessage("Transaction in progress...");
      const { idToken } = (await fetchAuthSession()).tokens ?? {};
      console.log("session", idToken?.payload?.sub);
      let transferAmount: any = ethers.utils.parseUnits(
        item?.point?.toString(),
        18
      );
      const response = await handleRedeemService({
        sub_id: idToken?.payload?.sub as string,
        tokenAddress: process.env.REACT_APP_CONTRACT_ADDRESS as string,
        pointsAmount: transferAmount?.toString(),
      });
      const { status, data, message } = response;
      if (status === 200) {
        setMessage("Please wait...");
        const updt = await redeemItem({
          itemId: item.id,
        });
        if (!updt.status) {
          throw new Error(updt.message);
        }
        const txn = await createTransaction({
          walletAddress: user.walletAddress,
          label: "Redeem Item",
          transactionHash: data.transactionHash,
          tokenValue: Number(item.point),
          chainId: 80002,
          web: 3,
          paymentRef: "Debit",
        });
        if (!txn.status) {
          throw new Error(txn.message);
        }
        toast.success("Item redeemed successfully");
        await fetchUser();
        eventEmitter.emit("transactionReload");
        props.handleDataRefresh();
        props.handleTokeBalanceRefresh();
        setLoader(false);
      } else {
        toast.error(message);
      }
    } catch (error: any) {
      toast.error(error?.message);
      console.log("Error in handle transfer: ", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {loader && <Loader message={message} />}
      <div className="row  justify-content-start">
        {dummyItems.map((item: any, key) => (
          <div className="col-md-3 mb-3" key={key}>
            <div className="box">
              <div className="item-box">
                <div className="top-img-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="45"
                    height="15"
                    viewBox="0 0 45 15"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_4820_67)">
                      <path
                        d="M39.99 4.20996H4.92C2.20276 4.20996 0 6.41272 0 9.12996C0 11.8472 2.20276 14.05 4.92 14.05H39.99C42.7072 14.05 44.91 11.8472 44.91 9.12996C44.91 6.41272 42.7072 4.20996 39.99 4.20996Z"
                        fill="white"
                      />
                      <path
                        d="M22.46 9.42C25.0613 9.42 27.17 7.31126 27.17 4.71C27.17 2.10874 25.0613 0 22.46 0C19.8587 0 17.75 2.10874 17.75 4.71C17.75 7.31126 19.8587 9.42 22.46 9.42Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_4820_67">
                        <rect width="44.91" height="14.04" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="item-img-container">
                  {key % 2 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="89"
                      height="89"
                      viewBox="0 0 89 89"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_4842_232)">
                        <path
                          d="M46.1199 80.1045L42.1092 69.7649L80.8184 71.7519L79.1589 88.31L46.1199 80.1045ZM55.4145 0L1.12964 25.643L9.53013 64.286H20.6057L18.6923 36.645L20.3886 36.1151L27.0486 64.286H38.551L38.1242 30.6178L39.8241 30.088L45.6452 64.286H57.8247L60.6947 23.6156L62.3947 23.0857L65.412 64.286H81.5138L87.1804 7.7308L55.4145 0Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_4842_232">
                          <rect width="88.31" height="88.31" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="89"
                      height="89"
                      viewBox="0 0 89 89"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_4820_64)">
                        <path
                          d="M46.12 88.31H42.12L41.68 88.2302C39.68 87.9802 37.55 87.8501 35.52 87.4501C27.6182 85.9432 20.2976 82.25 14.39 76.7902C8.77724 71.7103 4.5728 65.2656 2.18466 58.082C-0.203478 50.8983 -0.694221 43.2195 0.759976 35.7902C2.1599 28.1366 5.61681 21.0083 10.76 15.1701C17.7261 7.06805 27.4357 1.81984 38.03 0.430106C43.8708 -0.42534 49.8253 -0.0644003 55.52 1.49016C65.4607 4.10607 74.1565 10.1522 80.07 18.56C84.5154 24.694 87.2614 31.8937 88.03 39.4301C88.13 40.3401 88.21 41.2501 88.29 42.1601V46.1601C88.2529 46.3518 88.2262 46.5455 88.2101 46.7402C88.0685 49.6158 87.6226 52.4684 86.88 55.2502C84.1723 65.8682 77.5726 75.0805 68.39 81.06C62.5539 84.9623 55.8461 87.3665 48.86 88.06L46.12 88.31ZM7.59005 40.06L7.96994 40.2402L26.08 47.87C26.192 47.9233 26.3164 47.9449 26.4398 47.9325C26.5632 47.9202 26.6808 47.8746 26.78 47.8002C28.2415 46.8909 29.9287 46.4092 31.65 46.4101C31.7878 46.4168 31.9248 46.3859 32.0464 46.3207C32.1679 46.2556 32.2694 46.1587 32.3401 46.0402C34.7801 42.6102 37.21 39.1902 39.67 35.7802C40.2036 35.2053 40.4907 34.4442 40.4699 33.6601C40.4709 33.4206 40.5012 33.1822 40.56 32.9501C40.9484 30.5282 42.0193 28.267 43.6471 26.4321C45.2749 24.5971 47.3921 23.2644 49.7505 22.59C52.1088 21.9156 54.6107 21.9275 56.9625 22.6244C59.3143 23.3214 61.4187 24.6744 63.0289 26.5248C64.6391 28.3753 65.6882 30.6464 66.0534 33.072C66.4187 35.4975 66.0848 37.9771 65.0909 40.2197C64.097 42.4622 62.4844 44.3748 60.4421 45.7333C58.3998 47.0919 56.0124 47.8401 53.56 47.8901C53.2993 47.893 53.0453 47.973 52.83 48.12C49.48 50.6 46.17 53.1202 42.83 55.5502C42.4642 55.7343 42.1609 56.0223 41.9581 56.3781C41.7553 56.7339 41.6621 57.1417 41.69 57.5502C41.6803 57.6856 41.6568 57.8195 41.62 57.9501C41.2391 60.1918 40.099 62.2343 38.3908 63.735C36.6827 65.2358 34.5104 66.1035 32.2384 66.1926C29.9663 66.2817 27.7328 65.5867 25.9123 64.2243C24.0919 62.8619 22.7952 60.9151 22.24 58.7101C22.2166 58.5527 22.1501 58.405 22.0477 58.2831C21.9453 58.1613 21.8111 58.0703 21.66 58.0202C18.3 56.6202 14.9501 55.2002 11.5901 53.7902L8.38998 52.4501C11.39 66.9401 25.31 80.9901 44.31 80.9201C51.4018 80.8855 58.3324 78.8013 64.2671 74.9186C70.2017 71.036 74.8872 65.5206 77.7594 59.0363C80.6315 52.5521 81.5678 45.3756 80.4554 38.3715C79.343 31.3674 76.2295 24.8343 71.4897 19.559C66.7499 14.2837 60.586 10.4911 53.7404 8.63811C46.8949 6.78516 39.6597 6.95085 32.9061 9.11516C26.1525 11.2795 20.1688 15.3501 15.6754 20.8368C11.182 26.3236 8.37069 32.9925 7.58004 40.0402L7.59005 40.06ZM44.53 34.9802C44.5262 36.7113 45.0348 38.4048 45.9917 39.8473C46.9486 41.2899 48.311 42.4172 49.9073 43.0868C51.5036 43.7565 53.2625 43.9386 54.9622 43.6105C56.662 43.2824 58.2266 42.4586 59.459 41.2429C60.6913 40.0271 61.5363 38.4741 61.8875 36.779C62.2388 35.0839 62.0805 33.3225 61.4326 31.7172C60.7847 30.1119 59.6763 28.7345 58.2469 27.758C56.8175 26.7815 55.131 26.2499 53.4 26.2302C51.065 26.2195 48.8208 27.134 47.1585 28.7739C45.4962 30.4137 44.5511 32.6452 44.53 34.9802ZM29.24 49.1601L29.57 49.32C31.04 49.93 32.5 50.5401 33.96 51.1701C34.6485 51.4407 35.2758 51.8464 35.8053 52.363C36.3347 52.8796 36.7556 53.4968 37.0431 54.1784C37.3305 54.86 37.4789 55.592 37.4793 56.3317C37.4798 57.0715 37.3324 57.8038 37.0457 58.4858C36.7591 59.1677 36.3391 59.7856 35.8103 60.3029C35.2814 60.8202 34.6545 61.2265 33.9664 61.498C33.2783 61.7695 32.5429 61.9008 31.8033 61.884C31.0638 61.8672 30.3351 61.7026 29.66 61.4001L26.26 59.9802C25.83 59.7902 25.39 59.6101 24.91 59.4201C25.5141 60.783 26.5037 61.9394 27.7569 62.7468C29.0101 63.5541 30.4722 63.9771 31.9629 63.9638C33.4536 63.9505 34.9079 63.5012 36.1465 62.6716C37.385 61.8419 38.3538 60.6681 38.9334 59.2946C39.5131 57.9212 39.6782 56.4082 39.4085 54.9421C39.1389 53.4759 38.4462 52.1207 37.4157 51.0434C36.3853 49.9661 35.0622 49.2137 33.6095 48.8791C32.1567 48.5445 30.6378 48.6421 29.24 49.1601Z"
                          fill="white"
                        />
                        <path
                          d="M59.92 34.9701C59.928 36.2835 59.5456 37.5696 58.8215 38.6654C58.0974 39.7612 57.0641 40.6172 55.8528 41.1249C54.6414 41.6325 53.3066 41.7688 52.0176 41.5167C50.7286 41.2646 49.5435 40.6355 48.6127 39.7089C47.6818 38.7823 47.0472 37.6 46.7893 36.3121C46.5313 35.0243 46.6617 33.6889 47.1638 32.4752C47.666 31.2616 48.5173 30.2246 49.6097 29.4955C50.7022 28.7664 51.9866 28.3781 53.3 28.38C55.0498 28.3826 56.7276 29.077 57.9676 30.3114C59.2077 31.5459 59.9095 33.2204 59.92 34.9701Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_4820_64">
                          <rect width="88.28" height="88.31" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  )}
                </div>
              </div>
              <div className="content-box">
                <div className="d-flex justify-content-start align-items-center mb-3">
                  <AiOutlineGlobal /> <div>GLOBAL</div>
                </div>
                <h5>
                  ${item.price} {item.tag}
                </h5>
                <button className="see-more-btn">See more</button>

                <div className="d-flex justify-content-between align-items-end mt-4">
                  <div>
                    GCDT token
                    <div className="d-flex justify-content-start align-items-center gap-1">
                      <div>{item.point}</div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M9.99999 14.1667L11.3 11.3167L14.1667 10.0001L11.3 8.70008L9.99999 5.83341L8.69166 8.70008L5.83333 10.0001L8.69166 11.3167L9.99999 14.1667ZM6.80833 2.30008C7.82089 1.88337 8.90504 1.66824 9.99999 1.66675C11.0917 1.66675 12.175 1.88341 13.1917 2.30008C14.2 2.71675 15.1167 3.33341 15.8917 4.10841C16.6667 4.88341 17.2833 5.80008 17.7 6.80841C18.1167 7.82508 18.3333 8.90841 18.3333 10.0001C18.3333 12.2084 17.4583 14.3334 15.8917 15.8917C15.1187 16.6666 14.2004 17.2811 13.1893 17.7001C12.1783 18.1192 11.0944 18.3344 9.99999 18.3334C8.90504 18.3319 7.82089 18.1168 6.80833 17.7001C5.79812 17.2808 4.88059 16.6663 4.10833 15.8917C3.33349 15.1188 2.71893 14.2005 2.29992 13.1894C1.88092 12.1784 1.66571 11.0945 1.66666 10.0001C1.66666 7.79175 2.54166 5.66675 4.10833 4.10841C4.88333 3.33341 5.79999 2.71675 6.80833 2.30008ZM5.28333 14.7167C6.53333 15.9667 8.23333 16.6667 9.99999 16.6667C11.7667 16.6667 13.4667 15.9667 14.7167 14.7167C15.9667 13.4667 16.6667 11.7667 16.6667 10.0001C16.6667 8.23341 15.9667 6.53341 14.7167 5.28341C13.4649 4.03411 11.7685 3.33276 9.99999 3.33341C8.23333 3.33341 6.53333 4.03341 5.28333 5.28341C4.03402 6.53514 3.33267 8.23158 3.33333 10.0001C3.33333 11.7667 4.03333 13.4667 5.28333 14.7167Z"
                          stroke="#DE3CDE"
                          strokeWidth="0.5"
                        />
                      </svg>
                    </div>
                  </div>
                  <button
                    className="redeem-btn"
                    disabled={user?.items?.includes(item.id)}
                    onClick={(e) => handleRedeemItem(e, item)}
                  >
                    {user?.items?.includes(item.id) ? "Redeemed" : "Redeem"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Redemption;
