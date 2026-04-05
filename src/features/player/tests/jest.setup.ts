import '@testing-library/jest-dom';

// Mock URL.createObjectURL / revokeObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = jest.fn().mockImplementation(() => 'mock-url');
  window.URL.revokeObjectURL = jest.fn();
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
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock MediaRecorder
class MockMediaRecorder {
  ondataavailable: unknown = null;
  onstop: unknown = null;
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  constructor(_stream: unknown, _options?: unknown) {}
  start() { this.state = 'recording'; }
  stop() {
    this.state = 'inactive';
    if (typeof this.onstop === 'function') (this.onstop as () => void)();
  }
}
(window as unknown as Record<string, unknown>).MediaRecorder = MockMediaRecorder;

// Mock MediaDevices
if (!navigator.mediaDevices) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }],
      }),
    },
    configurable: true,
  });
}

// Mock HTMLMediaElement
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: jest.fn().mockResolvedValue(undefined),
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: jest.fn(),
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: jest.fn(),
});

// Mock canvas getContext (for WaveformDisplay)
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  fill: jest.fn(),
  scale: jest.fn(),
  roundRect: jest.fn(),
  get fillStyle() { return ''; },
  set fillStyle(_v: string) {},
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;
