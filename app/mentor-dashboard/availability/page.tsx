"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Save, 
  Trash, 
  Edit,
  Check,
  X,
  RefreshCw,
  ExternalLink
} from "lucide-react"

export default function AvailabilityPage() {
  const [activeTab, setActiveTab] = useState("weekly")
  const [isEditing, setIsEditing] = useState(false)
  
  const daysOfWeek = [
    { id: "sunday", name: "الأحد" },
    { id: "monday", name: "الإثنين" },
    { id: "tuesday", name: "الثلاثاء" },
    { id: "wednesday", name: "الأربعاء" },
    { id: "thursday", name: "الخميس" },
    { id: "friday", name: "الجمعة" },
    { id: "saturday", name: "السبت" }
  ]
  
  const timeSlots = [
    { id: 1, day: "monday", startTime: "09:00", endTime: "11:00", isRecurring: true },
    { id: 2, day: "monday", startTime: "14:00", endTime: "16:00", isRecurring: true },
    { id: 3, day: "wednesday", startTime: "10:00", endTime: "12:00", isRecurring: true },
    { id: 4, day: "thursday", startTime: "13:00", endTime: "15:00", isRecurring: true }
  ]
  
  const specificDates = [
    { id: 1, date: "2025-03-20", startTime: "09:00", endTime: "11:00", note: "ورشة عمل استراتيجية الأعمال" },
    { id: 2, date: "2025-03-25", startTime: "14:00", endTime: "16:00", note: "جلسات إرشاد فردية" },
    { id: 3, date: "2025-04-05", startTime: "10:00", endTime: "12:00", note: "يوم عرض المشاريع" }
  ]
  
  const upcomingSessions = [
    { 
      id: 1, 
      startupName: "تك سوليوشنز", 
      date: "2025-03-15", 
      startTime: "10:00", 
      endTime: "11:00", 
      type: "فردية",
      topic: "مراجعة خطة التسويق",
      status: "confirmed"
    },
    { 
      id: 2, 
      startupName: "هيلث تك", 
      date: "2025-03-18", 
      startTime: "14:00", 
      endTime: "15:00", 
      type: "فردية",
      topic: "استراتيجية جمع التمويل",
      status: "pending"
    },
    { 
      id: 3, 
      startupName: "فينتك", 
      date: "2025-03-22", 
      startTime: "09:00", 
      endTime: "10:00", 
      type: "فردية",
      topic: "تطوير المنتج",
      status: "confirmed"
    }
  ]
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "مؤكدة"
      case "pending": return "بانتظار التأكيد"
      case "cancelled": return "ملغية"
      default: return "غير معروف"
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {isEditing ? (
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsEditing(false)}
            >
              <Save className="h-4 w-4" />
              <span>حفظ التغييرات</span>
            </Button>
          ) : (
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
              <span>تعديل الجدول</span>
            </Button>
          )}
          <Button variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <span>مزامنة مع التقويم</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة الجدول والتوفر</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{timeSlots.length}</div>
            <p className="text-muted-foreground">أوقات متاحة أسبوعياً</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CalendarIcon className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{specificDates.length}</div>
            <p className="text-muted-foreground">مواعيد خاصة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Check className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{upcomingSessions.filter(s => s.status === "confirmed").length}</div>
            <p className="text-muted-foreground">جلسات مؤكدة قادمة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">الجلسات القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`px-3 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                      {getStatusText(session.status)}
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg">{session.startupName}</h3>
                      <p className="text-sm text-muted-foreground">{session.topic}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-muted-foreground">التاريخ</div>
                      <div className="font-medium">{formatDate(session.date)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">الوقت</div>
                      <div className="font-medium">{session.startTime} - {session.endTime}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">نوع الجلسة</div>
                      <div className="font-medium">{session.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    {session.status === "pending" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <X className="h-4 w-4" />
                          <span>رفض</span>
                        </Button>
                        <Button variant="default" size="sm" className="flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          <span>قبول</span>
                        </Button>
                      </div>
                    )}
                    
                    {session.status === "confirmed" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <RefreshCw className="h-4 w-4" />
                          <span>إعادة جدولة</span>
                        </Button>
                        <Button variant="default" size="sm" className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          <span>عرض التفاصيل</span>
                        </Button>
                      </div>
                    )}
                    
                    {session.status !== "pending" && session.status !== "confirmed" && (
                      <div></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">لا توجد جلسات قادمة</h3>
                <p className="text-muted-foreground mb-4">ليس لديك أي جلسات مجدولة في الوقت الحالي</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">إدارة التوفر</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-end">
              <TabsTrigger value="specific">مواعيد خاصة</TabsTrigger>
              <TabsTrigger value="weekly">الجدول الأسبوعي</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  {isEditing && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>إضافة وقت جديد</span>
                    </Button>
                  )}
                </div>
                <h3 className="font-medium text-lg">الأوقات المتاحة أسبوعياً</h3>
              </div>
              
              <div className="space-y-4">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot) => (
                    <div key={slot.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Trash className="h-4 w-4" />
                              <span>حذف</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">متكرر أسبوعياً</span>
                            {slot.isRecurring && <Check className="h-4 w-4 text-green-500" />}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4">
                          {isEditing ? (
                            <>
                              <div className="flex gap-2 items-center">
                                <Input 
                                  type="time" 
                                  defaultValue={slot.endTime} 
                                  className="w-24" 
                                />
                                <span>-</span>
                                <Input 
                                  type="time" 
                                  defaultValue={slot.startTime} 
                                  className="w-24" 
                                />
                              </div>
                              <select className="border rounded p-2 text-right">
                                {daysOfWeek.map((day) => (
                                  <option 
                                    key={day.id} 
                                    value={day.id}
                                    selected={day.id === slot.day}
                                  >
                                    {day.name}
                                  </option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <>
                              <div className="text-right">
                                <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium">
                                  {daysOfWeek.find(d => d.id === slot.day)?.name}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد أوقات متاحة</h3>
                    <p className="text-muted-foreground mb-4">لم تقم بإضافة أي أوقات متاحة أسبوعياً</p>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>إضافة وقت جديد</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="specific" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  {isEditing && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>إضافة موعد خاص</span>
                    </Button>
                  )}
                </div>
                <h3 className="font-medium text-lg">المواعيد الخاصة</h3>
              </div>
              
              <div className="space-y-4">
                {specificDates.length > 0 ? (
                  specificDates.map((date) => (
                    <div key={date.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Trash className="h-4 w-4" />
                              <span>حذف</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {date.note}
                          </div>
                        )}
                        
                        <div className="flex flex-col items-end gap-2">
                          {isEditing ? (
                            <>
                              <Input 
                                type="date" 
                                defaultValue={date.date} 
                                className="text-right" 
                              />
                              <div className="flex gap-2 items-center">
                                <Input 
                                  type="time" 
                                  defaultValue={date.endTime} 
                                  className="w-24" 
                                />
                                <span>-</span>
                                <Input 
                                  type="time" 
                                  defaultValue={date.startTime} 
                                  className="w-24" 
                                />
                              </div>
                              <Input 
                                defaultValue={date.note} 
                                className="text-right" 
                                placeholder="ملاحظات"
                              />
                            </>
                          ) : (
                            <>
                              <div className="font-medium">{formatDate(date.date)}</div>
                              <div className="text-sm">{date.startTime} - {date.endTime}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 border rounded-lg">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد مواعيد خاصة</h3>
                    <p className="text-muted-foreground mb-4">لم تقم بإضافة أي مواعيد خاصة</p>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>إضافة موعد خاص</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
