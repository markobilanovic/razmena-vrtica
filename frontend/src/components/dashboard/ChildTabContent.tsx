"use client"

import { AgeGroup } from "@repo/shared"
import { useChildData, useKindergartensBatch, queryKeys } from "@/lib/queries"
import { useQueryClient } from "@tanstack/react-query"
import {
  CurrentKindergartenSection,
  ActiveExchangesSection,
  WishlistSection,
  DirectMatchesSection,
  PotentialMatchesSection,
} from "./child-sections"

type Child = {
  id: string
  name: string
  group?: string | null
  current_kindergarten?: {
    id: string
    name: string
    address: string
  } | null
  wishlists?: Array<{
    target_kindergarten_id: string
  }> | null
  parent?: {
    full_name: string
    email: string
  } | null
}

interface ChildTabContentProps {
  child: Child
}

export const ChildTabContent = ({ child }: ChildTabContentProps) => {
  const queryClient = useQueryClient()
  const { matches, matchGroups, potentials } = useChildData(
    child.id,
    child.group as AgeGroup | undefined,
  )

  // Extract unique kindergarten IDs from wishlists
  const wishlistKindergartenIds = (child.wishlists || [])
    .map((wish) => wish.target_kindergarten_id)
    .filter(Boolean)

  // Fetch kindergarten details only if there are wishlists
  const { data: kindergartens = [] } = useKindergartensBatch(
    wishlistKindergartenIds,
  )

  // Create a map for quick lookup
  const kindergartenMap = new Map(kindergartens.map((k) => [k.id, k]))

  const handleMatchHidden = (matchGroupId: string) => {
    // Invalidate match groups query to refetch data without the hidden match
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.childMatchGroups(child.id) 
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <CurrentKindergartenSection currentKindergarten={child.current_kindergarten} />
      
      <WishlistSection 
        childId={child.id}
        wishlists={child.wishlists} 
        kindergartenMap={kindergartenMap}
      />

      <ActiveExchangesSection 
        matchGroups={matchGroups} 
        currentChildId={child.id}
        onMatchHidden={handleMatchHidden}
      />
      
      {/* <DirectMatchesSection matches={matches} />
      
      <PotentialMatchesSection potentials={potentials} /> */}
    </div>
  )
}

