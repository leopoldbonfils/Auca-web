const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Returns the stored access token from localStorage
function getToken() {
  return localStorage.getItem('accessToken');
}

// Core fetch wrapper — adds Authorization header when a token exists
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    ...options.headers,
  };

  // Only add Content-Type: application/json when NOT sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach the JWT if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Automatically parse JSON response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Log full details to console to help debug backend errors
    console.error(
      `[API ERROR] ${options.method || 'GET'} ${BASE_URL}${endpoint}`,
      '\nStatus:', response.status,
      '\nResponse:', data
    );

    // Show the most specific message available
    const detail =
      data?.message ||
      data?.error   ||
      data?.details ||
      (typeof data === 'string' ? data : null) ||
      `Request failed with status ${response.status}`;

    throw new Error(detail);
  }

  return data;
}

//  Convenience methods 

export const api = {
  get: (endpoint) =>
    apiFetch(endpoint, { method: 'GET' }),

  post: (endpoint, body) =>
    apiFetch(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: (endpoint, body) =>
    apiFetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (endpoint, body) =>
    apiFetch(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export default api;