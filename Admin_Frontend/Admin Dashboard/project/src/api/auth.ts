import { LoginCredentials } from '../types/auth';

const ADMIN_KEY = 'localAdmin';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const storedAdmin = localStorage.getItem(ADMIN_KEY);

    if (!storedAdmin) {
      throw new Error('Admin not registered');
    }

    const admin = JSON.parse(storedAdmin);

    if (
      admin.email !== credentials.email ||
      admin.password !== credentials.password
    ) {
      throw new Error('Invalid credentials');
    }

    return {
      token: 'mock-admin-token',
      user: {
        id: 1,
        name: 'Admin',
        email: admin.email,
        role: 'ADMIN',
      },
    };
  },

  registerAdmin: async (data: {
    email: string;
    password: string;
  }) => {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(data));
    return true;
  },

  logout: async () => {
    return true;
  },

  validateToken: async () => {
    return !!localStorage.getItem('authToken');
  },
};
