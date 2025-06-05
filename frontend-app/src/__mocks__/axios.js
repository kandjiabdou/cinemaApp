// Mock d'axios pour les tests
export default {
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: { success: true } })),
  put: jest.fn(() => Promise.resolve({ data: { success: true } })),
  delete: jest.fn(() => Promise.resolve({ data: { success: true } })),
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  }
}; 