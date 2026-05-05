// Mock authentication functions

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

export const validateCredentials = (credentials) => {
  const { email, password } = credentials;
  
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required',
    };
  }

  const user = mockUsers[email];

  if (!user) {
    return {
      success: false,
      error: 'User not found',
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      error: 'Invalid password',
    };
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return {
    success: true,
    data: {
      ...userWithoutPassword,
      token: `token_${user.id}_${Date.now()}`,
    },
  };
};

export const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = validateCredentials({ email, password });
      if (result.success) {
        resolve(result.data);
      } else {
        reject(new Error(result.error));
      }
    }, 800);
  });
};
