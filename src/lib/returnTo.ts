/**
 * Small utilities to preserve and restore "returnTo" locations for login/logout.
 * We use sessionStorage so tab-scoped and ephemeral.
 */
export const RT_LOGIN_KEY = "rt_login";
export const RT_LOGOUT_KEY = "rt_logout";

export function captureLoginStart() {
  const url = window.location.pathname + window.location.search + window.location.hash;
  sessionStorage.setItem(RT_LOGIN_KEY, url);
  return url;
}

export function consumeLoginReturnTo(): string | null {
  const v = sessionStorage.getItem(RT_LOGIN_KEY);
  if (v) sessionStorage.removeItem(RT_LOGIN_KEY);
  return v;
}

export function captureLogoutStart() {
  const url = window.location.pathname + window.location.search + window.location.hash;
  sessionStorage.setItem(RT_LOGOUT_KEY, url);
  return url;
}

export function consumeLogoutReturnTo(): string | null {
  const v = sessionStorage.getItem(RT_LOGOUT_KEY);
  if (v) sessionStorage.removeItem(RT_LOGOUT_KEY);
  return v;
}

