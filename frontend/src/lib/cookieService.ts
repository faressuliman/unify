type CookieOptions = {
  days?: number;
  path?: string;
};

const buildCookieOptions = (options: CookieOptions = {}) => {
  const parts: string[] = [];
  const path = options.path ?? '/';
  parts.push(`Path=${path}`);
  parts.push('SameSite=Lax');
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    parts.push('Secure');
  }
  if (typeof options.days === 'number') {
    const maxAge = Math.floor(options.days * 24 * 60 * 60);
    parts.push(`Max-Age=${maxAge}`);
  }
  return parts.join('; ');
};

export const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);
  const opts = buildCookieOptions(options);
  document.cookie = `${encodedName}=${encodedValue}; ${opts}`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const encodedName = encodeURIComponent(name);
  const match = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${encodedName}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(encodedName.length + 1));
};

export const deleteCookie = (name: string, path = '/') => {
  const encodedName = encodeURIComponent(name);
  document.cookie = `${encodedName}=; Max-Age=0; Path=${path}; SameSite=Lax`;
};
