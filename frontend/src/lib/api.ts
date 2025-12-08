import {
  LoginRequest,
  LoginResponse,
  LoginResponseSchema,
  RegisterRequest,
  RegisterResponse,
  RegisterResponseSchema,
  UserProfile,
  UserProfileSchema,
  CheckMatchesRequest,
  CheckMatchesResponse,
  CheckMatchesResponseSchema,
  CreateMatchRequest,
  CreateMatchResponse,
  CreateMatchResponseSchema,
  ValidateMatchResponse,
  ValidateMatchResponseSchema,
  AgeGroup,
  MatchGroup,
  MatchGroupSchema,
  MatchGroupWithDetails,
  MatchGroupWithDetailsSchema,
  HideMatchRequest,
  HideMatchResponse,
  HideMatchResponseSchema,
} from "@repo/shared"
import { z } from "zod"

// Define Kindergarten schema and type
const KindergartenSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
})

export type Kindergarten = z.infer<typeof KindergartenSchema>

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  schema?: z.ZodSchema<T>,
): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData,
      )
    }

    const data = await response.json()

    // Validate response with Zod schema if provided
    if (schema) {
      try {
        return schema.parse(data)
      } catch (error) {
        console.error("API response validation error:", error)
        throw new ApiError("Invalid response format from server", 500, error)
      }
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0,
    )
  }
}

// ==================== AUTH API ====================

export async function loginApi(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return fetchApi<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password } as LoginRequest),
    },
    LoginResponseSchema,
  )
}

export async function registerApi(
  email: string,
  password: string,
  fullName: string,
): Promise<RegisterResponse> {
  return fetchApi<RegisterResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password, fullName } as RegisterRequest),
    },
    RegisterResponseSchema,
  )
}

// ==================== USER API ====================

export async function getUserProfileApi(): Promise<UserProfile> {
  return fetchApi<UserProfile>("/users/me", {}, UserProfileSchema)
}

// ==================== MATCHING API ====================

export async function getPotentialMatchesApi(
  ageGroup?: AgeGroup,
): Promise<any> {
  const query = ageGroup ? `?ageGroup=${ageGroup}` : ""
  return fetchApi(`/matching/potential${query}`)
}

export async function checkMatchesApi(
  childId: string,
): Promise<CheckMatchesResponse> {
  return fetchApi<CheckMatchesResponse>(
    "/matching/check-matches",
    {
      method: "POST",
      body: JSON.stringify({ childId } as CheckMatchesRequest),
    },
    CheckMatchesResponseSchema,
  )
}

export async function createMatchApi(
  childIds: string[],
): Promise<CreateMatchResponse> {
  return fetchApi<CreateMatchResponse>(
    "/matching/create",
    {
      method: "POST",
      body: JSON.stringify({ childIds } as CreateMatchRequest),
    },
    CreateMatchResponseSchema,
  )
}

export async function getMatchesByAgeGroupApi(
  ageGroup: AgeGroup,
): Promise<MatchGroup[]> {
  return fetchApi<MatchGroup[]>(
    `/matching/by-age-group/${ageGroup}`,
    {},
    z.array(MatchGroupSchema),
  )
}

export async function validateMatchApi(
  matchId: string,
): Promise<ValidateMatchResponse> {
  return fetchApi<ValidateMatchResponse>(
    `/matching/validate/${matchId}`,
    {},
    ValidateMatchResponseSchema,
  )
}

export async function getMatchGroupsForChildApi(
  childId: string,
): Promise<MatchGroupWithDetails[]> {
  return fetchApi<MatchGroupWithDetails[]>(
    `/matching/child/${childId}/groups`,
    {},
    z.array(MatchGroupWithDetailsSchema),
  )
}

export async function hideMatchApi(
  matchGroupId: string,
): Promise<HideMatchResponse> {
  return fetchApi<HideMatchResponse>(
    `/matching/${matchGroupId}/hide`,
    {
      method: "POST",
      body: JSON.stringify({ matchGroupId } as HideMatchRequest),
    },
    HideMatchResponseSchema,
  )
}

export async function unhideMatchApi(
  matchGroupId: string,
): Promise<HideMatchResponse> {
  return fetchApi<HideMatchResponse>(
    `/matching/${matchGroupId}/hide`,
    {
      method: "DELETE",
    },
    HideMatchResponseSchema,
  )
}

// ==================== KINDERGARTEN API ====================

export async function getKindergartenByIdApi(
  id: string,
): Promise<Kindergarten> {
  return fetchApi<Kindergarten>(`/kindergartens/${id}`, {}, KindergartenSchema)
}

export async function getKindergartensByIdsApi(
  ids: string[],
): Promise<Kindergarten[]> {
  if (ids.length === 0) return []
  const query = ids.map((id) => `ids=${id}`).join("&")
  return fetchApi<Kindergarten[]>(
    `/kindergartens/batch?${query}`,
    {},
    z.array(KindergartenSchema),
  )
}

export async function getAllKindergartensApi(): Promise<Kindergarten[]> {
  return fetchApi<Kindergarten[]>(
    `/kindergartens`,
    {},
    z.array(KindergartenSchema),
  )
}

// ==================== CHILD API ====================

export interface CreateChildRequest {
  name: string
  birth_date?: string
  gender?: "MALE" | "FEMALE"
  group: string // AgeGroup enum value
  current_kindergarten_id: string
}

export async function createChildApi(data: CreateChildRequest): Promise<any> {
  return fetchApi("/children", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function deleteChildApi(
  childId: string,
): Promise<{ success: boolean; message: string }> {
  return fetchApi(`/children/${childId}`, {
    method: "DELETE",
  })
}

// ==================== WISHLIST API ====================

export interface CreateWishlistRequest {
  child_id: string
  target_kindergarten_id: string
}

export interface WishlistResponse {
  id: string
  child_id: string
  target_kindergarten_id: string
  created_at: string
}

export async function createWishlistApi(
  data: CreateWishlistRequest,
): Promise<WishlistResponse> {
  return fetchApi("/wishlists", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function deleteWishlistApi(
  id: string,
): Promise<{ success: boolean }> {
  return fetchApi(`/wishlists/${id}`, {
    method: "DELETE",
  })
}
