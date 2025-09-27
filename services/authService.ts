const API_BASE_URL = '/api';

export interface User {
  id: number;
  email: string;
  name: string;
  credits: number;
  avatarUrl?: string;
  subscriptionStatus?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    this.user = this.getStoredUser();
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  private storeAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearAuth(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    this.storeAuth(data.token, data.user);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    this.storeAuth(data.token, data.user);
    return data;
  }

  async loginWithGoogle(): Promise<void> {
    // Redirect to Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        this.clearAuth();
        return null;
      }

      const data = await response.json();
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      this.clearAuth();
      return null;
    }
  }

  async getUserCredits(): Promise<number> {
    if (!this.token) {
      return 0;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/credits`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data.credits;
    } catch (error) {
      console.error('Error fetching credits:', error);
      return 0;
    }
  }

  async getUserUsage(): Promise<any[]> {
    if (!this.token) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/usage`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.usage;
    } catch (error) {
      console.error('Error fetching usage:', error);
      return [];
    }
  }

  async getUserTransactions(): Promise<any[]> {
    if (!this.token) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/transactions`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  logout(): void {
    this.clearAuth();
  }

  isAuthenticated(): boolean {
    // Always check localStorage first in case the instance was recreated
    const storedToken = localStorage.getItem('auth_token');
    
    if (!this.token && storedToken) {
      this.token = storedToken;
      this.user = this.getStoredUser();
    }
    
    if (!this.token) {
      return false;
    }
    
    // Check if token is expired by trying to decode it
    try {
      // Handle both JWT format and our simplified base64 format
      let payload;
      if (this.token.includes('.')) {
        // JWT format
        payload = JSON.parse(atob(this.token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          this.clearAuth();
          return false;
        }
      } else {
        // Our simplified base64 format
        payload = JSON.parse(atob(this.token));
        if (payload.exp && payload.exp < Date.now()) {
          this.clearAuth();
          return false;
        }
      }
      return true;
    } catch (error) {
      // Invalid token format, clear it
      this.clearAuth();
      return false;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Helper method to handle 401 responses
  private handleUnauthorized(): void {
    this.clearAuth();
    // Optionally redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  getCurrentUserSync(): User | null {
    return this.user;
  }

  // Handle OAuth callback
  handleOAuthCallback(token: string, user: User): void {
    this.storeAuth(token, user);
  }
}

export const authService = new AuthService();
