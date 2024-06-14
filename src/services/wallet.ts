const baseUrl = "https://digiffer-wallet.blockchainaustralia.link";

export const createWallet = async (req: { sub_id: string }) => {
  try {
    let data = await fetch(`${baseUrl}/api/wallet/createwallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.REACT_APP_WALLET_API_KEY as string,
      },
      body: JSON.stringify(req),
    });
    data = await data.json();
    return data;
  } catch (error: any) {
    console.log("error", error);
    return error.message;
  }
};

export const handleTransfer = async (req: {
  sub_id: string;
  tokenAddress: string;
  toAddress: string;
  tokenAmount: string;
}) => {
  try {
    let data = await fetch(`${baseUrl}/api/wallet/transfertoken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.REACT_APP_WALLET_API_KEY as string,
      },
      body: JSON.stringify(req),
    });
    data = await data.json();
    return data;
  } catch (error: any) {
    console.log("error", error);
    return error.message;
  }
};


export const handlePointsToTokenService = async (req: {
  sub_id: string;
  tokenAddress: string;
  pointsAmount: string;
}) => {
  try {
    let data = await fetch(`${baseUrl}/api/wallet/pointstotoken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.REACT_APP_WALLET_API_KEY as string,
      },
      body: JSON.stringify(req),
    });
    data = await data.json();
    return data;
  } catch (error: any) {
    console.log("error", error);
    return error.message;
  }
};

export const handleTokensToPointService = async (req: {
  sub_id: string;
  tokenAddress: string;
  toAddress: string;
  tokenAmount: string;
}) => {
  try {
    let data = await fetch(`${baseUrl}/api/wallet/tokentopoints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.REACT_APP_WALLET_API_KEY as string,
      },
      body: JSON.stringify(req),
    });
    data = await data.json();
    return data;
  } catch (error: any) {
    console.log("error", error);
    return error.message;
  }
};

export const handleRedeemService = async (req: {
  sub_id: string;
  tokenAddress: string;
  pointsAmount: string;
}) => {
  try {
    let data = await fetch(`${baseUrl}/api/wallet/pointstotoken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.REACT_APP_WALLET_API_KEY as string,
      },
      body: JSON.stringify(req),
    });
    data = await data.json();
    return data;
  } catch (error: any) {
    console.log("error", error);
    return error.message;
  }
};