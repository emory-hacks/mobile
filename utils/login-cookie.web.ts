import {
  TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_VALUE,
} from "./login-cookie.constants";

export const addCookie = async () => {
  document.cookie = `${TOKEN_COOKIE_NAME}=${TOKEN_COOKIE_VALUE}; path=/`;
};

export const hasValidToken = async (): Promise<boolean> => {
  // For now, this async code just checks if token is placeholder jwt value
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie.split(";").some((part) => {
    const [name, ...rest] = part.trim().split("=");
    return name === TOKEN_COOKIE_NAME && rest.join("=") === TOKEN_COOKIE_VALUE;
  });
};
