import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock URL.createObjectURL if needed
global.URL.createObjectURL = vi.fn(() => 'mocked-object-url');

// Cleanup after each test
afterEach(() => {
  cleanup();
});

