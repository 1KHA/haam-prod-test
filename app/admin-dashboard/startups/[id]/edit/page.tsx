"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowRight, 
  Save, 
  Loader2
} from "lucide-react"
import { showAdminToast } from "@/components/admin/admin-toaster"

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
  description: string
  problem: string
  solution: string
  targetMarket: string | null
  businessModel: string | null
  competitiveAdvantage: string | null
  teamSize: number
  fundingNeeds: string | null
  pitchDeckUrl: string | null
  status: string
  creatorId: string
}

export default function EditStartup({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [startup, setStartup] = useState<Startup | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch startup details
  useEffect(() => {
    if (!token) return;

    const fetchStartupDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/startups/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch startup details');
        }

        const data = await response.json();
        setStartup({
          id: data.id,
          name: data.name,
          industry: data.industry,
          stage: data.stage,
          description: data.description,
          problem: data.problem,
          solution: data.solution,
          targetMarket: data.targetMarket,
          businessModel: data.businessModel,
          competitiveAdvantage: data.competitiveAdvantage,
          teamSize: data.teamSize,
          fundingNeeds: data.fundingNeeds,
          pitchDeckUrl: data.pitchDeckUrl,
          status: data.status,
          creatorId: data.creator.id
        });
      } catch (err) {
        console.error('Error fetching startup details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب بيانات الشركة الناشئة",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStartupDetails();
  }, [params.id, token]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !startup) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/startups/${startup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(startup)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update startup');
      }

      showAdminToast({
        title: "تم بنجاح",
        description: "تم تحديث الشركة الناشئة بنجاح"
      });
      
      // Navigate to startup details page
      router.push(`/admin-dashboard/startups/${startup.id}`);
    } catch (err) {
      console.error('Error updating startup:', err);
      showAdminToast({
        title: "خطأ",
        description: err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الشركة الناشئة',
        variant: "destructive"
      });
      setSaving(false);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStartup(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setStartup(prev => prev ? { ...prev, [name]: value } : null);
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>يجب تسجيل الدخول أولاً</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        لم يتم العثور على الشركة الناشئة
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تعديل {startup.name}</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.back()}
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم الشركة</label>
                <Input 
                  name="name"
                  value={startup.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">القطاع</label>
                <Input 
                  name="industry"
                  value={startup.industry}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">المرحلة</label>
                <Input 
                  name="stage"
                  value={startup.stage}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">حجم الفريق</label>
                <Input 
                  name="teamSize"
                  type="number"
                  value={startup.teamSize}
                  onChange={handleChange}
                  required
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">احتياجات التمويل</label>
                <Input 
                  name="fundingNeeds"
                  value={startup.fundingNeeds || ''}
                  onChange={handleChange}
                  placeholder="مثال: 5,000,000 ريال"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط العرض التقديمي</label>
                <Input 
                  name="pitchDeckUrl"
                  value={startup.pitchDeckUrl || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/pitch-deck.pdf"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">الحالة</label>
                <Select 
                  value={startup.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">معلق</SelectItem>
                    <SelectItem value="APPROVED">نشط</SelectItem>
                    <SelectItem value="REJECTED">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>معلومات الشركة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الوصف</label>
                <Textarea 
                  name="description"
                  value={startup.description}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">المشكلة</label>
                <Textarea 
                  name="problem"
                  value={startup.problem}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">الحل</label>
                <Textarea 
                  name="solution"
                  value={startup.solution}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">السوق المستهدف</label>
                <Textarea 
                  name="targetMarket"
                  value={startup.targetMarket || ''}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">نموذج العمل</label>
                <Textarea 
                  name="businessModel"
                  value={startup.businessModel || ''}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">الميزة التنافسية</label>
                <Textarea 
                  name="competitiveAdvantage"
                  value={startup.competitiveAdvantage || ''}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => router.back()}
          >
            إلغاء
          </Button>
          <Button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-1"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>حفظ التغييرات</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
