import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import NotificationListener from '../NotificationListener/NotificationListener';
import { StoreContext } from '../../Context/StoreContext';
import { useSocket } from '../../Context/SocketContext';
import axios from 'axios';

vi.mock('axios');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn(), custom: vi.fn(), dismiss: vi.fn() },
  success: vi.fn(),
  error: vi.fn(),
  custom: vi.fn(),
  dismiss: vi.fn(),
}));

vi.mock('../../Context/SocketContext', async () => {
  const actual = await vi.importActual('../../Context/SocketContext');
  return {
    ...actual,
    useSocket: vi.fn(),
  };
});

const mockSocket = () => {
  const handlers = {};
  return {
    on: vi.fn((evt, cb) => { handlers[evt] = cb; }),
    off: vi.fn((evt) => { delete handlers[evt]; }),
    emit: vi.fn(),
    __handlers: handlers,
  };
};

const renderWithStore = (ui, ctx) => {
  return render(
    <StoreContext.Provider value={ctx}>
      {ui}
    </StoreContext.Provider>
  );
};

describe('NotificationListener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.atob = vi.fn(() => JSON.stringify({ id: 'user123' }));
  });

  it('registers user on socket when token present', async () => {
    const s = mockSocket();
    useSocket.mockReturnValue(s);
    renderWithStore(<NotificationListener />, { token: 'x.y.z', currency: '$', url: 'http://localhost:4000' });

    await waitFor(() => {
      expect(s.emit).toHaveBeenCalledWith('register', 'user123');
    });
  });

  it('registers socket listener for orderCancelled', async () => {
    const s = mockSocket();
    useSocket.mockReturnValue(s);

    renderWithStore(<NotificationListener />, { token: 'x.y.z', currency: '$', url: 'http://localhost:4000' });

    await waitFor(() => {
      expect(s.on).toHaveBeenCalledWith('orderCancelled', expect.any(Function));
    });
  });
});




