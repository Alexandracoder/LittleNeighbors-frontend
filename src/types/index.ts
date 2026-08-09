// ==========================================
// CENTRALIZED TYPES & CONSTANTS
// ==========================================

import { ReactNode } from "react"

export type UserStatusType =
  | 'UNVERIFIED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'BLOCKED'
export type UserRole =
  | 'ROLE_USER'
  | 'ROLE_FAMILY'
  | 'ROLE_ADMIN'
  | 'ADMIN'
  | 'FAMILY'

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
  id: number | string
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
  inviteToken?: string
  consentGiven: boolean
}

export interface DecodedToken {
  id: number | string
  sub: string
  roles: UserRole[]
  exp: number
}

export interface User {
  id: number | string
  email: string
  firstName: string
  lastName: string
  roles: UserRole[]
  hasChildren: boolean
  hasFamily: boolean
  children: boolean
  family: null
  verificationStatus?: UserStatusType
  rejectionReason?: string
  userRoles?: string
  idDocumentUrl?: string
  selfieUrl?: string
}

export interface UserStatusDTO {
  roles: UserRole[] | null
  hasFamily: boolean
  hasChildren: boolean
  isRegistrationComplete: boolean
  verificationStatus: UserStatusType
}

export interface UserProfileDTO {
  id: number | string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  roles: string[]
  verificationStatus: UserStatusType
  family: FamilyResponseDTO | null
}

export interface AdminServiceInterface {
  getPendingUsers: () => Promise<User[]>
  verifyUser: (userId: number | string) => Promise<void>
  blockUser: (userId: number | string) => Promise<void>
  rejectUser: (userId: number | string, reason: string) => Promise<void>
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
  avatarKey?: string
}

export interface ChildRequestDTO {
  nickname: string
  birthDate: string
  dueDate?: string
  lifeStage: string
  gender: 'BOY' | 'GIRL' | 'SURPRISE' | 'PREGNANT'
  description?: string
  profilePictureUrl?: string
  interestIds: number[]
  age: number
  avatarKey?: string
}

export interface ChildResponseDTO {
  id: number
  nickname: string
  gender: 'BOY' | 'GIRL' | 'SURPRISE' | 'PREGNANT'
  lifeStage: string
  description?: string
  birthDate: string
  dueDate?: string
  age: number
  interests: InterestResponseDTO[]
  familyId: number
  profilePictureUrl?: string
  avatarUrl?: string
  avatarKey?: string
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
  photoModerationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  photoRejectionReason?: string
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
  createdByFamilyId?: number | null
}

export interface PlaydateRequest {
  title: string
  startTime: string
  description?: string
  matchId: number
  // El backend no tiene columna "location" en playdates, y "status"
  // siempre lo fija el servidor (PENDING al crear). Se dejan opcionales
  // por si en el futuro se añaden, pero no deben ser obligatorios: antes
  // esto hacía que TypeScript marcara como inválida la llamada real que sí
  // coincide con lo que espera el backend (AddPlaydatePage.tsx).
  location?: string
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
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
export interface MainLayoutProps {
  children: ReactNode
  backgroundImage: string
  title?: string
  subtitle?: string
  showGlassCard?: boolean
  variant?: 'light' | 'dark'
}