/**
 * Test setup for server management API tests
 * Provides global mocks and utilities for testing
 */

// Mock Request and Response for Node.js environment
global.Request = class MockRequest {
  public url: string;
  public method: string;
  public headers: Map<string, string>;
  private _body: string;

  constructor(url: string, init: any = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Map();
    this._body = init.body || '';
    
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value as string);
      });
    }
  }

  async json() {
    return JSON.parse(this._body);
  }

  async text() {
    return this._body;
  }
} as any;

global.Response = class MockResponse {
  public status: number;
  public statusText: string;
  public headers: Headers;
  public body: string | null;

  constructor(body: string | null = null, init: any = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new (global.Headers as any)(init.headers || {});
  }

  async json() {
    return this.body ? JSON.parse(this.body) : null;
  }

  async text() {
    return this.body || '';
  }
} as any;

// Mock Headers class
global.Headers = class MockHeaders {
  private headers: Map<string, string>;

  constructor(init?: any) {
    this.headers = new Map();
    
    if (init) {
      if (init instanceof Map) {
        this.headers = new Map(init);
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value as string);
        });
      }
    }
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  delete(name: string): void {
    this.headers.delete(name.toLowerCase());
  }

  forEach(callback: (value: string, key: string) => void): void {
    this.headers.forEach(callback);
  }

  entries() {
    return this.headers.entries();
  }

  keys() {
    return this.headers.keys();
  }

  values() {
    return this.headers.values();
  }
} as any;

// Mock URL constructor for Node.js environment
if (typeof URL === 'undefined') {
  global.URL = class MockURL {
    public href: string;
    public origin: string;
    public protocol: string;
    public host: string;
    public hostname: string;
    public port: string;
    public pathname: string;
    public search: string;
    public hash: string;
    public searchParams: URLSearchParams;

    constructor(url: string, base?: string) {
      this.href = url;
      
      // Simple URL parsing for tests
      const match = url.match(/^(https?:)\/\/([^\/]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/);
      if (match) {
        this.protocol = match[1];
        this.host = match[2];
        this.hostname = match[2].split(':')[0];
        this.port = match[2].split(':')[1] || '';
        this.pathname = match[3] || '/';
        this.search = match[4] || '';
        this.hash = match[5] || '';
      } else {
        this.protocol = 'http:';
        this.host = 'localhost';
        this.hostname = 'localhost';
        this.port = '';
        this.pathname = url;
        this.search = '';
        this.hash = '';
      }
      
      this.origin = `${this.protocol}//${this.host}`;
      this.searchParams = new URLSearchParams(this.search);
    }
  } as any;
}

// Mock URLSearchParams for Node.js environment
if (typeof URLSearchParams === 'undefined') {
  global.URLSearchParams = class MockURLSearchParams {
    private params: Map<string, string>;

    constructor(init?: string) {
      this.params = new Map();
      
      if (init) {
        const search = init.startsWith('?') ? init.slice(1) : init;
        const pairs = search.split('&');
        
        for (const pair of pairs) {
          const [key, value] = pair.split('=');
          if (key) {
            this.params.set(
              decodeURIComponent(key), 
              decodeURIComponent(value || '')
            );
          }
        }
      }
    }

    get(name: string): string | null {
      return this.params.get(name) || null;
    }

    set(name: string, value: string): void {
      this.params.set(name, value);
    }

    has(name: string): boolean {
      return this.params.has(name);
    }

    delete(name: string): void {
      this.params.delete(name);
    }

    toString(): string {
      const pairs: string[] = [];
      this.params.forEach((value, key) => {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });
      return pairs.join('&');
    }
  } as any;
}

// Mock crypto.randomUUID for Node.js environments that don't have it
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  global.crypto = {
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
  } as any;
}

// Mock WebSocket for tests
global.WebSocket = class MockWebSocket {
  public static CONNECTING = 0;
  public static OPEN = 1;
  public static CLOSING = 2;
  public static CLOSED = 3;

  public readyState: number = 1; // OPEN
  public url: string;
  
  private listeners: Map<string, Function[]> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  send(data: string): void {
    // Mock send - could emit events for testing
    console.log('WebSocket send:', data);
  }

  close(): void {
    this.readyState = 3; // CLOSED
    const closeCallbacks = this.listeners.get('close') || [];
    closeCallbacks.forEach(callback => callback());
  }
} as any;