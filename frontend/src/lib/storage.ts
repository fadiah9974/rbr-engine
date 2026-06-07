export function getStorageItem(key: string) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function setStorageItem(key: string, value: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
}

export function removeStorageItem(key: string) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const item = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  return item ? decodeURIComponent(item.split("=").slice(1).join("=")) : null;
}

export function setCookie(name: string, value: string, maxAge = 60 * 60 * 24) {
  if (typeof document !== "undefined") {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  }
}

export function removeCookie(name: string) {
  if (typeof document !== "undefined") {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
  }
}
