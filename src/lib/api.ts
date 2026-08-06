const API_BASE = '';

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) return sessionToken;
  return null;
};

export const saveToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  sessionStorage.setItem('token', token);
};

export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
    (headers as any)['X-Auth-Token'] = token;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
  
  return response;
};
