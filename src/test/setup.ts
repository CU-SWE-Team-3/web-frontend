import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock URL.createObjectURL/revokeObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn().mockImplementation(() => 'mock-url');
  window.URL.revokeObjectURL = vi.fn();
}

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(), 
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock MediaRecorder
class MockMediaRecorder {
  ondataavailable: any = null;
  onstop: any = null;
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  constructor(stream: any, options?: any) {}
  start() { this.state = 'recording'; }
  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }
}
(window as any).MediaRecorder = MockMediaRecorder;

// Mock MediaDevices
if (navigator.mediaDevices === undefined) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
    configurable: true,
  });
}

