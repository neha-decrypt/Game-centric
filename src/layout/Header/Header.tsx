import React, { useEffect, useRef, useState } from "react";
import { RiMessage2Fill } from "react-icons/ri";
import { Link } from "react-router-dom";
import {
  MdGeneratingTokens,
  MdOutlineGames,
  MdOutlineLogout,
  MdToken,
} from "react-icons/md";
import { LuWallet } from "react-icons/lu";
import "./Header.scss";
import { IoSearchOutline } from "react-icons/io5";
import { GiCrossedSwords, GiHamburgerMenu } from "react-icons/gi";
import { BiSupport } from "react-icons/bi";
import { TiMediaPlay } from "react-icons/ti";
import { FaStar } from "react-icons/fa6";
import { GoHomeFill } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";
import eventEmitter from "../../utils/events";
import backgroundImage from "./BG.png";

const Header = ({ children }: any, props: any) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const hamburgerRef = useRef(null);

  const handleLogout = () => {
    eventEmitter.emit("logout");
  };


  useEffect(() => {
    const image = new Image();
    image.src = backgroundImage;

    image.onload = () => {
      setIsImageLoaded(true);
    };
  }, []);



   
  const checkVisibility = () => {
    const myElement = hamburgerRef.current;

    if (myElement) {
      const computedStyle = window.getComputedStyle(myElement);
      const displayProperty = computedStyle.getPropertyValue('display');
      if(displayProperty === 'none'){
        setShowSidebar(false)
      }
    }
  };

  useEffect(() => {
    checkVisibility();
    window.addEventListener('resize', checkVisibility);
    return () => {
      window.removeEventListener('resize', checkVisibility);
    };
  }, []);

  const headerStyle = {
    minHeight: "100vh",
    backgroundImage: isImageLoaded ? `url('${backgroundImage}')` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    opacity: isImageLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  return (
    <>
      <div className="d-flex flex-column header">
        <div className="sidebar-header px-5 flex-wrap">
          <div className="d-flex justify-content-center align-items-center">
           
              <div className="hamburger-icon" ref={hamburgerRef}>
               {!showSidebar ?  <GiHamburgerMenu onClick={() => setShowSidebar(true)} /> : <RxCross2 onClick={() => setShowSidebar(false)} />}
              </div>
            {showSidebar && (
              <div className="sidebar">
                {" "}
                <div className="user-info">
                  <div className="user-img">
                    <img src="/images/1.png" alt="logo" />
                  </div>
                  <div className="d-flex justify-content-start align-items-start flex-column mx-2">
                    <div className="username">TickleJab19</div>
                    <div className="name">Jake Agustin</div>
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
                    <li className="item">
                      <Link to="/">
                        <div className="icon-div">
                          <BiSupport />
                        </div>
                        <div className="nav-heading">Support</div>
                      </Link>
                    </li>
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
            )}
            <div className="user-img ">
              <img src="/images/Logo.png" alt="logo" />
            </div>
            {/* <div className="search">
              <input type="text" />
              <div className="search-icon">
                <IoSearchOutline />
              </div>
            </div> */}
          </div>
          {/* <div className="header-icons">
            <div className="balance-box">
              <div className="points d-flex justify-content-center align-items-center">
                <div>
                  <LuWallet />
                </div>
                <span>AED 100</span>
              </div>
              <div className="token">
                <MdGeneratingTokens /> <span>1.00</span>
              </div>
            </div>
            <ul>
              <li className="item">
                <Link to="/">
                  <div className="icon-div">
                    <RiMessage2Fill />
                  </div>
                </Link>
              </li>
            </ul>
          </div> */}
        </div>
        <main  style={headerStyle}>{children}</main>
      </div>
    </>
  );
};

export default Header;
