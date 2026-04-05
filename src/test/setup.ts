import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock URL.createObjectURL/revokeObjectURL
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn().mockImplementation(() => 'mock-url');
  window.URL.revokeObjectURL = vi.fn();
}

// Mock ResizeObserver
class MockResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
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
  constructor(stream: any, options?: any) { }
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

// Mock HTMLMediaElement
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined),
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(),
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: vi.fn(),
});

// Mock canvas getContext (for WaveformDisplay)
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  fill: vi.fn(),
  scale: vi.fn(),
  roundRect: vi.fn(),
  get fillStyle() { return ''; },
  set fillStyle(_v: string) {},
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock AudioContext
class MockAudioContext {
  createBuffer() { return {}; }
  createBufferSource() { return { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn() }; }
  createGain() { return { connect: vi.fn(), disconnect: vi.fn(), gain: { value: 1 } }; }
  createAnalyser() { return { connect: vi.fn(), disconnect: vi.fn() }; }
  destination = {};
  close() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
  resume() { return Promise.resolve(); }
}
(window as any).AudioContext = MockAudioContext;
(window as any).webkitAudioContext = MockAudioContext;
