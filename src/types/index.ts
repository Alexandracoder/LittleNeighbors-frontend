import { ReactNode } from 'react'
import './i18n'

export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}


export interface RefreshRequest {
  refreshToken: string
}

export interface FamilyRequestDTO {
  status: 'PREGNANT' | 'NEW_PARENTS' | 'ESTABLISHED_FAMILY' | 'SURPRISE'
  familyInterests: string[]
  representativeName: string
  familyName: string
  description: string
  profilePictureUrl: string
  neighborhoodId: number
}

export interface ChildSummaryDTO {
  nickname: string
  id: number
  gender: string
  age: number
  lifeStage: string
  interests?: InterestResponseDTO[]
}

export interface FamilyResponseDTO {
  status: 'PREGNANT' | 'NEW_PARENTS' | 'ESTABLISHED_FAMILY' | 'SURPRISE'
  neighborhood: any
  familyInterests: string[]
  id: number
  representativeName: string
  familyName: string
  description: string
  profilePictureUrl: string
  neighborhoodId: number
  streetName: string
  postalCode: string
  cityName: string
  children: ChildSummaryDTO[]
  displayName: string
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

export interface InterestResponseDTO {
  id: number
  name: string
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
export interface InterestResponseDTO {
  id: number
  name: string
  type: string
  icon: string
}

export interface NeighborhoodResponseDTO {
  id: number
  name: string
  streetName: string
  postalCode: string
  cityId: number
  cityName: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export type UserRole = 'ROLE_USER' | 'ROLE_FAMILY' | 'ROLE_ADMIN'

export interface DecodedToken {
  id: number
  sub: string
  roles: UserRole[]
  exp: number
}

export interface User {
  id: string
  family: null
  email: string
  roles: UserRole[]
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password?: string
}

export interface UserStatusDTO {
  roles: User | null
  hasFamily: boolean
  hasChildren: boolean
  isRegistrationComplete: boolean
}

export interface UserProfileDTO {
  name: any
  id: number | string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  verificationStatus: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'
  family: FamilyResponseDTO | null
}

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

export interface Playdate {
  date: any
  time: ReactNode
  neighborName: ReactNode
  id: number
  title: string
  startTime: string
  description?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  matchId: number
  createdAt: string
  updatedAt?: string
}

export interface PlaydateRequest {
  title: string
  startTime: string
  description?: string
  matchId: number
}
