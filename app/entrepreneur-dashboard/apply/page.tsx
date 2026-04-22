"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, Users, Building, ArrowRight, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface Cohort {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  capacity: number | null
  program: {
    id: string
    name: string
    type: string
    description: string | null
    requirements: string | null
    benefits: string | null
  }
  stats: {
    membersCount: number
    mentorsCount: number
  }
  alreadyApplied: boolean
}

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
  status: string
  description: string
}

interface TeamMember {
  name: string
  position: string
  email: string
  phone: string
  department: string
}

export default function ApplyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [companies, setCompanies] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [selectedStartup, setSelectedStartup] = useState<string>("")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newTeamMember, setNewTeamMember] = useState<TeamMember>({
    name: "",
    position: "",
    email: "",
    phone: "",
    department: "Engineering"
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  
  // Fetch active cohorts
  useEffect(() => {
    const fetchCohorts = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/cohorts/active', {
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch active cohorts');
        }
        
        const data = await response.json();
        setCohorts(data.cohorts || []);
      } catch (error) {
        console.error('Error fetching cohorts:', error);
        toast({
          title: "خطأ",
          description: "فشل في جلب الدفعات النشطة",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCohorts();
  }, [token, toast]);

  // Fetch user's companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/startups', {
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        
        const data = await response.json();
        const allCompanies: Startup[] = data.companies || [];
        setCompanies(allCompanies);

        // Set the first APPROVED company as selected by default
        const firstApproved = allCompanies.find(c => c.status === 'APPROVED');
        if (firstApproved) {
          setSelectedStartup(firstApproved.id);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "خطأ",
          description: "فشل في جلب الشركات الناشئة",
          variant: "destructive"
        });
      }
    };
    
    fetchCompanies();
  }, [token, toast]);
  
  // Handle adding a team member
  const handleAddTeamMember = () => {
    // Validate required fields
    if (!newTeamMember.name || !newTeamMember.position || !newTeamMember.email) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    setTeamMembers([...teamMembers, newTeamMember]);
    setNewTeamMember({
      name: "",
      position: "",
      email: "",
      phone: "",
      department: "Engineering"
    });
  };
  
  // Handle removing a team member
  const handleRemoveTeamMember = (index: number) => {
    const updatedTeamMembers = [...teamMembers];
    updatedTeamMembers.splice(index, 1);
    setTeamMembers(updatedTeamMembers);
  };
  
  // Handle applying to a cohort
  const handleApply = async () => {
    if (!selectedCohort || !selectedStartup) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار دفعة وشركة ناشئة",
        variant: "destructive"
      });
      return;
    }
    
    setApplying(true);
    
    try {
      const response = await fetch('/api/cohorts/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cohortId: selectedCohort.id,
          startupId: selectedStartup,
          teamMembers
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply to cohort');
      }
      
      toast({
        title: "تم بنجاح",
        description: "تم التقديم للدفعة بنجاح"
      });
      
      setDialogOpen(false);
      
      // Redirect to dashboard
      router.push('/entrepreneur-dashboard');
    } catch (error) {
      console.error('Error applying to cohort:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في التقديم للدفعة",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };
  
  // Calculate duration in days
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>جاري التحميل...</p>
      </div>
    );
  }
  
  if (cohorts.length === 0) {
    return (
      <div className="space-y-6 text-right">
        <h1 className="text-3xl font-bold">التقديم للدفعات</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">لا توجد دفعات نشطة حالياً</p>
            <Button onClick={() => router.push('/entrepreneur-dashboard')}>
              العودة للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const approvedCompanies = companies.filter(c => c.status === 'APPROVED');

  if (companies.length === 0) {
    return (
      <div className="space-y-6 text-right">
        <h1 className="text-3xl font-bold">التقديم للدفعات</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">يجب إنشاء شركة ناشئة أولاً للتقديم للدفعات</p>
            <Button onClick={() => router.push('/entrepreneur-dashboard/startup/new')}>
              إنشاء شركة ناشئة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">التقديم للدفعات النشطة</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cohorts.map(cohort => (
          <Card key={cohort.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge>نشط</Badge>
                <CardTitle className="text-xl">{cohort.name}</CardTitle>
              </div>
              <CardDescription>
                {cohort.program.name} - {cohort.program.type}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {cohort.description || 'لا يوجد وصف'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {calculateDuration(cohort.startDate, cohort.endDate)} يوم
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {cohort.stats.membersCount} شركة ناشئة
                    {cohort.capacity && ` من أصل ${cohort.capacity}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {cohort.stats.mentorsCount} مرشد
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {cohort.alreadyApplied ? (
                <Badge className="w-full flex justify-center py-2 bg-green-600 text-white text-sm cursor-default">
                  تم التقديم ✓
                </Badge>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedCohort(cohort);
                    setDialogOpen(true);
                  }}
                >
                  <span>التقديم للدفعة</span>
                  <ArrowRight className="h-4 w-4 mr-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Application Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl text-right">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              التقديم لدفعة: {selectedCohort?.name}
            </DialogTitle>
            <DialogDescription>
              برنامج: {selectedCohort?.program.name} ({selectedCohort?.program.type})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Program Details */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">تفاصيل البرنامج</h3>
              
              {selectedCohort?.program.description && (
                <div>
                  <h4 className="text-sm font-medium">الوصف</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCohort.program.description}
                  </p>
                </div>
              )}
              
              {selectedCohort?.program.requirements && (
                <div>
                  <h4 className="text-sm font-medium">المتطلبات</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCohort.program.requirements}
                  </p>
                </div>
              )}
              
              {selectedCohort?.program.benefits && (
                <div>
                  <h4 className="text-sm font-medium">الفوائد</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCohort.program.benefits}
                  </p>
                </div>
              )}
            </div>
            
            {/* Company Selection */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">اختر الشركة الناشئة</h3>
              {approvedCompanies.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm">
                  شركتك قيد المراجعة من قِبَل الإدارة. ستتمكن من التقديم بعد الموافقة.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {approvedCompanies.map(company => (
                    <Card
                      key={company.id}
                      className={`cursor-pointer ${selectedStartup === company.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedStartup(company.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <Badge variant={selectedStartup === company.id ? "default" : "outline"}>
                            {selectedStartup === company.id ? 'مختار' : 'اختر'}
                          </Badge>
                          <h4 className="font-medium">{company.name}</h4>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>{company.industry} - {company.stage}</p>
                          <p className="mt-1">{company.description.substring(0, 100)}...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">أعضاء الفريق</h3>
              
              {/* Existing Team Members */}
              {teamMembers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">الأعضاء المضافين</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveTeamMember(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <div className="text-right">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.position} - {member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add New Team Member */}
              <div className="space-y-2 border rounded-md p-4">
                <h4 className="text-sm font-medium">إضافة عضو جديد</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">الاسم *</Label>
                    <Input 
                      id="name" 
                      value={newTeamMember.name} 
                      onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})} 
                      placeholder="أدخل الاسم"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="position">المنصب *</Label>
                    <Input 
                      id="position" 
                      value={newTeamMember.position} 
                      onChange={(e) => setNewTeamMember({...newTeamMember, position: e.target.value})} 
                      placeholder="أدخل المنصب"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={newTeamMember.email} 
                      onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})} 
                      placeholder="أدخل البريد الإلكتروني"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input 
                      id="phone" 
                      value={newTeamMember.phone} 
                      onChange={(e) => setNewTeamMember({...newTeamMember, phone: e.target.value})} 
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="department">القسم</Label>
                    <Input 
                      id="department" 
                      value={newTeamMember.department} 
                      onChange={(e) => setNewTeamMember({...newTeamMember, department: e.target.value})} 
                      placeholder="أدخل القسم"
                    />
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-2"
                  onClick={handleAddTeamMember}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  <span>إضافة عضو</span>
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleApply}
              disabled={applying || approvedCompanies.length === 0}
            >
              {applying ? 'جاري التقديم...' : 'تقديم الطلب'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
