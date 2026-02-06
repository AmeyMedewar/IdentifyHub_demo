import { useState, useCallback } from 'react';
import { usersApi } from '../api/users';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page = 0, size = 10, search = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getAll(page, size, search);
      setUsers(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (user: CreateUserDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await usersApi.create(user);
      setUsers((prev) => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: number, user: UpdateUserDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await usersApi.update(id, user);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? updatedUser : u))
      );
      return updatedUser;
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await usersApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleUserActive = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await usersApi.toggleActive(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? updatedUser : u))
      );
      return updatedUser;
    } catch (err) {
      setError('Failed to toggle user status');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    totalElements,
    totalPages,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
  };
};
