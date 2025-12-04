// Next.js API client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_AUTH_PASSWORD;

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const apiClient = async (endpoint: string, options: ApiOptions = {}) => {
  const { requiresAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    ...fetchOptions.headers,
  };

  // Add authentication header if required
  if (requiresAuth) {
    if (!AUTH_PASSWORD) {
      throw new Error('Authentication password not configured');
    }
    headers['Authorization'] = `Bearer ${AUTH_PASSWORD}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};

export const apiClientFormData = async (endpoint: string, formData: FormData) => {
  if (!AUTH_PASSWORD) {
    throw new Error('Authentication password not configured');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_PASSWORD}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
};
