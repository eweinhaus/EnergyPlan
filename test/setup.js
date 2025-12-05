// Jest setup file for Phase 2 tests

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:test';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window
global.window = {
  ...global.window,
  localStorage: localStorageMock,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  navigator: {
    onLine: true,
    serviceWorker: {
      register: jest.fn(),
      ready: Promise.resolve({ unregister: jest.fn() }),
    },
  },
};

// Mock Blob and URL for PDF tests
global.Blob = class Blob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};

global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock fetch for API tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    blob: () => Promise.resolve(new Blob(['mock'])),
  })
);

// Suppress console warnings during tests
global.console.warn = jest.fn();
global.console.error = jest.fn();

