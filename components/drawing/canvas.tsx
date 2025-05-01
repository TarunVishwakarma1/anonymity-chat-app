"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useRef, useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Square, Circle, Pencil, Type, Eraser, Trash2, Download, Save, Undo, Redo } from "lucide-react"
import { io, type Socket } from "socket.io-client"
import { Card, CardContent } from "@/components/ui/card"
import DrawingSkeleton from "./drawing-skeleton"

type DrawingAction = {
  type: string
  x: number
  y: number
  color?: string
  size?: number
  text?: string
  shape?: string
  width?: number
  height?: number
}

type DrawingTool = "pencil" | "eraser" | "text" | "rectangle" | "circle"

interface CanvasProps {
  roomId: string | number
  userId: string | number
  readOnly?: boolean
}

function CanvasContent({ roomId, userId, readOnly = false }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [size, setSize] = useState(5)
  const [tool, setTool] = useState<DrawingTool>("pencil")
  const [text, setText] = useState("")
  const [history, setHistory] = useState<DrawingAction[]>([])
  const [redoStack, setRedoStack] = useState<DrawingAction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize canvas and socket connection
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.style.height = `${canvas.offsetHeight}px`

    // Get context
    const context = canvas.getContext("2d")
    if (!context) return

    context.scale(2, 2)
    context.lineCap = "round"
    context.strokeStyle = color
    context.lineWidth = size
    contextRef.current = context

    // Initialize Socket.IO connection
    const initSocket = async () => {
      try {
        await fetch("/api/socket")

        if (!socketRef.current) {
          const socket = io()
          socketRef.current = socket

          socket.emit("join-room", roomId.toString(), userId.toString())

          socket.on("draw-update", (drawingData: DrawingAction) => {
            if (!contextRef.current) return

            const { type, x, y, color, size, text, shape, width, height } = drawingData

            if (type === "start") {
              contextRef.current.beginPath()
              contextRef.current.moveTo(x, y)
            } else if (type === "draw") {
              contextRef.current.strokeStyle = color || "#000000"
              contextRef.current.lineWidth = size || 5
              contextRef.current.lineTo(x, y)
              contextRef.current.stroke()
            } else if (type === "end") {
              contextRef.current.closePath()
            } else if (type === "text") {
              if (!text) return
              contextRef.current.font = `${size || 16}px sans-serif`
              contextRef.current.fillStyle = color || "#000000"
              contextRef.current.fillText(text, x, y)
            } else if (type === "shape") {
              contextRef.current.strokeStyle = color || "#000000"
              contextRef.current.lineWidth = size || 5

              if (shape === "rectangle" && width && height) {
                contextRef.current.strokeRect(x, y, width, height)
              } else if (shape === "circle" && width) {
                contextRef.current.beginPath()
                contextRef.current.arc(x, y, width / 2, 0, 2 * Math.PI)
                contextRef.current.stroke()
              }
            } else if (type === "clear") {
              clearCanvas()
            }

            // Add to history
            setHistory((prev) => [...prev, drawingData])
          })

          // Load existing drawing
          await loadDrawing()
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Socket initialization error:", error)
        setIsLoading(false)
      }
    }

    initSocket()

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [roomId, userId])

  // Load existing drawing from the server
  const loadDrawing = async () => {
    try {
      const response = await fetch(`/api/drawings/${roomId}`)
      if (!response.ok) return

      const data = await response.json()
      if (!data || !data.drawing_data) return

      // Replay the drawing
      const actions = data.drawing_data
      if (Array.isArray(actions)) {
        setHistory(actions)
        replayDrawing(actions)
      }
    } catch (error) {
      console.error("Error loading drawing:", error)
    }
  }

  // Replay a series of drawing actions
  const replayDrawing = (actions: DrawingAction[]) => {
    if (!contextRef.current) return

    clearCanvas()

    actions.forEach((action) => {
      const { type, x, y, color, size, text, shape, width, height } = action

      if (type === "start") {
        contextRef.current!.beginPath()
        contextRef.current!.moveTo(x, y)
      } else if (type === "draw") {
        contextRef.current!.strokeStyle = color || "#000000"
        contextRef.current!.lineWidth = size || 5
        contextRef.current!.lineTo(x, y)
        contextRef.current!.stroke()
      } else if (type === "end") {
        contextRef.current!.closePath()
      } else if (type === "text") {
        if (!text) return
        contextRef.current!.font = `${size || 16}px sans-serif`
        contextRef.current!.fillStyle = color || "#000000"
        contextRef.current!.fillText(text, x, y)
      } else if (type === "shape") {
        contextRef.current!.strokeStyle = color || "#000000"
        contextRef.current!.lineWidth = size || 5

        if (shape === "rectangle" && width && height) {
          contextRef.current!.strokeRect(x, y, width, height)
        } else if (shape === "circle" && width) {
          contextRef.current!.beginPath()
          contextRef.current!.arc(x, y, width / 2, 0, 2 * Math.PI)
          contextRef.current!.stroke()
        }
      }
    })
  }

  // Save the drawing to the server
  const saveDrawing = async () => {
    try {
      await fetch(`/api/drawings/${roomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          drawingData: history,
        }),
      })
    } catch (error) {
      console.error("Error saving drawing:", error)
    }
  }

  // Clear the canvas
  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return

    contextRef.current.clearRect(0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2)

    // Emit clear event
    if (socketRef.current) {
      socketRef.current.emit("draw", roomId, { type: "clear" })
    }

    // Clear history
    setHistory([])
    setRedoStack([])
  }

  // Handle mouse down event
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return

    const canvas = canvasRef.current
    if (!canvas || !contextRef.current) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "text") {
      if (!text) return

      contextRef.current.font = `${size}px sans-serif`
      contextRef.current.fillStyle = color
      contextRef.current.fillText(text, x, y)

      const action = { type: "text", x, y, color, size, text }
      setHistory((prev) => [...prev, action])
      setRedoStack([])

      if (socketRef.current) {
        socketRef.current.emit("draw", roomId, action)
      }

      return
    }

    setIsDrawing(true)
    contextRef.current.beginPath()
    contextRef.current.moveTo(x, y)

    const action = { type: "start", x, y }
    setHistory((prev) => [...prev, action])
    setRedoStack([])

    if (socketRef.current) {
      socketRef.current.emit("draw", roomId, action)
    }
  }

  // Handle mouse move event
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !isDrawing) return

    const canvas = canvasRef.current
    if (!canvas || !contextRef.current) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "pencil" || tool === "eraser") {
      contextRef.current.lineTo(x, y)
      contextRef.current.stroke()

      contextRef.current.strokeStyle = tool === "eraser" ? "#FFFFFF" : color
      contextRef.current.lineWidth = size

      const action = {
        type: "draw",
        x,
        y,
        color: tool === "eraser" ? "#FFFFFF" : color,
        size,
      }

      setHistory((prev) => [...prev, action])

      if (socketRef.current) {
        socketRef.current.emit("draw", roomId, action)
      }
    }
  }

  // Handle mouse up event
  const stopDrawing = () => {
    if (readOnly || !isDrawing) return

    contextRef.current?.closePath()
    setIsDrawing(false)

    const action = { type: "end" }
    setHistory((prev) => [...prev, action])

    if (socketRef.current) {
      socketRef.current.emit("draw", roomId, action)
    }

    // Save drawing after each stroke
    saveDrawing()
  }

  // Handle undo
  const handleUndo = () => {
    if (history.length === 0) return

    // Find the last complete action (from start to end)
    let endIndex = history.length - 1
    let startIndex = endIndex

    // If the last action is 'end', find its corresponding 'start'
    if (history[endIndex].type === "end") {
      endIndex--
      while (endIndex >= 0 && history[endIndex].type !== "start") {
        endIndex--
      }
      startIndex = endIndex
    } else if (history[endIndex].type === "text" || history[endIndex].type === "shape") {
      // For text or shape, just remove the single action
      startIndex = endIndex
    } else {
      // For other actions, find the last complete stroke
      while (startIndex >= 0 && history[startIndex].type !== "start") {
        startIndex--
      }
    }

    if (startIndex < 0) return

    // Remove the actions from history and add to redo stack
    const actionsToRemove = history.slice(startIndex)
    const newHistory = history.slice(0, startIndex)

    setHistory(newHistory)
    setRedoStack((prev) => [...prev, ...actionsToRemove])

    // Replay the remaining history
    replayDrawing(newHistory)
  }

  // Handle redo
  const handleRedo = () => {
    if (redoStack.length === 0) return

    // Find the next complete action to redo
    let actionCount = 1
    const firstAction = redoStack[0]

    if (firstAction.type === "start") {
      // For a stroke, include all actions until 'end'
      actionCount = 1
      while (actionCount < redoStack.length && redoStack[actionCount].type !== "end") {
        actionCount++
      }
      if (actionCount < redoStack.length) {
        actionCount++ // Include the 'end' action
      }
    }

    // Move actions from redo stack to history
    const actionsToRedo = redoStack.slice(0, actionCount)
    const newRedoStack = redoStack.slice(actionCount)

    setHistory((prev) => [...prev, ...actionsToRedo])
    setRedoStack(newRedoStack)

    // Replay the updated history
    replayDrawing([...history, ...actionsToRedo])
  }

  // Download the canvas as an image
  const downloadCanvas = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `drawing-${roomId}.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading canvas...</p>
      </div>
    )
  }

  return (
    <>
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="relative h-full">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-full border border-gray-200 rounded-md bg-white cursor-crosshair"
            />
          </div>
        </CardContent>
      </Card>

      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 mt-4 p-2 bg-gray-100 rounded-md">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTool("pencil")}
              className={tool === "pencil" ? "bg-primary text-primary-foreground" : ""}
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTool("eraser")}
              className={tool === "eraser" ? "bg-primary text-primary-foreground" : ""}
            >
              <Eraser size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTool("text")}
              className={tool === "text" ? "bg-primary text-primary-foreground" : ""}
            >
              <Type size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTool("rectangle")}
              className={tool === "rectangle" ? "bg-primary text-primary-foreground" : ""}
            >
              <Square size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTool("circle")}
              className={tool === "circle" ? "bg-primary text-primary-foreground" : ""}
            >
              <Circle size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 p-0 border border-gray-300 rounded-md cursor-pointer"
            />
            <div className="w-24">
              <Slider value={[size]} min={1} max={20} step={1} onValueChange={(value) => setSize(value[0])} />
            </div>
          </div>

          {tool === "text" && (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Enter text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-40"
              />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="icon" onClick={handleUndo} disabled={history.length === 0}>
              <Undo size={16} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRedo} disabled={redoStack.length === 0}>
              <Redo size={16} />
            </Button>
            <Button variant="outline" size="icon" onClick={clearCanvas}>
              <Trash2 size={16} />
            </Button>
            <Button variant="outline" size="icon" onClick={saveDrawing}>
              <Save size={16} />
            </Button>
            <Button variant="outline" size="icon" onClick={downloadCanvas}>
              <Download size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default function DrawingCanvas(props: CanvasProps) {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<DrawingSkeleton />}>
        <CanvasContent {...props} />
      </Suspense>
    </div>
  )
}
