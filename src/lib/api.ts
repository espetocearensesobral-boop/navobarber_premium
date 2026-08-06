export const authFetch = async (url: string, options: any = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  return fetch(url, { 
    ...options, 
    headers,
    credentials: 'include'
  });
};
