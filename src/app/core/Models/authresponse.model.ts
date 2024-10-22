export interface AuthResponse {
    _id: string;
    email: string;
    token?: string;
    message?: string;
  }

  export interface LoginResponse {
    token: string;
    success:false
    userId: string;
    message?: string;
  }