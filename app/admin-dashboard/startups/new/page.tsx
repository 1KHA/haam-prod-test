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

interface Accelerator {
  id: string
  name: string
  email: string
}

interface NewStartup {
  name: string
  industry: string
  stage: string
  description: string
  problem: string
  solution: string
  targetMarket: string
  businessModel: string
  competitiveAdvantage: string
  teamSize: number
  fundingNeeds: string
  pitchDeckUrl: string
  status: string
  creatorId: string
}

export default function NewStartup() {
  const router = useRouter()
  const [startup, setStartup] = useState<NewStartup>({
    name: '',
    industry: '',
    stage: '',
    description: '',
    problem: '',
    solution: '',
    targetMarket: '',
    businessModel: '',
    competitiveAdvantage: '',
    teamSize: 1,
    fundingNeeds: '',
    pitchDeckUrl: '',
    status: 'PENDING',
    creatorId: ''
  })
  const [accelerators, setAccelerators] = useState<Accelerator[]>([])
  const [loading, setLoading] = useState(false)
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

  // Fetch accelerators
  useEffect(() => {
    if (!token) return;

    const fetchAccelerators = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/users?role=ACCELERATOR', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch accelerators');
        }

        const data = await response.json();
        setAccelerators(data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email
        })));
      } catch (err) {
        console.error('Error fetching accelerators:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب قائمة المسرعات",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccelerators();
  }, [token]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!startup.creatorId) {
      showAdminToast({
        title: "خطأ",
        description: "يجب اختيار مسرع",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/startups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(startup)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create startup');
      }

      const data = await response.json();

      showAdminToast({
        title: "تم بنجاح",
        description: "تم إنشاء الشركة الناشئة بنجاح"
      });
      
      // Navigate to startup details page
      router.push(`/admin-dashboard/startups/${data.id}`);
    } catch (err) {
      console.error('Error creating startup:', err);
      showAdminToast({
        title: "خطأ",
        description: err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الشركة الناشئة',
        variant: "destructive"
      });
      setSaving(false);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStartup(prev => ({ ...prev, [name]: value }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setStartup(prev => ({ ...prev, [name]: value }));
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.push('/admin-dashboard/startups')}
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إضافة شركة ناشئة جديدة</h1>
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
                  placeholder="أدخل اسم الشركة الناشئة"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">القطاع</label>
                <Input 
                  name="industry"
                  value={startup.industry}
                  onChange={handleChange}
                  required
                  placeholder="مثال: التكنولوجيا المالية"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">المرحلة</label>
                <Input 
                  name="stage"
                  value={startup.stage}
                  onChange={handleChange}
                  required
                  placeholder="مثال: تمويل أولي"
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
                  value={startup.fundingNeeds}
                  onChange={handleChange}
                  placeholder="مثال: 5,000,000 ريال"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط العرض التقديمي</label>
                <Input 
                  name="pitchDeckUrl"
                  value={startup.pitchDeckUrl}
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">المسرع</label>
                {loading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                ) : accelerators.length > 0 ? (
                  <Select 
                    value={startup.creatorId} 
                    onValueChange={(value) => handleSelectChange('creatorId', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المسرع" />
                    </SelectTrigger>
                    <SelectContent>
                      {accelerators.map(accelerator => (
                        <SelectItem key={accelerator.id} value={accelerator.id}>
                          {accelerator.name} ({accelerator.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    لا توجد مسرعات متاحة
                  </div>
                )}
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
                  placeholder="وصف مختصر للشركة الناشئة"
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
                  placeholder="ما هي المشكلة التي تحاول الشركة حلها؟"
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
                  placeholder="كيف تحل الشركة هذه المشكلة؟"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">السوق المستهدف</label>
                <Textarea 
                  name="targetMarket"
                  value={startup.targetMarket}
                  onChange={handleChange}
                  rows={3}
                  placeholder="من هم العملاء المستهدفون؟"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">نموذج العمل</label>
                <Textarea 
                  name="businessModel"
                  value={startup.businessModel}
                  onChange={handleChange}
                  rows={3}
                  placeholder="كيف ستحقق الشركة الإيرادات؟"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">الميزة التنافسية</label>
                <Textarea 
                  name="competitiveAdvantage"
                  value={startup.competitiveAdvantage}
                  onChange={handleChange}
                  rows={3}
                  placeholder="ما الذي يميز الشركة عن المنافسين؟"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => router.push('/admin-dashboard/startups')}
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
            <span>إنشاء الشركة الناشئة</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
