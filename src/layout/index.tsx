import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import { Outlet, useNavigate } from "react-router-dom";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { clearCookie } from "../utils/helpers";
import { useEffect } from "react";
import { Hub } from "aws-amplify/utils";

const DashboardLayout = () => {
  const navigate = useNavigate();
  async function currentSession() {
    try {
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      console.log({ accessToken, idToken, rawIdToken: idToken?.toString() });
      if (!idToken) {
        localStorage.clear();
        clearCookie();
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  }
  const getUserToken = async () => {
    try {
      const user = await getCurrentUser();
      console.log("user: ", user);
    } catch (error) {
      console.error("Error fetching ID token:", error);
    }
  };
  useEffect(() => {
    // Subscribe to Hub events for authentication state changes
    const hubCallback = (data: any) => {
      const { payload } = data;
      console.log("payload: ", payload);
      if (payload.event === "signedIn") {
        getUserToken(); 
        currentSession();
      }
    };

    // Register the Hub callback
    Hub.listen("auth", hubCallback);

    // Cleanup the subscription when the component unmounts
    // return () => Hub.removeHubListener(hubCallback);
  }, []);
  return (
    <>
      <Sidebar />
      <Header>
        <Outlet />
      </Header>
    </>
  );
};

export default DashboardLayout;
