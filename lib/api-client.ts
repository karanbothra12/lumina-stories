type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

class ApiClient {
  private async request<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, next, cache } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      next,
      cache,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    // Client-side requests should include credentials to send cookies
    if (typeof window !== 'undefined') {
       config.credentials = 'include';
    }

    try {
      const res = await fetch(url, config);

      if (!res.ok) {
        // Handle HTTP errors
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }

      // Handle empty responses
      if (res.status === 204) {
        return {} as T;
      }

      return res.json();
    } catch (error: any) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  get<T>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  post<T>(url: string, body: any, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  put<T>(url: string, body: any, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  delete<T>(url: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();

