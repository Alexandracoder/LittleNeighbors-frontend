// --- AUTH & USER ---
export type UserRole = 'ROLE_USER' | 'ROLE_FAMILY' | 'ROLE_ADMIN'

export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserProfileDTO
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

export interface UserProfileDTO {
  email: string
  roles: UserRole[]
  family: FamilyResponseDTO | null
}

export interface UserStatusDTO {
  hasFamily: boolean
  hasChildren: boolean
  isRegistrationComplete: boolean
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
  familyName: string
  representativeName: string
  description: string
  profilePictureUrl: string
  neighborhoodId: number
  neighborhoodName: string
  streetName: string
  postalCode: string
  cityName: string
  // En el Explorer, solemos recibir los intereses ya como strings
  interests: string[]
  children: ChildResponseDTO[]
}

// --- CHILDREN & INTERESTS ---
export type Gender = 'BOY' | 'GIRL'

export type LifeStage =
  | 'PREGNANCY'
  | 'BABY'
  | 'TODDLER'
  | 'PRE_SCHOOLER'
  | 'SCHOOL_AGE'
  | 'ADOLESCENT'
  | 'BORN'

export interface InterestResponseDTO {
  id: number
  name: string
  type: string
  icon?: string
}

export interface ChildRequestDTO {
  birthDate: string
  gender: Gender
  interestIds: number[]
  lifeStage: 'PREGNANCY' | 'BORN'
}

export interface ChildResponseDTO {
  id: number
  age: number
  gender: Gender
  birthDate: string
  lifeStage?: LifeStage
  interests: InterestResponseDTO[]
}

// --- CHAT & MESSAGES ---
export interface SendMessageDTO {
  matchId: number
  content: string
}

export interface MessageResponseDTO {
  id: number
  content: string
  senderEmail: string
  sentAt: string
}

// --- NEIGHBORHOOD & EVENTS ---
export interface NeighborhoodResponseDTO {
  id: number
  name: string
  streetName: string
  postalCode: string
  cityName: string
}

export interface EventResponseDTO {
  id: number
  title: string
  description: string
  eventDate: string
  latitude: number
  longitude: number
  neighborhoodId: number
}

// --- MATCHES ---
export interface Match {
  id: number
  childA: ChildResponseDTO
  childB: ChildResponseDTO
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
}

// --- UTILS ---
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
