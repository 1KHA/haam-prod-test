"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Save } from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"

interface Program {
  id: string
  name: string
  type: string
}

export default function NewCohortPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  
  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [programId, setProgramId] = useState("")
  const [capacity, setCapacity] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState("UPCOMING")
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch available programs
  useEffect(() => {
    if (!token) return;
    
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      
      try {
        const response = await fetch('/api/programs?limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        
        const data = await response.json();
        setPrograms(data.programs || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب البرامج",
          variant: "destructive"
        });
      } finally {
        setLoadingPrograms(false);
      }
    };
    
    fetchPrograms();
  }, [token]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !programId || !startDate || !endDate) {
      showAdminToast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/program-manager/cohorts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          programId,
          capacity: capacity ? parseInt(capacity) : null,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create cohort');
      }
      
      const data = await response.json();
      
      showAdminToast({
        title: "تم بنجاح",
        description: "تم إنشاء الدفعة بنجاح"
      });
      
      // Redirect to cohort details page
      router.push(`/program-manager-dashboard/cohorts/${data.id}`);
    } catch (error) {
      console.error('Error creating cohort:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في إنشاء الدفعة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!token) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>يجب تسجيل الدخول أولاً</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>رجوع</span>
        </Button>
        <h1 className="text-3xl font-bold">إضافة دفعة جديدة</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">معلومات الدفعة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الدفعة *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="أدخل اسم الدفعة"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="program">البرنامج *</Label>
                <Select value={programId} onValueChange={setProgramId} required>
                  <SelectTrigger id="program">
                    <SelectValue placeholder="اختر البرنامج" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPrograms ? (
                      <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                    ) : programs.length > 0 ? (
                      programs.map(program => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name} ({program.type})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>لا توجد برامج متاحة</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">السعة</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  value={capacity} 
                  onChange={(e) => setCapacity(e.target.value)} 
                  placeholder="أدخل سعة الدفعة"
                  min="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">الحالة *</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر حالة الدفعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">قادم</SelectItem>
                    <SelectItem value="ACTIVE">نشط</SelectItem>
                    <SelectItem value="COMPLETED">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء *</Label>
                <div className="relative">
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    required
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ الانتهاء *</Label>
                <div className="relative">
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    required
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف الدفعة</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="أدخل وصف الدفعة"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                <span>حفظ الدفعة</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
