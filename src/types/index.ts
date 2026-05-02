export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface FamilyRequestDTO {
  status: "PREGNANT" | "NEW_PARENTS" | "ESTABLISHED_FAMILY" | "SURPRISE"
  familyInterests: string[]
  representativeName: string
  familyName: string
  description: string
  profilePictureUrl: string
  neighborhoodId: number
}

export interface ChildSummaryDTO {
  id: number
  gender: string
  age: number
  lifeStage: string
  interests?: InterestResponseDTO[]
}

export interface FamilyResponseDTO {
  status: "PREGNANT" | "NEW_PARENTS" | "ESTABLISHED_FAMILY" | "SURPRISE"
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
  birthDate: string
  lifeStage: string
  gender: 'BOY' | 'GIRL'
  interestIds: number[]
  age: number
}

export interface ChildResponseDTO {
  lifeStage: string
  id: number
  gender: 'BOY' | 'GIRL'
  birthDate: string
  age: number
  interests: InterestResponseDTO[]
  familyId: number
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
  hasFamily: boolean
  hasChildren: boolean
  isRegistrationComplete: boolean
}

export interface UserProfileDTO {
  id: any
  email: string
  roles: string[]
  family: FamilyResponseDTO | null
}

export interface MessageDTO {
  id: number
  matchId: number
  senderId: number
  senderFirstName: string
  content: string
  timestamp: string
}

export interface MessageService {
  getHistory: (matchId: string | number, token: string) => Promise<MessageDTO[]>
  sendMessage: (
    matchId: string | number,
    senderId: number,
    content: string,
    token: string,
  ) => Promise<MessageDTO>
}