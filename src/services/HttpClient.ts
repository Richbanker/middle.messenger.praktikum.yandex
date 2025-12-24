export interface HttpRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  credentials?: "include" | "same-origin" | "omit";
  mode?: "cors" | "no-cors" | "same-origin";
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpError {
  message: string;
  status?: number;
  statusText?: string;
}

export class HttpClient {
  private defaultTimeout = 10000;

  public async get<T = unknown>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("GET", url, undefined, config);
  }

  public async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("POST", url, data, config);
  }

  public async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", url, data, config);
  }

  public async delete<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", url, data, config);
  }

  private request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const timeout = config?.timeout || this.defaultTimeout;

      xhr.timeout = timeout;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            let responseData: T;
            try {
              responseData = xhr.responseText
                ? JSON.parse(xhr.responseText)
                : null;
            } catch {
              responseData = xhr.responseText as T;
            }

            const response: HttpResponse<T> = {
              data: responseData,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: this.parseHeaders(xhr.getAllResponseHeaders()),
            };


            resolve(response);
          } else if (xhr.status === 400) {
            let responseData: T;
            try {
              responseData = xhr.responseText
                ? JSON.parse(xhr.responseText)
                : null;
            } catch {
              responseData = xhr.responseText as T;
            }

            const response: HttpResponse<T> = {
              data: responseData,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: this.parseHeaders(xhr.getAllResponseHeaders()),
            };

            resolve(response);
          } else {
            let errorMessage = `HTTP Error ${xhr.status}: ${xhr.statusText}`;
            let errorData: unknown = null;

            try {
              errorData = xhr.responseText ? JSON.parse(xhr.responseText) : null;
              if (errorData && (errorData as any).reason) {
                errorMessage = (errorData as any).reason;
              } else if (xhr.responseText && xhr.responseText.length < 200) {
                const text = xhr.responseText.trim();
                if (text && !text.startsWith('<')) {
                  errorMessage = text;
                }
              }
            } catch {
              if (xhr.responseText && xhr.responseText.length < 200) {
                const text = xhr.responseText.trim();
                if (text && !text.startsWith('<')) {
                  errorMessage = text;
                }
              }
            }

            const isExpectedError = 
              (xhr.status === 404 && (
                url.includes('/chats/') && url.includes('/messages') ||
                url.includes('/chats/') && url.includes('/users')
              )) ||
              (xhr.status === 400 && url.includes('/chats/users')) ||
              (xhr.status === 401 && url.includes('/auth/user') && method === 'GET');
            
            if (!isExpectedError) {
              void 0;
            }

            const error: HttpError = {
              message: errorMessage,
              status: xhr.status,
              statusText: xhr.statusText,
            };
            reject(error);
          }
        }
      };

      xhr.onerror = () => {
        const error: HttpError = {
          message: "Network Error: Failed to fetch",
        };
        reject(error);
      };

      xhr.ontimeout = () => {
        const error: HttpError = {
          message: `Request timeout after ${timeout}ms`,
        };
        reject(error);
      };

      xhr.open(method, url, true);

      xhr.withCredentials = config?.credentials === "include";

      if (config?.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      if (data && ["POST", "PUT", "DELETE"].includes(method)) {
        const hasContentType =
          config?.headers &&
          Object.keys(config.headers).some(
            (key) => key.toLowerCase() === "content-type"
          );

        if (!hasContentType) {
          if (data instanceof FormData) {
            void 0;
          } else if (typeof data === "object") {
            xhr.setRequestHeader("Content-Type", "application/json");
          } else {
            xhr.setRequestHeader("Content-Type", "text/plain");
          }
        }
      }

      if (data) {
        if (data instanceof FormData) {
          xhr.send(data);
        } else {
          const requestData =
            typeof data === "object" ? JSON.stringify(data) : String(data);
          xhr.send(requestData);
        }
      } else {
        xhr.send();
      }
    });
  }

  private parseHeaders(headersString: string): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!headersString) return headers;

    const headerPairs = headersString.split("\u000d\u000a");

    for (const pair of headerPairs) {
      const index = pair.indexOf("\u003a\u0020");
      if (index > 0) {
        const key = pair.substring(0, index);
        const value = pair.substring(index + 2);
        headers[key.toLowerCase()] = value;
      }
    }

    return headers;
  }

  public buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl;
    }

    const url = new URL(baseUrl, window.location.origin);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, String(item)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });

    return url.toString();
  }

  public setBaseUrl(_baseUrl: string): void {}

  public setAuthToken(_token: string): void {}
}

export const httpClient = new HttpClient();
