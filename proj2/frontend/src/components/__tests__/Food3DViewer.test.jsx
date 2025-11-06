import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Food3DViewer from '../Food3DViewer/Food3DViewer';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  useGLTF: () => ({ scene: {} }),
  Environment: () => null,
  Html: ({ children }) => <div>{children}</div>,
}));

describe('Food3DViewer', () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'mocked-url');
    global.URL.revokeObjectURL = vi.fn();
    global.atob = vi.fn((str) => str);
  });

  it('should return null when modelData is not provided', () => {
    const { container } = render(<Food3DViewer />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when modelData.data is missing', () => {
    const { container } = render(<Food3DViewer modelData={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render viewer when valid modelData is provided', () => {
    const modelData = {
      data: 'base64modeldata',
      contentType: 'model/gltf-binary',
    };

    const { container } = render(<Food3DViewer modelData={modelData} />);
    expect(container.firstChild).not.toBeNull();
  });
});

