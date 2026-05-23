import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * ApiClient — typed wrapper around Playwright's APIRequestContext.
 *
 * Centralises all HTTP concerns: base URL, auth headers, response parsing,
 * and error propagation. Step definitions call these semantic methods
 * instead of raw `apiContext.get(...)` calls.
 *
 * AAA note: ApiClient methods belong to the *Act* layer in API step definitions.
 */
export class ApiClient {
  private readonly ctx: APIRequestContext;

  constructor(ctx: APIRequestContext) {
    this.ctx = ctx;
  }

  // ─── Generic helpers ──────────────────────────────────────────────────────

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const res = await this.ctx.get(path, { params });
    return this.parseResponse<T>(res);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.ctx.post(path, { data: body });
    return this.parseResponse<T>(res);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await this.ctx.put(path, { data: body });
    return this.parseResponse<T>(res);
  }

  async delete<T>(path: string): Promise<T> {
    const res = await this.ctx.delete(path);
    return this.parseResponse<T>(res);
  }

  // ─── Domain-specific methods ──────────────────────────────────────────────

  /**
   * Returns the raw APIResponse without throwing on non-2xx.
   * Use when you need to inspect status codes or headers directly.
   */
  async getRaw(path: string, params?: Record<string, string>): Promise<APIResponse> {
    return this.ctx.get(path, { params });
  }

  async getProducts(filters?: Record<string, string>) {
    return this.get<unknown[]>('/api/products', filters);
  }

  async getProductById(id: string) {
    return this.get<unknown>(`/api/products/${id}`);
  }

  async placeOrder(payload: unknown) {
    return this.post<unknown>('/api/orders', payload);
  }

  async getOrderById(orderId: string) {
    return this.get<unknown>(`/api/orders/${orderId}`);
  }

  async applyPromoCode(code: string) {
    return this.get<unknown>(`/api/promo-codes/${code}`);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async parseResponse<T>(res: APIResponse): Promise<T> {
    if (!res.ok()) {
      const body = await res.text().catch(() => '(no body)');
      throw new Error(
        `ApiClient: request failed — status ${res.status()} ${res.statusText()}\n${body}`
      );
    }

    const contentType = res.headers()['content-type'] ?? '';
    if (contentType.includes('application/json')) {
      return res.json() as Promise<T>;
    }

    return res.text() as unknown as T;
  }
}
