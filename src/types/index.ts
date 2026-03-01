export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface FamilyRequestDTO {
  representativeName: string;
  familyName: string;
  description: string;
  profilePictureUrl: string;
  neighborhoodId: number;
}

export interface FamilyResponseDTO {
  id: number;
  representativeName: string;
  familyName: string;
  description: string;
  profilePictureUrl: string;
  neighborhoodName: string;
}

export interface ChildRequestDTO {
  birthDate: string;
  gender: 'BOY' | 'GIRL';
  interests: number[];
}

export interface ChildResponseDTO {
  id: number;
  firstName: string;
  age: number;
  interests: string[];
}

export interface NeighborhoodResponseDTO {
  id: number;
  name: string;
  cityName: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type UserRole = 'ROLE_USER' | 'ROLE_FAMILY' | 'ROLE_ADMIN';

export interface DecodedToken {
  sub: string;
  roles: UserRole[];
  exp: number;
}

export interface User {
  email: string;
  roles: UserRole[];
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password?: string
}
