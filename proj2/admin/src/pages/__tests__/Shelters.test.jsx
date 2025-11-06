import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Shelters from '../Shelters/Shelters';
import axios from 'axios';
import { toast } from 'react-toastify';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockShelters = [
  {
    _id: 'shelter1',
    name: 'Test Shelter 1',
    contactName: 'John Doe',
    contactEmail: 'john@test.com',
    contactPhone: '123-456-7890',
    capacity: 100,
    active: true,
    address: {
      street: '123 Main St',
      city: 'Raleigh',
      state: 'NC',
      zipcode: '27601'
    }
  },
  {
    _id: 'shelter2',
    name: 'Test Shelter 2',
    contactName: 'Jane Smith',
    contactEmail: 'jane@test.com',
    contactPhone: '987-654-3210',
    capacity: 150,
    active: true,
    address: {
      street: '456 Oak Ave',
      city: 'Durham',
      state: 'NC',
      zipcode: '27701'
    }
  }
];

describe('Shelters Page (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render shelters page', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockShelters }
    });

    render(<Shelters />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  it('should display list of shelters', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: mockShelters }
    });

    render(<Shelters />);

    await waitFor(() => {
      expect(screen.getByText('Test Shelter 1')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching shelters', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    const { container } = render(<Shelters />);

    // Component should render - error is handled internally
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

