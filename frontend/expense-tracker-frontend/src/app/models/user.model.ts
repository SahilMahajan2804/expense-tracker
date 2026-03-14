export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  department?: string;
  role: Role;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  role?: Role;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  firstname: string;
  lastname: string;
  registerMessage: string;
  requiresVerification: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  firstname: string;
  lastname: string;
  role: Role;
  department: string;
  jwtToken: string;
  tokenType: string;
  expiresIn: number;
  message: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
}

export interface OtpResponse {
  email: string;
  message: string;
  verified: boolean;
}
