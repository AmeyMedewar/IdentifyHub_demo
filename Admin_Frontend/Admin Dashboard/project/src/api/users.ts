import apiClient from './axios';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/user';

/**
 * TEMP MOCK DATA
 * This will be REMOVED when backend is ready
 */
let mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    faceEmbeddingReference: null,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@example.com',
    faceEmbeddingReference: null,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export const usersApi = {
  getAll: async (
    page = 0,
    size = 10,
    search = ''
  ): Promise<{ content: User[]; totalElements: number; totalPages: number }> => {
    try {
      // 🔗 REAL BACKEND CALL (future)
      const response = await apiClient.get('/api/admin/users', {
        params: { page, size, search },
      });
      return response.data;
    } catch (error) {
      // 🧪 MOCK FALLBACK (now)
      const filtered = mockUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );

      return {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
      };
    }
  },

  getById: async (id: number): Promise<User> => {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  create: async (user: CreateUserDTO): Promise<User> => {
    const newUser: User = {
      id: Date.now(),
      ...user,
      faceEmbeddingReference: null,
      createdAt: new Date().toISOString(),
    };

    mockUsers = [newUser, ...mockUsers];
    return newUser;
  },

  update: async (id: number, user: UpdateUserDTO): Promise<User> => {
    let updatedUser!: User;

    mockUsers = mockUsers.map((u) => {
      if (u.id === id) {
        updatedUser = { ...u, ...user };
        return updatedUser;
      }
      return u;
    });

    return updatedUser;
  },

  delete: async (id: number): Promise<void> => {
    mockUsers = mockUsers.filter((u) => u.id !== id);
  },

  toggleActive: async (id: number): Promise<User> => {
    let updatedUser!: User;

    mockUsers = mockUsers.map((u) => {
      if (u.id === id) {
        updatedUser = { ...u, active: !u.active };
        return updatedUser;
      }
      return u;
    });

    return updatedUser;
  },
};
