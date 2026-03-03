// --- AUTH & USER ---
export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
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

export type UserRole = 'ROLE_USER' | 'ROLE_FAMILY' | 'ROLE_ADMIN'

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
  id: number
  representativeName: string
  familyName: string
  description: string
  profilePictureUrl: string
  neighborhoodName: string
  // Añadimos estos para que coincidan con tu Java Mapper
  streetName?: string
  postalCode?: string
  cityName?: string
  children?: ChildSummaryDTO[]
}

// --- CHILD ---
export interface ChildSummaryDTO {
  id: number
  gender: 'BOY' | 'GIRL'
  age: number
}

export interface ChildResponseDTO {
  id: number
  gender: 'BOY' | 'GIRL'
  birthDate: string
  age: number
  interests: InterestResponseDTO[] // Ya no es interestIds
  familyId: number
}

export interface ChildRequestDTO {
  gender: 'BOY' | 'GIRL'
  birthDate: string
  interestIds: number[] // El Request sigue enviando IDs (long)
}

// --- INTEREST & NEIGHBORHOOD ---
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

// --- UTILS ---
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
