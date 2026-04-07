"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Loader2, Plus, Trash2, Search } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CohortMentor {
  id: string
  user: {
    id: string
    name: string
    email: string
    mentorProfile?: {
      expertise?: string
      experience?: string
    }
  }
  role: string
}

interface Cohort {
  id: string
  name: string
  program: {
    id: string
    name: string
  }
}

interface Mentor {
  id: string
  name: string
  email: string
  mentorProfile?: {
    expertise?: string
  }
}

export default function CohortMentorsPage() {
  const router = useRouter()
  const params = useParams()
  const cohortId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [mentors, setMentors] = useState<CohortMentor[]>([])
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState("")
  const [mentorRole, setMentorRole] = useState("MENTOR")
  const [adding, setAdding] = useState(false)

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch cohort and mentors data
  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      try {
        // Fetch cohort details
        const cohortResponse = await fetch(`/api/program-manager/cohorts/${cohortId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!cohortResponse.ok) {
          throw new Error('Failed to fetch cohort');
        }
        
        const cohortData = await cohortResponse.json();
        setCohort(cohortData);
        setMentors(cohortData.mentors || []);
        
        // Fetch available mentors
        const mentorsResponse = await fetch('/api/mentor', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (mentorsResponse.ok) {
          const mentorsData = await mentorsResponse.json();
          setAvailableMentors(mentorsData.mentors || mentorsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, cohortId]);

  const handleAddMentor = async () => {
    if (!selectedMentor) return;
    
    setAdding(true);
    
    try {
      const response = await fetch(`/api/program-manager/cohorts/${cohortId}/mentors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedMentor,
          role: mentorRole
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add mentor');
      }
      
      // Refresh mentors list
      const cohortResponse = await fetch(`/api/program-manager/cohorts/${cohortId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (cohortResponse.ok) {
        const cohortData = await cohortResponse.json();
        setMentors(cohortData.mentors || []);
      }
      
      setAddDialogOpen(false);
      setSelectedMentor("");
      setMentorRole("MENTOR");
    } catch (error) {
      console.error('Error adding mentor:', error);
      alert('حدث خطأ أثناء إضافة المرشد');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMentor = async (userId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا المرشد من الدفعة؟')) return;
    
    try {
      const response = await fetch(`/api/program-manager/cohorts/${cohortId}/mentors?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove mentor');
      }
      
      // Refresh mentors list
      setMentors(mentors.filter(m => m.user.id !== userId));
    } catch (error) {
      console.error('Error removing mentor:', error);
      alert('حدث خطأ أثناء إزالة المرشد');
    }
  };

  const columns: ColumnDef<CohortMentor>[] = [
    {
      accessorKey: "user.name",
      header: "اسم المرشد",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.user.name}</div>
      ),
    },
    {
      accessorKey: "user.email",
      header: "البريد الإلكتروني",
      cell: ({ row }) => <div>{row.original.user.email}</div>,
    },
    {
      accessorKey: "user.mentorProfile.expertise",
      header: "التخصص",
      cell: ({ row }) => (
        <div>{row.original.user.mentorProfile?.expertise || '-'}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "الدور",
      cell: ({ row }) => {
        const role = row.original.role;
        let label = role;
        
        if (role === "MENTOR") {
          label = "مرشد";
        } else if (role === "LEAD_MENTOR") {
          label = "مرشد رئيسي";
        } else if (role === "ASSOCIATE_MENTOR") {
          label = "مرشد مساعد";
        }
        
        return <Badge variant="outline">{label}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => handleRemoveMentor(row.original.user.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const filteredMentors = mentors.filter(mentor =>
    mentor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>الدفعة غير موجودة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مرشد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مرشد للدفعة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مرشد" />
                </SelectTrigger>
                <SelectContent>
                  {availableMentors
                    .filter(m => !mentors.some(cm => cm.user.id === m.id))
                    .map(mentor => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name} - {mentor.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={mentorRole} onValueChange={setMentorRole}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MENTOR">مرشد</SelectItem>
                  <SelectItem value="LEAD_MENTOR">مرشد رئيسي</SelectItem>
                  <SelectItem value="ASSOCIATE_MENTOR">مرشد مساعد</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddMentor} 
                disabled={!selectedMentor || adding}
                className="w-full"
              >
                {adding && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">إدارة المرشدين</h1>
            <p className="text-muted-foreground">{cohort.name} - {cohort.program.name}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>المرشدين في الدفعة ({mentors.length})</CardTitle>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredMentors}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}