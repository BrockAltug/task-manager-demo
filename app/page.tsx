"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  
  Plus,
  Calendar,
  Clock,
  Trash2,
  Filter,
  Search,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  completed: boolean
  dueDate?: string
  createdAt: string
  completedAt?: string
}

interface TaskFormData {
  title: string
  description: string
  priority: Task["priority"]
  dueDate?: string
}

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "overdue" | "urgent">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  })

  useEffect(() => {
    const savedTasks = localStorage.getItem("glassmorphism-tasks-v3")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("glassmorphism-tasks-v3", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement("div")
      const types = ["particle-blue", "particle-pink", "particle-purple"]
      const type = types[Math.floor(Math.random() * types.length)]

      particle.className = `particle ${type}`
      particle.style.left = Math.random() * 100 + "%"
      particle.style.width = Math.random() * 8 + 4 + "px"
      particle.style.height = particle.style.width
      particle.style.animationDuration = Math.random() * 10 + 10 + "s"
      particle.style.animationDelay = Math.random() * 5 + "s"

      const container = document.querySelector(".particle-container")
      if (container) {
        container.appendChild(particle)

        // Remove particle after animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle)
          }
        }, 20000)
      }
    }

    // Create initial particles
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createParticle(), i * 1000)
    }

    // Continuously create particles
    const interval = setInterval(createParticle, 2000)

    return () => clearInterval(interval)
  }, [])

  const sortedAndFilteredTasks = useMemo(() => {
    const now = new Date()
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const filtered = tasks.filter((task) => {
      const matchesFilter = (() => {
        switch (filter) {
          case "active":
            return !task.completed
          case "completed":
            return task.completed
          case "overdue":
            return !task.completed && task.dueDate && new Date(task.dueDate) < now
          case "urgent":
            return (
              !task.completed &&
              task.dueDate &&
              new Date(task.dueDate) <= twoDaysFromNow &&
              new Date(task.dueDate) >= now
            )
          default:
            return true
        }
      })()

      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesFilter && matchesSearch
    })

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]

      if (priorityDiff !== 0) return priorityDiff

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate && !b.dueDate) return -1
      if (!a.dueDate && b.dueDate) return 1

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [tasks, filter, searchQuery])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    })
    setEditingTask(null)
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (editingTask) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id ? { ...task, ...formData, dueDate: formData.dueDate || undefined } : task,
        ),
      )
    } else {
      const task: Task = {
        id: Date.now().toString(),
        ...formData,
        dueDate: formData.dueDate || undefined,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      setTasks((prev) => [task, ...prev])
    }

    resetForm()
    setIsDialogOpen(false)
    setIsLoading(false)
  }

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const getPriorityConfig = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return {
          color: "bg-red-100/80 text-red-800 border-red-300/60 hover:bg-red-200/80",
          icon: AlertCircle,
          label: "Urgent",
        }
      case "high":
        return {
          color: "bg-orange-100/80 text-orange-800 border-orange-300/60 hover:bg-orange-200/80",
          icon: TrendingUp,
          label: "High",
        }
      case "medium":
        return {
          color: "bg-blue-100/80 text-blue-800 border-blue-300/60 hover:bg-blue-200/80",
          icon: Target,
          label: "Medium",
        }
      case "low":
        return {
          color: "bg-green-100/80 text-green-800 border-green-300/60 hover:bg-green-200/80",
          icon: CheckCircle2,
          label: "Low",
        }
    }
  }

  const isOverdue = (task: Task) => {
    return !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
    urgent: tasks.filter((t) => !t.completed && t.priority === "urgent").length,
    urgentDue: tasks.filter((t) => {
      if (t.completed || !t.dueDate) return false
      const now = new Date()
      const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)
      const dueDate = new Date(t.dueDate)
      return dueDate <= twoDaysFromNow && dueDate >= now
    }).length,
  }

  return (
    <div className="min-h-screen professional-gradient relative">
      <div className="particle-container"></div>

      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="font-bold text-5xl md:text-7xl text-gray-800 mb-4 font-serif tracking-tight">
            TaskMaster Pro
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-2xl mx-auto leading-relaxed">
            Advanced task management with intelligent prioritization, fluid animations, and professional workflow
            optimization
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8">
          {[
            { label: "Total", value: stats.total, icon: BarChart3, gradient: "from-blue-200/60 to-blue-300/60" },
            { label: "Active", value: stats.active, icon: Clock, gradient: "from-cyan-200/60 to-cyan-300/60" },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle2,
              gradient: "from-green-200/60 to-green-300/60",
            },
            { label: "Overdue", value: stats.overdue, icon: AlertCircle, gradient: "from-red-200/60 to-red-300/60" },
            { label: "Urgent", value: stats.urgentDue, icon: Zap, gradient: "from-orange-200/60 to-orange-300/60" },
          ].map((stat, index) => (
            <Card
              key={stat.label}
              className={`glass-morphism p-4 md:p-6 border-0 bg-gradient-to-br ${stat.gradient} transform hover:scale-105 transition-all duration-500 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                <div className="text-center md:text-left">
                  <p className="text-gray-600 text-xs md:text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 font-serif">{stat.value}</p>
                </div>
                <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
              </div>
            </Card>
          ))}
        </div>

        <Card className="glass-morphism-strong p-6 mb-8 border-0">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 font-serif">Ready to tackle something new?</h2>
              <p className="text-gray-600">Create a task with detailed information and smart prioritization</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(true)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 h-12 px-8 font-semibold transform hover:scale-105 transition-all duration-200 animate-pulse-glow"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-morphism-strong border-gray-300/50 text-gray-800 max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl text-gray-800">
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-800 font-medium mb-2 block">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="What needs to be done?"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-white/60 border-gray-300/60 text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-gray-800 font-medium mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Add more details..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-white/60 border-gray-300/60 text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 min-h-[80px] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority" className="text-gray-800 font-medium mb-2 block">
                        Priority
                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: Task["priority"]) =>
                          setFormData((prev) => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger className="bg-white/60 border-gray-300/60 text-gray-800 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-300/50">
                          <SelectItem value="low" className="text-gray-800 hover:bg-gray-100/80 focus:bg-gray-100/80">
                            Low
                          </SelectItem>
                          <SelectItem
                            value="medium"
                            className="text-gray-800 hover:bg-gray-100/80 focus:bg-gray-100/80"
                          >
                            Medium
                          </SelectItem>
                          <SelectItem value="high" className="text-gray-800 hover:bg-gray-100/80 focus:bg-gray-100/80">
                            High
                          </SelectItem>
                          <SelectItem
                            value="urgent"
                            className="text-gray-800 hover:bg-gray-100/80 focus:bg-gray-100/80"
                          >
                            Urgent
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dueDate" className="text-gray-800 font-medium mb-2 block">
                        Due Date
                      </Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                        className="bg-white/60 border-gray-300/60 text-gray-800 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading || !formData.title.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 h-11 font-medium"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : editingTask ? (
                        "Update Task"
                      ) : (
                        "Create Task"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-white/60 border-gray-300/60 text-gray-800 hover:bg-white/80 hover:border-gray-400/60 h-11 font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search tasks and descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/40 backdrop-blur-sm border-gray-300/60 text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 pl-10 hover:bg-white/60"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "active", "completed", "overdue", "urgent"] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                onClick={() => setFilter(filterType)}
                className={`capitalize ${
                  filter === filterType
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-0"
                    : "bg-white/40 backdrop-blur-sm text-gray-700 border-gray-300/60 hover:bg-white/60 hover:border-gray-400/60"
                } transition-all duration-200`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {filterType === "urgent" ? "Urgent (48h)" : filterType}
                {filterType === "overdue" && stats.overdue > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs">{stats.overdue}</Badge>
                )}
                {filterType === "urgent" && stats.urgentDue > 0 && (
                  <Badge className="ml-2 bg-orange-500 text-white text-xs">{stats.urgentDue}</Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAndFilteredTasks.map((task, index) => {
            const priorityConfig = getPriorityConfig(task.priority)
            const overdue = isOverdue(task)
            const daysUntil = task.dueDate ? getDaysUntilDue(task.dueDate) : null

            return (
              <Card
                key={task.id}
                className={`glass-morphism p-6 border-0 transform hover:scale-105 transition-all duration-500 animate-fade-in-up ${
                  task.completed ? "opacity-75" : ""
                } ${overdue ? "ring-2 ring-red-400/60" : ""}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1 border-gray-400/60 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3
                        className={`font-semibold text-gray-800 mb-2 font-serif text-lg leading-tight ${
                          task.completed ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(task)}
                          className="text-gray-500 hover:text-blue-600 hover:bg-blue-100/60 p-1 h-auto"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-100/60 p-1 h-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className={`text-gray-600 text-sm mb-3 leading-relaxed ${task.completed ? "opacity-60" : ""}`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className={`text-xs ${priorityConfig.color} transition-colors cursor-default`}>
                        <priorityConfig.icon className="w-3 h-3 mr-1" />
                        {priorityConfig.label}
                      </Badge>

                      {task.dueDate && (
                        <Badge
                          className={`text-xs ${
                            overdue
                              ? "bg-red-100/80 text-red-800 border-red-300/60"
                              : daysUntil !== null && daysUntil <= 3
                                ? "bg-yellow-100/80 text-yellow-800 border-yellow-300/60"
                                : "bg-gray-100/80 text-gray-700 border-gray-300/60"
                          }`}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          {overdue
                            ? `${Math.abs(daysUntil!)} days overdue`
                            : daysUntil === 0
                              ? "Due today"
                              : daysUntil === 1
                                ? "Due tomorrow"
                                : `${daysUntil} days left`}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                      {task.completedAt && <span>Completed {new Date(task.completedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {sortedAndFilteredTasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 glass-morphism rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2 font-serif">
              {searchQuery ? "No tasks found" : "No tasks yet"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search terms or filters"
                : "Create your first task to get started with professional task management"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
