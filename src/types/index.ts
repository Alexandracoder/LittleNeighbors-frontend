import { ReactNode } from "react"

// --- AUTH & USER ---
export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface FamilyAuthResponseDTO {
  family: FamilyResponseDTO
  accessToken: string
  refreshToken: string
}

export interface DecodedToken {
  sub: string
  roles: UserRole[]
  exp: number
}

export interface User {
  email: string
  roles: UserRole[]
}

export type UserRole = 'USER' | 'FAMILY' | 'ADMIN'

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password?: string
}

// --- FAMILY ---
export interface FamilyRequestDTO {
  representativeName: string
  familyName: string
  description: string
  profilePictureUrl: string
  neighborhoodId: number
}

export interface FamilyResponseDTO {
  data: { accessToken: any; refreshToken: any }
  id: number
  representativeName: string
  familyName: string
  description: string
  profilePictureUrl: string
  neighborhoodName: string
  
  streetName?: string
  postalCode?: string
  cityName?: string
  children?: ChildSummaryDTO[]
}


export interface ChildSummaryDTO {
  id: number
  gender: 'BOY' | 'GIRL'
  age: number
}

export interface ChildResponseDTO {
  firstName: ReactNode
  id: number
  gender: 'BOY' | 'GIRL'
  birthDate: string
  age: number
  interests: InterestResponseDTO[]
  familyId: number
}

export interface ChildRequestDTO {
  gender: 'BOY' | 'GIRL'
  birthDate: string
  interestIds: number[]
}


export interface InterestResponseDTO {
  id: number
  name: string
  type: string
}

export interface NeighborhoodResponseDTO {
  id: number
  name: string
  cityName: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
