
// ==========================================
// AUTHENTICATION TYPES
// ==========================================

export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  id: number
  email: string
  firstName: string
  lastName: string
  roles: UserRole[]
}
export interface RefreshRequest {
  refreshToken: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password?: string
}

export type UserRole = 'ROLE_USER' | 'ROLE_FAMILY' | 'ROLE_ADMIN'

export interface DecodedToken {
  id: number
  sub: string
  roles: UserRole[]
  exp: number
}
export interface User {
  hasChildren: boolean
  hasFamily: boolean
  children: boolean
  id: string
  email: string
  firstName: string
  lastName: string
  roles: UserRole[]
  family: null
}

export interface UserStatusDTO {
  roles: User | null
  hasFamily: boolean
  hasChildren: boolean
  isRegistrationComplete: boolean
}

export interface UserProfileDTO {
  id: number | string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  roles: string[]
  verificationStatus: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'
  family: FamilyResponseDTO | null
}

// ==========================================
// NEIGHBORHOOD TYPES
// ==========================================

export interface NeighborhoodDTO {
  id: number
  name: string
  postalCode?: string
  city?: string
}

export interface NeighborhoodResponseDTO {
  id: number
  name: string
  streetName: string
  postalCode: string
  cityId: number
  cityName: string
}

// ==========================================
// INTEREST TYPES
// ==========================================

export interface InterestResponseDTO {
  id: number
  name: string
  type?: string
  icon?: string
}

// ==========================================
// CHILDREN TYPES
// ==========================================

export interface ChildSummaryDTO {
  id: number
  nickname: string
  gender: string
  age: number
  lifeStage: string
  interests?: InterestResponseDTO[]
}

export interface ChildRequestDTO {
  nickname: string
  birthDate: string
  lifeStage: string
  gender: 'BOY' | 'GIRL' | 'SURPRISE'
  description?: string
  profilePictureUrl?: string
  interestIds: number[]
  age: number
}

export interface ChildResponseDTO {
  id: number
  nickname: string
  gender: 'BOY' | 'GIRL' | 'SURPRISE'
  lifeStage: string
  description?: string
  birthDate: string
  age: number
  interests: InterestResponseDTO[]
  familyId: number
  profilePictureUrl?: string
  avatarUrl?: string
}

// ==========================================
// FAMILY TYPES
// ==========================================

export interface FamilyRequestDTO {
  status: 'PREGNANT' | 'NEW_PARENTS' | 'ESTABLISHED_FAMILY' | 'SURPRISE'
  familyInterests: string[]
  representativeName: string
  familyName: string
  description: string
  profilePictureUrl: string
  neighborhoodId: number
}

export interface FamilyResponseDTO {
  refreshToken: any
  accessToken: any
  family: any
  id: number
  familyName: string
  representativeName: string
  displayName: string
  description: string
  profilePictureUrl: string


  latitude: number
  longitude: number


  neighborhoodId: number
  neighborhoodName: string
  neighborhood: NeighborhoodDTO
  streetName: string
  postalCode: string
  cityName: string

  status: 'PREGNANT' | 'NEW_PARENTS' | 'ESTABLISHED_FAMILY' | 'SURPRISE'
  familyInterests: string[]
  children: ChildSummaryDTO[]
}

// ==========================================
// CHAT & MESSAGING TYPES
// ==========================================

export interface MessageDTO {
  id: number
  matchId: number
  senderId: number | string
  senderEmail: string
  senderAvatar?: string
  content: string
  timestamp: string
}

export interface MessageService {
  getHistory: (matchId: number, signal?: AbortSignal) => Promise<MessageDTO[]>
  sendMessage: (matchId: number, content: string) => Promise<MessageDTO>
}

// ==========================================
// PLAYDATE TYPES
// ==========================================

export interface Playdate {
  id: number
  title: string
  description?: string
  location: string
  date: string
  startTime: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  matchId: number
  createdAt: string
  updatedAt?: string

  neighborName?: string
}

export interface PlaydateRequest {
  title: string
  startTime: string
  description?: string
  matchId: number
}

// ==========================================
// COMMON & UTILS
// ==========================================

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
