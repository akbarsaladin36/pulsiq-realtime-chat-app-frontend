import Cookies from "js-cookie";

export const cookieStorage = {
  getItem: (name) => {
    const value = Cookies.get(name);
    if (!value) {
      return null;
    } else {
      return JSON.parse(value);
    }
  },
  setItem: (name, value) => {
    Cookies.set(name, JSON.stringify(value), {
      expires: 86400,
      secure: import.meta.env.PROD,
      sameSite: "lax",
    });
  },
  removeItem: (name) => {
    Cookies.remove(name);
  },
};
