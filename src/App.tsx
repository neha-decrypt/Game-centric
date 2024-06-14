import "./App.scss";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login/Login";
import { Toaster } from "sonner";
import { Suspense, lazy, useEffect } from "react";
import Loader from "./components/Common/Loader";
import SignupForm from "./components/Login/SignUp";
import { Amplify } from "aws-amplify";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { clearCookie } from "./utils/helpers";


const Dashboard = lazy(() => import("./components/Dashboard"));
const DashboardLayout = lazy(() => import("./layout"));

Amplify.configure({
  Auth: {
    Cognito: {
      //  Amazon Cognito User Pool ID
      userPoolId: process.env.REACT_APP_POOL_ID!,
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId: process.env.REACT_APP_POOL_CLIENT_ID!,
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      // identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',
      // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
      // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
      signUpVerificationMethod: "code", // 'code' | 'link'
      loginWith: {
        // OPTIONAL - Hosted UI configuration
        oauth: {
          domain: process.env.REACT_APP_POOL_DOMAIN!,
          scopes: [
            "email",
            "profile",
            "openid",
            "aws.cognito.signin.user.admin",
          ],
          redirectSignIn: [process.env.REACT_APP_REDIRECT_URL!],
          redirectSignOut: ["http://localhost:3000/"],
          responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
        },
      },
    },
  },
});





function App() {
 
  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<Loader message="Please wait..." />}>
          <Routes>
            <Route path="/dashboard" Component={DashboardLayout}>
              <Route index Component={Dashboard} />
            </Route>
            <Route path="/" Component={Login} />
            <Route path="/:token" Component={Login} />
            <Route path="/signup" Component={SignupForm} />
            <Route path="*" Component={Login} />
          </Routes>
          <Toaster position="top-center" richColors />
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
