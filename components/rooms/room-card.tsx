import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RoomCardProps {
  id: number
  name: string
  participantCount: number
  createdBy: string
  createdAt: string
}

export default function RoomCard({ id, name, participantCount, createdBy, createdAt }: RoomCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          <span>
            {participantCount} participant{participantCount !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Created by {createdBy} {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/rooms/${id}`} className="w-full">
          <Button className="w-full">Join Room</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
