import { clearCookie, getCookie } from "../utils/helpers";

export const getCongitoData = async (req: {
  email: string;
  password: string;
}) => {
  try {
    let data = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/auth/get-idtoken`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      }
    );
    data = await data.json();
    return data;
  } catch (error: any) {
    console.log("error", error);
    return error.message;
  }
};

export const getGoogleIdToken = async (req: { code: string }) => {
  try {
    let data = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/auth/token-conversion`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      }
    );
    data = await data.json();
    return data;
  } catch (error: any) {
    console.log("error", error);
    return error.message;
  }
};

export const loginUser = async (req: {
  loginType: string;
  email: string;
  userId: string;
}) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const createSession = async (req: { amount: number; email: string }) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/stripe/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
        body: JSON.stringify(req),
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const getSessionStatus = async (sessionId: string) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/stripe/session-status?session_id=${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const updateSessionStatus = async (sessionId: string) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/stripe/update-status?session_id=${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const createTransaction = async (req: any) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/transaction/add-transaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
        body: JSON.stringify(req),
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const getTransactions = async (page: Number, pageSize: number) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/transaction/fetch-transactions?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const updatePoint = async (req: any) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/auth/update-points`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
        body: JSON.stringify(req),
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const addPoint = async (req: any) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/auth/add-points`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
        body: JSON.stringify(req),
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const fetchProfile = async () => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/auth/get-user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const checkTokenValidity = async () => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/auth/check-token`,
      {
        method: "GET",
        headers: {
          Authorization: getCookie("GCToken") as string,
        },
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const redeemItem = async (req: { itemId: string }) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/auth/redeem-item`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
        body: JSON.stringify(req),
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};

export const getUserTotalPoints = async (signal:any) => {
  try {
    let data: any = await fetch(
      `${process.env.REACT_APP_API_BASEURL}/auth/user-total-points`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("GCToken") as string,
        },
        signal
      }
    );
    data = await data.json();
    let fd: any = { message: data.message };
    if (data.statusCode === 200) {
      fd = {
        ...fd,
        status: true,
        data: data.data,
      };
    } else {
      fd = { ...fd, status: false };
    }
    return fd;
  } catch (error: any) {
    console.log("error", error);
    return { status: false, message: error.message };
  }
};
