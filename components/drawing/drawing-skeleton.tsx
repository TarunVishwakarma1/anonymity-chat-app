import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DrawingSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <Skeleton className="w-full h-full rounded-md" />
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-2 mt-4 p-2 bg-gray-100 rounded-md">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  )
}
