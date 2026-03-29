export type UserRole = 'ROLE_USER' | 'ROLE_FAMILY' | 'ROLE_ADMIN'

export interface UserStatusDTO {
  hasFamily: boolean
  hasChildren: boolean
  isRegistrationComplete: boolean
}

export interface UserProfileDTO {
  email: string
  roles: UserRole[]
  family: FamilyResponseDTO | null
}

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

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface InterestResponseDTO {
  id: number
  name: string
  type: string
  icon: string
}

export interface ChildSummaryDTO {
  interests: never[]
  id: number
  gender: 'BOY' | 'GIRL' | null
  age: number
  lifeStage: 'PREGNANCY' | 'BORN'
}

export interface FamilyResponseDTO {
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
}

export interface FamilyRequestDTO {
  representativeName: string
  familyName: string
  description: string
  profilePictureUrl: string
  neighborhoodId: number
}

export interface ChildRequestDTO {
  age: string | number | readonly string[] | undefined
  birthDate: string
  lifeStage: 'PREGNANCY' | 'BORN'
  gender: 'BOY' | 'GIRL' | null | 'OTHER'
  interestIds: number[]
}

export interface ChildResponseDTO {
  lifeStage: any
  id: number
  gender: 'BOY' | 'GIRL' | null | 'OTHER'
  birthDate: string | null
  age: number
  interests: InterestResponseDTO[]
  familyId: number
}

export interface NeighborhoodResponseDTO {
  id: number
  name: string
  streetName: string
  postalCode: string
  cityId: number
  cityName: string
}

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

export interface Match {
  id: number
  childA: ChildResponseDTO
  childB: ChildResponseDTO
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
