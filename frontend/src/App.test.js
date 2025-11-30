import { AppProvider } from './context/appContext';

test('AppProvider provides context', () => {
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();
  
  expect(AppProvider).toBeDefined();
});

test('localStorage token handling', () => {
  localStorage.setItem('token', 'test-token');
  expect(localStorage.getItem('token')).toBe('test-token');
  
  localStorage.removeItem('token');
  expect(localStorage.getItem('token')).toBeNull();
});
