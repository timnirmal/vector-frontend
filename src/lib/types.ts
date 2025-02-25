export interface Workflow {
    id: number;
    title: string;
    description: string;
    type: 'analysis' | 'conversation' | 'decision';
    status: 'active' | 'inactive';
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ email: string; name: string; id: string; }>;
    logout: () => void;
  }