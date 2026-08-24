const ACCESS_TOKEN_KEY = "esu_access_token";
const REFRESH_TOKEN_KEY = "esu_refresh_token";
const REMEMBER_KEY = "esu_remember";

function clearLegacyTokens(storage: Storage) {
  storage.removeItem("esu_token");
  storage.removeItem("esu_user");
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getRememberMode() {
  return localStorage.getItem(REMEMBER_KEY) === "true";
}

export function setTokens(tokens: { access: string; refresh: string }, remember: boolean) {
  clearTokens();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  localStorage.setItem(REMEMBER_KEY, String(remember));
}

export function updateTokens(tokens: { access: string; refresh: string }) {
  setTokens(tokens, getRememberMode());
}

export function clearTokens() {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    clearLegacyTokens(storage);
  });
  localStorage.removeItem(REMEMBER_KEY);
}
