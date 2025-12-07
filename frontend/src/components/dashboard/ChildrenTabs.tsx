import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChildDataSkeleton } from "@/components/LoadingFallback"
import { ChildTabContent } from "./ChildTabContent"

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

interface ChildrenTabsProps {
  children: Child[]
}

export const ChildrenTabs = ({ children }: ChildrenTabsProps) => {
  if (!children || children.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-300">
        <div className="text-6xl mb-4 opacity-50">🧸</div>
        <h3 className="text-xl font-bold mb-2">Nema registrovane dece</h3>
        <p className="text-color-text-muted max-w-md mx-auto mb-6">
          Dodajte podatke o vašoj deci da biste započeli pretragu za razmenu
          vrtića.
        </p>
        <button className="btn-primary">
          <span>Dodaj prvo dete</span>
        </button>
      </div>
    )
  }

  return (
    <Tabs defaultValue={children[0].id} className="w-full">
      <TabsList className="mb-8 w-full flex flex-wrap gap-2 bg-blue-50/50 p-1.5 rounded-xl border border-blue-100">
        {children.map((child) => (
          <TabsTrigger
            key={child.id}
            value={child.id}
            className="flex-1 min-w-[120px] rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all py-2.5 font-medium"
          >
            {child.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {children.map((child) => (
        <TabsContent
          key={child.id}
          value={child.id}
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <Suspense fallback={<ChildDataSkeleton />}>
            <ChildTabContent child={child} />
          </Suspense>
        </TabsContent>
      ))}
    </Tabs>
  )
}

