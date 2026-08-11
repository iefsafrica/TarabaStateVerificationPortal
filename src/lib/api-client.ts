type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestOptions {
  method?: ApiMethod;
  body?: any;
  headers?: Record<string, string>;
}

/**
 * A fetch wrapper that dynamically routes to either the Next.js API or PHP API
 * based on the NEXT_PUBLIC_API_TYPE environment variable.
 */
export async function apiClient(endpoint: string, options: ApiRequestOptions = {}) {
  const apiType = process.env.NEXT_PUBLIC_API_TYPE || 'nextjs';
  
  // Clean endpoint format: ensure it starts with / but remove it if we need to build full URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  let url = '';
  
  if (apiType === 'php') {
    const phpApiBase = process.env.NEXT_PUBLIC_PHP_API_URL || 'https://your-namecheap-domain.com/php-api';
    // PHP endpoints typically have a .php extension in this setup
    // You can modify this depending on if Namecheap uses URL rewriting
    const phpEndpoint = cleanEndpoint.endsWith('.php') ? cleanEndpoint : `${cleanEndpoint}.php`;
    url = `${phpApiBase}/${phpEndpoint}`;
  } else {
    // Next.js standard API routes
    url = `/api/${cleanEndpoint}`;
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}
