import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChatSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg">Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div className={`flex ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"} items-start gap-2 max-w-[80%]`}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className={`h-16 w-48 rounded-lg`} />
                <div className={`flex mt-1 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="p-3 border-t">
        <div className="flex w-full gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-16" />
        </div>
      </CardFooter>
    </Card>
  )
}
