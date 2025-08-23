// Example usage of the new API client
import { api, APIError } from './index';

// Example interfaces for API responses
interface User {
  id: string;
  email: string;
  name: string;
}

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

// Example API functions using the new client
export const userApi = {
  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    try {
      return await api.get<User>(`/users/${id}`);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Get all users
  getUsers: async (): Promise<User[]> => {
    try {
      return await api.get<User[]>('/users');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    try {
      return await api.post<User>('/users', userData);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      return await api.put<User>(`/users/${id}`, userData);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },
};

// Example usage in a React component or server action
export const exampleUsage = {
  // Example server action (Next.js 15)
  createUserAction: async (formData: FormData) => {
    'use server';
    
    try {
      const userData = {
        email: formData.get('email') as string,
        name: formData.get('name') as string,
        password: formData.get('password') as string,
      };

      const newUser = await userApi.createUser(userData);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Example client-side usage
  fetchUserData: async (userId: string) => {
    try {
      const user = await userApi.getUser(userId);
      return user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },
};