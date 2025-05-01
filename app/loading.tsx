import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-t-transparent border-purple-300 animate-spin"></div>
          <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white animate-pulse">Loading Sketch Chat...</h2>
      </div>
    </div>
  )
}
