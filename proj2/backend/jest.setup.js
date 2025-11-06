import { beforeAll, afterAll, afterEach } from '@jest/globals';

// Skip database connection for unit tests
// Tests that need database should set up their own connections
// This prevents timeout issues when running tests without a database

