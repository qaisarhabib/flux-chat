import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: jest.fn(),
});
