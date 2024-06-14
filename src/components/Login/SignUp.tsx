import React, { useEffect, useState } from "react";
import { fetchAuthSession, signUp } from "aws-amplify/auth";
import "./Login.scss";
import { toast } from "sonner";
import {
  web3authSfa,
  ethereumPrivateKeyProvider,
  verifier,
} from "../../utils/web3auth";
import { clearCookie, setCookie } from "../../utils/helpers";
import { getAccount } from "../../services/Web3authServices";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/ApiServices";
import Loader from "../Common/Loader";
import { FcGoogle } from "react-icons/fc";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { createWallet } from "../../services/wallet";

type SignUpParameters = {
  username: string;
  password: string;
  email: string;
};

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loader, setLoader] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [validPassword, setValidPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);



  const fetchSession = async () => {
    try {
      const { idToken } = (await fetchAuthSession()).tokens ?? {};
      console.log("idTokn: ", idToken);
      if (idToken) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setValidPassword(true);
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  async function handleSignUp(
    e: { preventDefault: () => void },
    { username, password, email }: SignUpParameters
  ) {
    e.preventDefault();
    setLoader(true);
    setMessage("Please wait...");
    if (!username || username?.trim() === "") {
      toast.error("Please enter username");
      setLoader(false);
      return;
    }
    if (!email || email?.trim() === "") {
      toast.error("Please enter email");
      setLoader(false);
      return;
    }
    if (!password) {
      toast.error("Please enter password");
      setLoader(false);
      return;
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    const isValidPassword = passwordRegex.test(password);
    if (!isValidPassword || password?.length < 8) {
      setValidPassword(false);
      setLoader(false);
      return;
    }
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
          // optional
          autoSignIn: true, // or SignInOptions e.g { authFlowType: "USER_SRP_AUTH" }
        },
      });
      console.log("signup data: ", isSignUpComplete, userId, nextStep);
      if (isSignUpComplete) {
        try {
          const { idToken } = (await fetchAuthSession()).tokens ?? {};
          console.log({
            idToken,
            rawIdToken: idToken?.toString(),
          });
          const { data } = await createWallet({
            sub_id: idToken?.payload?.sub as string,
          });
          setCookie("GCName", idToken?.payload["cognito:username"] as string);
          setCookie("GCToken", idToken?.toString() as string);
          setCookie("GCAddress", data?.wallet_address);
          setCookie("GCEmail", idToken?.payload?.email as string);
          await handleLogin({
            email: idToken?.payload?.email as string,
            userId: idToken?.payload?.sub as string,
            walletAddress: data?.wallet_address,
            loginType: "cred",
          });
        } catch (err: any) {
          console.log("err in web3auth connect", err);
          clearCookie();
          localStorage.clear();
          toast.error(err?.message);
          navigate("/");
          setLoader(false);
          setMessage("")
        }
      }
    } catch (error: any) {
      console.log("error signing up:", error);
      if (error?.message?.includes("Email already exists")) {
        toast.error("Email already exists");
      }
      setLoader(false);
    }
  }

  const handleLogin = async (req: {
    email: string;
    userId: string;
    walletAddress: string;
    loginType: string;
  }) => {
    setMessage("Signing up, Please wait...");
    try {
      const res: { status: boolean; message: string } = await loginUser(req);
      if (res?.status) {
        toast.success(res.message);
        navigate("/dashboard");
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      {loader && <Loader message={message} />}
      <div className="login">
        <div className="login-box">
          <div className="img-container">
            <img src="/images/Logo.png" alt="game centric" />
          </div>
          <h4>Sign Up</h4>
          <form onSubmit={(e) => handleSignUp(e, formData)}>
            <div className="form-group my-3">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="username"
                value={formData.username}
                name="username"
                onChange={handleChange}
              />
            </div>
            <div className="form-group my-3">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="example@gmail.com"
                value={formData.email}
                name="email"
                onChange={handleChange}
              />
            </div>
            <div className="form-group my-3 mt-3">
              <label>Create Password</label>
              <div className="password-div">
                <input
                  type={`${!showPassword ? "password" : "text"}`}
                  className="form-control"
                  placeholder="password"
                  value={formData.password}
                  name="password"
                  onChange={handleChange}
                />
                {!showPassword ? (
                  <GoEye onClick={() => setShowPassword(true)} />
                ) : (
                  <GoEyeClosed onClick={() => setShowPassword(false)} />
                )}
              </div>
            </div>
            {!validPassword && (
              <span className="password-validation">
                A password should contain at least 1 uppercase, 1 lowercase, 1
                digit, 1 special character and have a length of at least of 8.
              </span>
            )}
            <button type="submit" className="login-btn">
              Sign Up
            </button>
          </form>
          <div className="divider">
            <div className="line"></div>
            <div className="sign-in-with">Or register with</div>
            <div className="line"></div>
          </div>
          <div className="social-signin">
            <button className="google-btn">
              <FcGoogle />
            </button>
          </div>
          <div className="text-center bottom-text">
            <span>Already have an account?</span>
            <a href="/" className="text-decoration-none text-white">
              Login
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupForm;
