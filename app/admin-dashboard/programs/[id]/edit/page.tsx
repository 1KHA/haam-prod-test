"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { showAdminToast } from "@/components/admin/admin-toaster"
import { ArrowLeft, Calendar, Save } from "lucide-react"

interface Program {
  id: string
  name: string
  description: string
  startDate: string | null
  endDate: string | null
  location: string | null
  type: string
  status: string
  capacity: number | null
  applicationDeadline: string | null
  requirements: string | null
  benefits: string | null
  creator: {
    id: string
    name: string
    email: string
  }
}

export default function EditProgramPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingProgram, setFetchingProgram] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [location, setLocation] = useState("")
  const [capacity, setCapacity] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [applicationDeadline, setApplicationDeadline] = useState("")
  const [requirements, setRequirements] = useState("")
  const [benefits, setBenefits] = useState("")
  
  // Get token from localStorage
  useEffect(() => {
    // Token is now in HTTP-only cookie, credentials: "include" sends it automatically
    const storedToken = null; // Cookie-based auth - no localStorage token needed
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch program details
  useEffect(() => {
    
    const fetchProgram = async () => {
      setFetchingProgram(true);
      
      try {
        const response = await fetch(`/api/admin/programs/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch program');
        }
        
        const program: Program = await response.json();
        
        // Populate form with program data
        setName(program.name);
        setDescription(program.description || '');
        setType(program.type);
        setStatus(program.status);
        setLocation(program.location || '');
        setCapacity(program.capacity ? program.capacity.toString() : '');
        setStartDate(program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : '');
        setEndDate(program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : '');
        setApplicationDeadline(
          program.applicationDeadline ? 
          new Date(program.applicationDeadline).toISOString().split('T')[0] : 
          ''
        );
        setRequirements(program.requirements || '');
        setBenefits(program.benefits || '');
      } catch (error) {
        console.error('Error fetching program:', error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات البرنامج",
          variant: "destructive"
        });
      } finally {
        setFetchingProgram(false);
      }
    };
    
    fetchProgram();
  }, [params.id]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type || !status) {
      showAdminToast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/admin/programs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          type,
          status,
          location,
          capacity: capacity ? parseInt(capacity) : null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
          requirements,
          benefits
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update program');
      }
      
      showAdminToast({
        title: "تم بنجاح",
        description: "تم تحديث البرنامج بنجاح"
      });
      
      // Redirect to program details page
      router.push(`/admin-dashboard/programs/${params.id}`);
    } catch (error) {
      console.error('Error updating program:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في تحديث البرنامج",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingProgram) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>جاري تحميل بيانات البرنامج...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تعديل البرنامج</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>رجوع</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">معلومات البرنامج</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">اسم البرنامج *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="أدخل اسم البرنامج"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">نوع البرنامج *</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="اختر نوع البرنامج" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCELERATOR">مسرع أعمال</SelectItem>
                    <SelectItem value="INCUBATOR">حاضنة أعمال</SelectItem>
                    <SelectItem value="WORKSHOP">ورشة عمل</SelectItem>
                    <SelectItem value="BOOTCAMP">معسكر تدريبي</SelectItem>
                    <SelectItem value="HACKATHON">هاكاثون</SelectItem>
                    <SelectItem value="OTHER">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">حالة البرنامج *</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر حالة البرنامج" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">مسودة</SelectItem>
                    <SelectItem value="ACTIVE">نشط</SelectItem>
                    <SelectItem value="COMPLETED">مكتمل</SelectItem>
                    <SelectItem value="CANCELLED">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">الموقع</Label>
                <Input 
                  id="location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="أدخل موقع البرنامج"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">السعة</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  value={capacity} 
                  onChange={(e) => setCapacity(e.target.value)} 
                  placeholder="أدخل سعة البرنامج"
                  min="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء</Label>
                <div className="relative">
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <div className="relative">
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">الموعد النهائي للتقديم</Label>
                <div className="relative">
                  <Input 
                    id="applicationDeadline" 
                    type="date" 
                    value={applicationDeadline} 
                    onChange={(e) => setApplicationDeadline(e.target.value)} 
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف البرنامج</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="أدخل وصف البرنامج"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">متطلبات البرنامج</Label>
              <Textarea 
                id="requirements" 
                value={requirements} 
                onChange={(e) => setRequirements(e.target.value)} 
                placeholder="أدخل متطلبات البرنامج"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="benefits">فوائد البرنامج</Label>
              <Textarea 
                id="benefits" 
                value={benefits} 
                onChange={(e) => setBenefits(e.target.value)} 
                placeholder="أدخل فوائد البرنامج"
                rows={3}
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
                <span>حفظ التغييرات</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
