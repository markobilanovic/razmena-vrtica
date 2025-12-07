import {
  useQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  getUserProfileApi,
  checkMatchesApi,
  getMatchGroupsForChildApi,
  getPotentialMatchesApi,
  loginApi,
  registerApi,
  createMatchApi,
  getMatchesByAgeGroupApi,
  validateMatchApi,
} from "./api"
import { AgeGroup } from "@repo/shared"

// ==================== QUERY KEYS ====================
// Centralized query keys for better cache management
export const queryKeys = {
  user: ["user"] as const,
  userProfile: ["user", "profile"] as const,
  childMatches: (childId: string) => ["child", childId, "matches"] as const,
  childMatchGroups: (childId: string) =>
    ["child", childId, "matchGroups"] as const,
  potentialMatches: (ageGroup?: AgeGroup) =>
    ["potentialMatches", ageGroup] as const,
  matchesByAgeGroup: (ageGroup: AgeGroup) =>
    ["matches", "ageGroup", ageGroup] as const,
  validateMatch: (matchId: string) => ["match", matchId, "validate"] as const,
}

// ==================== AUTH QUERIES ====================

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.access_token)
      }
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: ({
      email,
      password,
      fullName,
    }: {
      email: string
      password: string
      fullName: string
    }) => registerApi(email, password, fullName),
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.access_token)
      }
    },
  })
}

// ==================== USER QUERIES ====================

export function useUserProfile() {
  return useSuspenseQuery({
    queryKey: queryKeys.userProfile,
    queryFn: getUserProfileApi,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401
  })
}

// ==================== MATCHING QUERIES ====================

export function useChildMatches(childId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.childMatches(childId),
    queryFn: () => checkMatchesApi(childId),
  })
}

export function useChildMatchGroups(childId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.childMatchGroups(childId),
    queryFn: () => getMatchGroupsForChildApi(childId),
  })
}

export function usePotentialMatches(ageGroup?: AgeGroup) {
  return useSuspenseQuery({
    queryKey: queryKeys.potentialMatches(ageGroup),
    queryFn: () => getPotentialMatchesApi(ageGroup),
  })
}

export function useMatchesByAgeGroup(ageGroup: AgeGroup) {
  return useSuspenseQuery({
    queryKey: queryKeys.matchesByAgeGroup(ageGroup),
    queryFn: () => getMatchesByAgeGroupApi(ageGroup),
  })
}

export function useValidateMatch(matchId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.validateMatch(matchId),
    queryFn: () => validateMatchApi(matchId),
  })
}

// ==================== MATCHING MUTATIONS ====================

export function useCreateMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (childIds: string[]) => createMatchApi(childIds),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile })

      // Invalidate match groups for all children involved
      variables.forEach((childId) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.childMatchGroups(childId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.childMatches(childId),
        })
      })

      // Invalidate potential matches
      queryClient.invalidateQueries({ queryKey: ["potentialMatches"] })
    },
  })
}

// ==================== COMPOSITE HOOKS ====================
// Hooks that combine multiple queries for convenience

export function useChildData(childId: string, ageGroup?: AgeGroup) {
  const matches = useChildMatches(childId)
  const matchGroups = useChildMatchGroups(childId)
  const potentials = usePotentialMatches(ageGroup)

  return {
    matches: matches.data ?? [],
    matchGroups: matchGroups.data ?? [],
    potentials: potentials.data ?? [],
  }
}

