export const authFetch = async (url: string, options: any = {}) => {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json'
  };

  return fetch(url, { 
    ...options, 
    headers,
    credentials: 'include' // allow cookies to be sent
  });
};
