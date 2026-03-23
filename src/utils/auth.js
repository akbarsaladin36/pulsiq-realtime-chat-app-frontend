import Cookies from "js-cookie";

const TOKEN_KEY = "token";

export function getToken() {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token, expiresIn = 86400) {
  const expires = new Date(new Date().getTime() + expiresIn * 1000);
  Cookies.set(TOKEN_KEY, token, {
    expires,
    secure: import.meta.env.PROD,
    sameSite: "lax",
  });
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}
