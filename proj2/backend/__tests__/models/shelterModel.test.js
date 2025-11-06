import { describe, it, expect } from '@jest/globals';
import shelterModel from '../../models/shelterModel.js';

describe('Shelter Model', () => {
  it('should create a shelter with required fields', () => {
    const shelterData = {
      name: 'Test Shelter'
    };

    const shelter = new shelterModel(shelterData);

    expect(shelter.name).toBe('Test Shelter');
    expect(shelter.active).toBe(true);
    expect(shelter.capacity).toBe(0);
    expect(shelter.address.country).toBe('United States');
  });

  it('should create a shelter with all fields', () => {
    const shelterData = {
      name: 'Test Shelter',
      contactName: 'John Doe',
      contactPhone: '123-456-7890',
      contactEmail: 'john@example.com',
      capacity: 100,
      address: {
        street: '123 Main St',
        city: 'Raleigh',
        state: 'NC',
        zipcode: '27601'
      },
      active: true
    };

    const shelter = new shelterModel(shelterData);

    expect(shelter.name).toBe('Test Shelter');
    expect(shelter.contactName).toBe('John Doe');
    expect(shelter.contactPhone).toBe('123-456-7890');
    expect(shelter.contactEmail).toBe('john@example.com');
    expect(shelter.capacity).toBe(100);
    expect(shelter.address.street).toBe('123 Main St');
    expect(shelter.address.city).toBe('Raleigh');
    expect(shelter.active).toBe(true);
  });

  it('should require name field', () => {
    const shelterData = {};

    const shelter = new shelterModel(shelterData);
    const error = shelter.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it('should have default values', () => {
    const shelterData = {
      name: 'Test Shelter'
    };

    const shelter = new shelterModel(shelterData);

    expect(shelter.contactName).toBe('');
    expect(shelter.contactPhone).toBe('');
    expect(shelter.contactEmail).toBe('');
    expect(shelter.capacity).toBe(0);
    expect(shelter.active).toBe(true);
    expect(shelter.address.country).toBe('United States');
  });

  it('should not have version key', () => {
    const shelterData = {
      name: 'Test Shelter'
    };

    const shelter = new shelterModel(shelterData);
    
    // Check schema options
    const schema = shelter.constructor.schema;
    expect(schema.get('versionKey')).toBe(false);
  });
});



