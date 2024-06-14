import CryptoJS from "crypto-js";

const encryptData = (data: any) => {
  const encryptedData = CryptoJS.AES.encrypt(
    data,
    process.env.REACT_APP_ENCRYPTION_KEY!
  ).toString();
  return encryptedData;
};

const decryptData = (encryptedData: any) => {
  const decryptedData = CryptoJS.AES.decrypt(
    encryptedData,
    process.env.REACT_APP_ENCRYPTION_KEY!
  ).toString(CryptoJS.enc.Utf8);
  return decryptedData;
};

// Set a cookie
export const setCookie = (name: string, value: string) => {
  const currentDate = new Date();
  // Calculate the expiration date by adding 3600 seconds (1 hour) to the current date
  const expirationDate = new Date(currentDate.getTime() + 3600 * 1000);
  const encryptedValue = encryptData(value);
  const cookieValue =
    encodeURIComponent(name) +
    "=" +
    encodeURIComponent(encryptedValue) +
    "; expires=" +
    expirationDate +
    "; path=/";
  document.cookie = cookieValue;
};

// Get a cookie
export const getCookie = (name: string): string | null => {
  const cookieName = encodeURIComponent(name) + "=";
  const cookieList = document.cookie.split(";");

  for (let i = 0; i < cookieList?.length; i++) {
    let cookie = cookieList[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      const encryptedValue = decodeURIComponent(
        cookie.substring(cookieName?.length)
      );
      return decryptData(encryptedValue);
    }
  }

  return null;
};

// Clear all cookies
export const clearCookie = () => {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies?.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};
