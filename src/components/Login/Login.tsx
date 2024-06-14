import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  loginUser,
} from "../../services/ApiServices";
import {
  ethereumPrivateKeyProvider,
  web3authSfa,
  verifier,
} from "../../utils/web3auth";
import { getAccount } from "../../services/Web3authServices";
import Loader from "../Common/Loader";
import { clearCookie, getCookie, setCookie } from "../../utils/helpers";
import "./Login.scss";
import {
  decodeJWT,
  signIn,
  signInWithRedirect,
  signUp,
} from "aws-amplify/auth";
import { fetchAuthSession } from "aws-amplify/auth";
import { GoEye, GoEyeClosed } from "react-icons/go";
import backgroundImage from "./login.png";
import { jwtDecode } from "jwt-decode";
import { createWallet } from "../../utils/suiFunctions";

const Login = () => {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  const codeRef = useRef(false);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const ssoRef = useRef(false);

 

  useEffect(() => {
    const cookieToken = getCookie("GCToken");
    if (cookieToken && token && !ssoRef.current) {
      ssoRef.current = true;
      alert("You are already logged in another tab");
      window.close();
      return;
    } else if (cookieToken && !token && !ssoRef.current) {
      ssoRef.current = true;
      const { exp } = jwtDecode(cookieToken);
      const currentTime = Math.floor(Date.now() / 1000);
      if (exp && exp < currentTime) {
        clearCookie();
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    } else if (token && !ssoRef.current && !cookieToken) {
      ssoRef.current = true;
    }
  }, []);

  useEffect(() => {
    const checkandLoad = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get("code");
      if (code && !codeRef.current) {
        codeRef.current = true;
        await handleCode(code);
      }
    };
    checkandLoad();
  }, []);


  const handleLogin = async (req: {
    email: string;
    userId: string;
    loginType: string;
    walletAddress?:string
  }) => {
    setMessage("Logging in. Please wait...");
    try {
      const res: { status: boolean; message: string, data:any } = await loginUser(req);
      console.log("data after loginUser called", res.data)
      if (res?.status) {
        setCookie("GCAddress",  res.data?.wallet_address);
        toast.success(res.message);
        navigate("/dashboard");
      } else {
        localStorage.clear();
        clearCookie();
        toast.error(res.message);
      }
    } catch (error: any) {
      localStorage.clear();
      clearCookie();
      toast.error(error.message);
    }
  };

  const handleCode = async (_code: string) => {
    setLoader(true);
    setMessage("handling login...");
    try {
      const { idToken } = (await fetchAuthSession()).tokens ?? {};
      console.log({
        idToken,
        rawIdToken: idToken?.toString(),
      });
      setCookie("GCName", idToken?.payload["cognito:username"] as string);
      setCookie("GCToken", idToken?.toString() as string);
      setCookie("GCEmail", idToken?.payload?.email as string);
      setCookie("SubId", idToken?.payload?.sub as string)
      await handleLogin({
        email: idToken?.payload?.email as string,
        userId: idToken?.payload?.sub as string,
        loginType: "google",
      });
    } catch (err: any) {
      console.log("err in web3auth connect", err);
      localStorage.clear();
      clearCookie();
      toast.error(err?.message);
      navigate("/");
      setLoader(false);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoader(true);
    setMessage("Please wait...");
    if (!username || username?.trim() === "") {
      toast.error("Please enter username");
      setLoader(false);
      return;
    }
    if (!password) {
      toast.error("Please enter password");
      setLoader(false);
      return;
    }
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      console.log("signedIn data: ", isSignedIn, nextStep);
      if (isSignedIn) {
        try {
          const { idToken } = (await fetchAuthSession()).tokens ?? {};
          console.log({
            idToken,
            rawIdToken: idToken?.toString(),
          });
          setCookie("GCName", idToken?.payload["cognito:username"] as string);
          setCookie("GCToken", idToken?.toString() as string);
          setCookie("GCEmail", idToken?.payload?.email as string);
          setCookie("SubId", idToken?.payload?.sub as string)
          const { error , walletAddress } = createWallet(idToken?.payload?.sub)
          if(error){
            throw new Error("Error signing in...")
          }
          await handleLogin({
            email: idToken?.payload?.email as string,
            userId: idToken?.payload?.sub as string,
            loginType: "cred",
            walletAddress
          });
        } catch (err: any) {
          localStorage.clear();
          clearCookie();
          toast.error(err?.message);
          navigate("/");
          setLoader(false);
        }
      }
    } catch (error: any) {
      if (error?.message.includes("There is already a signed in user.")) {
        localStorage.clear();
        clearCookie();
        setLoader(true);
        setMessage("Please wait...");
        handleSubmit(e);
        return;
      }
      console.log("error in login: ", error);
      localStorage.clear();
      clearCookie();
      toast.error(error.message);
      navigate("/");
    } finally {
      setLoader(false);
    }
  };

  const handleGoogleRedirect = async () => {
    try {
      setLoader(true);
      setMessage("Please wait...");
      const res = await signInWithRedirect({ provider: "Google" });
      console.log("res: ", res);
    } catch (error: any) {
      console.log("error", error?.message);
      if (error?.message.includes("There is already a signed in user.")) {
        localStorage.clear();
        clearCookie();
        setLoader(true);
        setMessage("Please wait...");
        handleGoogleRedirect();
        return;
      }
      console.log("error in login: ", error);
      localStorage.clear();
      clearCookie();
      toast.error(error.message);
      navigate("/");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    const image = new Image();
    image.src = backgroundImage;

    image.onload = () => {
      setIsImageLoaded(true);
    };
  }, []);

  const headerStyle = {
    minHeight: "100vh",
    backgroundImage: isImageLoaded ? `url('${backgroundImage}')` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    opacity: isImageLoaded ? 1 : 0,
    transition: "opacity 0.3s ease-in-out",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };



  return (
    <>
      {loader && <Loader message={message} />}
      <div className="login" style={headerStyle}>
        <div className="login-box">
          <div className="img-container">
            <img src="/images/Logo.png" alt="game centric" />
          </div>
          <h4>Sign In</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group my-3">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="username"
                value={username}
                name="username"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div className="form-group my-3 mt-3">
              <label>Password</label>
              <div className="password-div">
                <input
                  type={`${!showPassword ? "password" : "text"}`}
                  className="form-control"
                  placeholder="password"
                  value={password}
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                {!showPassword ? (
                  <GoEye onClick={() => setShowPassword(true)} />
                ) : (
                  <GoEyeClosed onClick={() => setShowPassword(false)} />
                )}
              </div>
            </div>
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>
          <div className="divider">
            <div className="line"></div>
            <div className="sign-in-with">Or login with</div>
            <div className="line"></div>
          </div>
          <div className="social-signin">
            <button className="google-btn" onClick={handleGoogleRedirect}>
              <FcGoogle />
            </button>
          </div>
          {/* <div className="text-center bottom-text">
            <span>create an account? </span>
            <a href="/signup" className="text-decoration-none text-white">
              Sign Up
            </a>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Login;
