"use client"

import { AgeGroup } from "@repo/shared"
import { useChildData, useKindergartensBatch } from "@/lib/queries"
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <CurrentKindergartenSection currentKindergarten={child.current_kindergarten} />
      
      <ActiveExchangesSection 
        matchGroups={matchGroups} 
        currentChildId={child.id}
      />
      
      <WishlistSection 
        childId={child.id}
        wishlists={child.wishlists} 
        kindergartenMap={kindergartenMap}
      />
      
      <DirectMatchesSection matches={matches} />
      
      <PotentialMatchesSection potentials={potentials} />
    </div>
  )
}

