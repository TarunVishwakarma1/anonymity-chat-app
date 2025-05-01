"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Square, Circle, Pencil, Eraser, Undo, Redo, Download, Trash2, Move, Type, ImageIcon } from "lucide-react"

interface DrawingCanvasProps {
  roomId: number
  userId: number
  username: string
  onDrawingChange?: (action: string, data: any) => void
  initialDrawingData?: any
}

type Tool = "pencil" | "eraser" | "rectangle" | "circle" | "text" | "select" | "image"
type DrawingAction = {
  tool: Tool
  points?: { x: number; y: number }[]
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  color?: string
  width?: number
  text?: string
  textPosition?: { x: number; y: number }
  imageData?: string
  imagePosition?: { x: number; y: number }
}

export function DrawingCanvas({ roomId, userId, username, onDrawingChange, initialDrawingData }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>("pencil")
  const [color, setColor] = useState("#000000")
  const [lineWidth, setLineWidth] = useState(5)
  const [actions, setActions] = useState<DrawingAction[]>([])
  const [redoStack, setRedoStack] = useState<DrawingAction[]>([])
  const [currentAction, setCurrentAction] = useState<DrawingAction | null>(null)
  const [textInput, setTextInput] = useState("")
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)

  // Load initial drawing data if provided
  useEffect(() => {
    if (initialDrawingData && Array.isArray(initialDrawingData)) {
      setActions(initialDrawingData)
      redrawCanvas()
    }
  }, [initialDrawingData])

  // Redraw canvas whenever actions change
  useEffect(() => {
    redrawCanvas()
  }, [actions])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Get position based on event type
    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    setIsDrawing(true)

    if (tool === "text") {
      setTextPosition({ x, y })
      return
    }

    const newAction: DrawingAction = {
      tool,
      color,
      width: lineWidth,
    }

    if (tool === "pencil" || tool === "eraser") {
      newAction.points = [{ x, y }]
    } else if (tool === "rectangle" || tool === "circle") {
      newAction.start = { x, y }
      newAction.end = { x, y }
    }

    setCurrentAction(newAction)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !currentAction) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    // Get position based on event type
    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
      e.preventDefault() // Prevent scrolling on touch devices
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    if (tool === "pencil" || tool === "eraser") {
      if (!currentAction.points) return

      currentAction.points.push({ x, y })

      // Clear canvas and redraw all actions
      redrawCanvas()

      // Draw the current stroke
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : currentAction.color || "#000000"
      ctx.lineWidth = currentAction.width || 5

      ctx.beginPath()
      ctx.moveTo(currentAction.points[0].x, currentAction.points[0].y)

      for (let i = 1; i < currentAction.points.length; i++) {
        ctx.lineTo(currentAction.points[i].x, currentAction.points[i].y)
      }

      ctx.stroke()
    } else if ((tool === "rectangle" || tool === "circle") && currentAction.start) {
      currentAction.end = { x, y }

      // Clear canvas and redraw all actions
      redrawCanvas()

      // Draw the current shape
      ctx.strokeStyle = currentAction.color || "#000000"
      ctx.lineWidth = currentAction.width || 5

      if (tool === "rectangle") {
        ctx.beginPath()
        ctx.rect(
          currentAction.start.x,
          currentAction.start.y,
          currentAction.end.x - currentAction.start.x,
          currentAction.end.y - currentAction.start.y,
        )
        ctx.stroke()
      } else if (tool === "circle") {
        const radiusX = Math.abs(currentAction.end.x - currentAction.start.x) / 2
        const radiusY = Math.abs(currentAction.end.y - currentAction.start.y) / 2
        const centerX = Math.min(currentAction.start.x, currentAction.end.x) + radiusX
        const centerY = Math.min(currentAction.start.y, currentAction.end.y) + radiusY

        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
        ctx.stroke()
      }
    }
  }

  const endDrawing = () => {
    if (!isDrawing || !currentAction) return
    setIsDrawing(false)

    if (tool === "text") return

    // Add the completed action to the actions array
    setActions([...actions, currentAction])
    setRedoStack([])
    setCurrentAction(null)

    // Notify parent component about the drawing change
    if (onDrawingChange) {
      onDrawingChange("draw", [...actions, currentAction])
    }
  }

  const handleTextSubmit = () => {
    if (!textInput || !textPosition) return

    const newAction: DrawingAction = {
      tool: "text",
      text: textInput,
      textPosition,
      color,
    }

    setActions([...actions, newAction])
    setRedoStack([])
    setTextInput("")
    setTextPosition(null)

    // Notify parent component about the drawing change
    if (onDrawingChange) {
      onDrawingChange("draw", [...actions, newAction])
    }

    redrawCanvas()
  }

  const handleUndo = () => {
    if (actions.length === 0) return

    const newActions = [...actions]
    const removedAction = newActions.pop()

    if (removedAction) {
      setActions(newActions)
      setRedoStack([...redoStack, removedAction])

      // Notify parent component about the undo action
      if (onDrawingChange) {
        onDrawingChange("undo", newActions)
      }
    }
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return

    const newRedoStack = [...redoStack]
    const actionToRedo = newRedoStack.pop()

    if (actionToRedo) {
      setActions([...actions, actionToRedo])
      setRedoStack(newRedoStack)

      // Notify parent component about the redo action
      if (onDrawingChange) {
        onDrawingChange("redo", [...actions, actionToRedo])
      }
    }
  }

  const handleClear = () => {
    if (actions.length === 0) return

    setActions([])
    setRedoStack([])

    // Notify parent component about the clear action
    if (onDrawingChange) {
      onDrawingChange("clear", [])
    }

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `sketchat-drawing-${roomId}-${new Date().toISOString()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Redraw all actions
    actions.forEach((action) => {
      if (action.tool === "pencil" || action.tool === "eraser") {
        if (!action.points || action.points.length < 2) return

        ctx.lineJoin = "round"
        ctx.lineCap = "round"
        ctx.strokeStyle = action.tool === "eraser" ? "#FFFFFF" : action.color || "#000000"
        ctx.lineWidth = action.width || 5

        ctx.beginPath()
        ctx.moveTo(action.points[0].x, action.points[0].y)

        for (let i = 1; i < action.points.length; i++) {
          ctx.lineTo(action.points[i].x, action.points[i].y)
        }

        ctx.stroke()
      } else if (action.tool === "rectangle" && action.start && action.end) {
        ctx.strokeStyle = action.color || "#000000"
        ctx.lineWidth = action.width || 5

        ctx.beginPath()
        ctx.rect(action.start.x, action.start.y, action.end.x - action.start.x, action.end.y - action.start.y)
        ctx.stroke()
      } else if (action.tool === "circle" && action.start && action.end) {
        ctx.strokeStyle = action.color || "#000000"
        ctx.lineWidth = action.width || 5

        const radiusX = Math.abs(action.end.x - action.start.x) / 2
        const radiusY = Math.abs(action.end.y - action.start.y) / 2
        const centerX = Math.min(action.start.x, action.end.x) + radiusX
        const centerY = Math.min(action.start.y, action.end.y) + radiusY

        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (action.tool === "text" && action.text && action.textPosition) {
        ctx.font = "16px Arial"
        ctx.fillStyle = action.color || "#000000"
        ctx.fillText(action.text, action.textPosition.x, action.textPosition.y)
      } else if (action.tool === "image" && action.imageData && action.imagePosition) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = action.imageData
        img.onload = () => {
          ctx.drawImage(img, action.imagePosition!.x, action.imagePosition!.y)
        }
      }
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result && canvasRef.current) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = event.target.result as string
        img.onload = () => {
          const canvas = canvasRef.current
          if (!canvas) return

          const newAction: DrawingAction = {
            tool: "image",
            imageData: event.target?.result as string,
            imagePosition: { x: 50, y: 50 },
          }

          setActions([...actions, newAction])
          setRedoStack([])

          // Notify parent component about the drawing change
          if (onDrawingChange) {
            onDrawingChange("draw", [...actions, newAction])
          }

          redrawCanvas()
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Set canvas dimensions on mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-2 rounded-t-lg shadow-md flex flex-wrap items-center gap-2 border-b">
        <div className="flex gap-1">
          <Button
            size="icon"
            variant={tool === "pencil" ? "default" : "outline"}
            onClick={() => setTool("pencil")}
            title="Pencil"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={tool === "eraser" ? "default" : "outline"}
            onClick={() => setTool("eraser")}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={tool === "rectangle" ? "default" : "outline"}
            onClick={() => setTool("rectangle")}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={tool === "circle" ? "default" : "outline"}
            onClick={() => setTool("circle")}
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={tool === "text" ? "default" : "outline"}
            onClick={() => setTool("text")}
            title="Text"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={tool === "select" ? "default" : "outline"}
            onClick={() => setTool("select")}
            title="Select"
          >
            <Move className="h-4 w-4" />
          </Button>
          <label htmlFor="image-upload">
            <Button
              size="icon"
              variant={tool === "image" ? "default" : "outline"}
              onClick={() => setTool("image")}
              title="Upload Image"
              asChild
            >
              <div>
                <ImageIcon className="h-4 w-4" />
              </div>
            </Button>
          </label>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        <div className="h-6 border-r mx-1"></div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
            title="Color"
          />
          <div className="w-24 flex items-center">
            <Slider value={[lineWidth]} min={1} max={20} step={1} onValueChange={(value) => setLineWidth(value[0])} />
          </div>
        </div>

        <div className="h-6 border-r mx-1"></div>

        <div className="flex gap-1">
          <Button size="icon" variant="outline" onClick={handleUndo} disabled={actions.length === 0} title="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={handleRedo} disabled={redoStack.length === 0} title="Redo">
            <Redo className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={handleClear} disabled={actions.length === 0} title="Clear">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleDownload}
            disabled={actions.length === 0}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex-grow bg-white rounded-b-lg">
        <canvas
          ref={canvasRef}
          className="w-full h-full border rounded-b-lg drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />

        {textPosition && (
          <div
            className="absolute bg-white p-2 rounded shadow-lg"
            style={{ left: textPosition.x, top: textPosition.y }}
          >
            <div className="flex">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                placeholder="Enter text..."
                autoFocus
              />
              <Button size="sm" onClick={handleTextSubmit}>
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setTextPosition(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
