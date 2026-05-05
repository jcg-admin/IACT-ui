export const mockUsers = {
  'admin@iact.com': {
    id: '1',
    email: 'admin@iact.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin',
  },
  'user@iact.com': {
    id: '2',
    email: 'user@iact.com',
    password: 'password123',
    name: 'Regular User',
    role: 'user',
  },
};

export const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers[email];
      if (user && user.password === password) {
        resolve({
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

// Export authMocks object for test compatibility
export const authMocks = {
  validUser: mockUsers['admin@iact.com'],
  invalidUser: {
    email: 'invalid@test.com',
    password: 'wrongpassword',
  },
};
