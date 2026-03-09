// --- AUTH & USER ---
export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  family: FamilyResponseDTO
}

export interface DecodedToken {
  sub: string
  roles: UserRole[]
  exp: number
}

export type UserRole = 'USER' | 'FAMILY' | 'ADMIN'

export interface User {
  email: string
  roles: UserRole[]
  familyEntity?: FamilyResponseDTO
}

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
  streetName: string
  postalCode: string
  cityName: string
  children: ChildSummaryDTO[];
}

// --- CHILDREN & INTERESTS ---
export interface ChildResponseDTO {
  lifeStage: string
  isPrenatal: any
  dueDate: any
  id: number
  gender: 'BOY' | 'GIRL'
  birthDate?: string
  age: number
  interests: InterestResponseDTO[]
  familyId: number
}

export interface ChildRequestDTO {
  // Cambiamos a los estados que prefieras usar consistentemente
  lifeStage: 'PREGNANCY' | 'BORN'


  gender: 'BOY' | 'GIRL' | null

  birthDate?: string | null
  dueDate?: string | null

  isPrenatal: boolean

  interestIds: number[]
}
export interface InterestResponseDTO {
  id: number
  name: string
  type: string
}

// --- NEIGHBORHOOD & EVENTS ---
export interface NeighborhoodResponseDTO {
  id: number
  name: string
  cityName: string
}

export interface NeighborhoodEvent {
  id: string
  title: string
  date: string
  location: string
  description: string
  category: 'playground' | 'education' | 'park' | 'community_center' | 'other'
}

// --- UTILS ---
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface ChildSummaryDTO {
  id: number
  gender: string
  age: number
}

export interface FamilyAuthResponseDTO {
  family: FamilyResponseDTO | null
  accessToken: string
  refreshToken: string
}

export interface UserProfileDTO {
  email: string
  roles: UserRole[]
  family: FamilyResponseDTO | null
}

export interface Child {
  id: number
  lifeStage: 'PREGNANCY' | 'BORN'
  birthDate: string
  neighborhood: string
  interests: string[]
}

export interface Match {
  id: number
  childA: Child
  childB: Child
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
}

export interface MatchRequest {
  initiatorChildId: number
  targetChildId: number
}

export interface MatchRequest {
  initiatorChildId: number
  targetChildId: number
}
