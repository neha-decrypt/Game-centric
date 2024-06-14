import { Link, useNavigate } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { MdOutlineGames } from "react-icons/md";
import { GiCrossedSwords } from "react-icons/gi";
import { FaStar } from "react-icons/fa6";
import { TiMediaPlay } from "react-icons/ti";
import { MdToken } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import { MdOutlineLogout } from "react-icons/md";
import "./Sidebar.scss";
import { clearCookie, getCookie } from "../../utils/helpers";
import { web3authSfa } from "../../utils/web3auth";
import { toast } from "sonner";
import Loader from "../../components/Common/Loader";
import { useState } from "react";
import { signOut } from "aws-amplify/auth";
import eventEmitter from "../../utils/events";

const Sidebar = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false);

  const handleLogout = async () => {
    setLoader(true);
    setMessage("Logging out. Please wait...");
    clearCookie();
    localStorage.clear();
    if (!web3authSfa) return;
    try {
      await web3authSfa?.logout();
    } catch (error) {
      clearCookie();
      localStorage.clear();
    }
    setTimeout(() => {
      toast.success("You have logged out successfully");
      navigate("/");
    }, 3000);
  };

  eventEmitter.removeAllListeners("logout");
  eventEmitter.on("logout", handleLogout);

  return (
    <>
      {loader && <Loader message={message} />}
      <div className="Sidebar-box pt-3">
        <div className="user-info">
          <div className="user-img">
            <img src="/images/1.png" alt="logo" />
          </div>
          <div className="d-flex justify-content-start align-items-start flex-column mx-2">
            {/* <div className="username">{getCookie("GCName")}</div> */}
            <div className="name">Authenticated User</div>
          </div>
        </div>
        <div className="nav-items">
          <ul>
            <li className="item">
              <Link to="#">
                <div className="icon-div">
                  <GoHomeFill />
                </div>
                <div className="nav-heading">Home</div>
              </Link>
            </li>
            <li className="item">
              <Link to="#">
                <div className="icon-div">
                  <MdOutlineGames />
                </div>
                <div className="nav-heading">Games</div>
              </Link>
            </li>
            <li className="item">
              <Link to="#">
                <div className="icon-div">
                  <GiCrossedSwords />
                </div>
                <div className="nav-heading">Arenas</div>
              </Link>
            </li>
            <li className="item">
              <Link to="#">
                <div className="icon-div">
                  <FaStar />
                </div>
                <div className="nav-heading">Loyalty</div>
              </Link>
            </li>
            <li className="item">
              <Link to="#">
                <div className="icon-div">
                  <TiMediaPlay />
                </div>
                <div className="nav-heading">Media</div>
              </Link>
            </li>
            <li className="item">
              <Link to="/dashboard">
                <div className="icon-div">
                  <MdToken />
                </div>
                <div className="nav-heading">Token Hub</div>
              </Link>
            </li>
          </ul>
        </div>
        <div className="banner">
          <img src="/images/BG 2.png" alt="logo" />
        </div>
        <div className="sidebar-footer">
          <ul>
            {/* <li className="item">
              <Link to="/">
                <div className="icon-div">
                  <BiSupport />
                </div>
                <div className="nav-heading">Support</div>
              </Link>
            </li> */}
            <li className="item">
              <button onClick={handleLogout}>
                <div className="icon-div">
                  <MdOutlineLogout />
                </div>
                <div className="nav-heading">Logout Account</div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
