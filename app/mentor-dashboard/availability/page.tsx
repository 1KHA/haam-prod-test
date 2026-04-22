"use client"

import { useEffect, useState } from "react"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Save, 
  Trash2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TimeSlot {
  id: string
  day: string
  startTime: string
  endTime: string
  isRecurring: boolean
  notes?: string
}

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]

export default function MentorAvailabilityPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [newTimeSlot, setNewTimeSlot] = useState<Omit<TimeSlot, "id">>({
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    isRecurring: true,
    notes: ""
  })
  
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch("/api/mentor/availability", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch availability")
        }
        
        const data = await response.json()
        setTimeSlots(data.timeSlots || [])
      } catch (error) {
        console.error("Error fetching availability:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAvailability()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewTimeSlot(prev => ({
      ...prev,
      [name]: name === "isRecurring" ? (e.target as HTMLInputElement).checked : value
    }))
  }
  
  const handleAddTimeSlot = async () => {
    try {
      const response = await fetch("/api/mentor/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newTimeSlot),
      })
      
      if (!response.ok) {
        throw new Error("Failed to add time slot")
      }
      
      const data = await response.json()
      setTimeSlots(prev => [...prev, data.timeSlot])
      
      // Reset form
      setNewTimeSlot({
        day: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        isRecurring: true,
        notes: ""
      })
    } catch (error) {
      console.error("Error adding time slot:", error)
    }
  }
  
  const handleDeleteTimeSlot = async (id: string) => {
    try {
      const response = await fetch(`/api/mentor/availability/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete time slot")
      }
      
      setTimeSlots(prev => prev.filter(slot => slot.id !== id))
    } catch (error) {
      console.error("Error deleting time slot:", error)
    }
  }
  
  const groupTimeSlotsByDay = () => {
    const grouped: Record<string, TimeSlot[]> = {}
    
    daysOfWeek.forEach(day => {
      grouped[day] = timeSlots.filter(slot => slot.day === day)
    })
    
    return grouped
  }
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-full">جاري التحميل...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">جدول المواعيد المتاحة</h1>
      </div>
      
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calendar">التقويم الأسبوعي</TabsTrigger>
          <TabsTrigger value="add">إضافة موعد جديد</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {daysOfWeek.map(day => (
              <Card key={day} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{day}</CardTitle>
                  <CardDescription>
                    {groupTimeSlotsByDay()[day]?.length || 0} مواعيد متاحة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {groupTimeSlotsByDay()[day]?.length > 0 ? (
                    <div className="space-y-4">
                      {groupTimeSlotsByDay()[day].map(slot => (
                        <div key={slot.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 ml-2 text-gray-500" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </div>
                            {slot.isRecurring && (
                              <div className="text-xs text-gray-500 mt-1">
                                يتكرر أسبوعياً
                              </div>
                            )}
                            {slot.notes && (
                              <div className="text-xs text-gray-500 mt-1">
                                {slot.notes}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTimeSlot(slot.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      لا توجد مواعيد متاحة
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>إضافة موعد جديد</CardTitle>
              <CardDescription>
                أضف مواعيد متاحة للجلسات مع الشركات الناشئة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="day">اليوم</Label>
                    <select
                      id="day"
                      name="day"
                      value={newTimeSlot.day}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="isRecurring">التكرار</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={newTimeSlot.isRecurring}
                        onChange={handleInputChange}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="isRecurring" className="text-sm font-normal">
                        يتكرر أسبوعياً
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">وقت البدء</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={newTimeSlot.startTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">وقت الانتهاء</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={newTimeSlot.endTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={newTimeSlot.notes || ""}
                    onChange={handleInputChange}
                    placeholder="مثال: متاح للاجتماعات عبر الإنترنت فقط"
                  />
                </div>
                
                <Button onClick={handleAddTimeSlot} className="w-full">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة موعد
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
