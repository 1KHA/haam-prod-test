"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Loader2, Plus, Trash2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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

interface CohortMember {
  id: string
  startup: {
    id: string
    name: string
    industry: string
    stage: string
    teamSize: number
  }
  status: string
  joinDate: string
}

interface Cohort {
  id: string
  name: string
  program: {
    id: string
    name: string
  }
}

interface Startup {
  id: string
  name: string
  industry: string
  stage: string
}

export default function CohortMembersPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const cohortId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [members, setMembers] = useState<CohortMember[]>([])
  const [availableStartups, setAvailableStartups] = useState<Startup[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedStartup, setSelectedStartup] = useState("")
  const [adding, setAdding] = useState(false)

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch cohort and members data
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
        setMembers(cohortData.startups || []);
        
        // Fetch available startups
        const startupsResponse = await fetch('/api/program-manager/startups', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (startupsResponse.ok) {
          const startupsData = await startupsResponse.json();
          setAvailableStartups(startupsData.startups || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, cohortId]);

  const handleAddMember = async () => {
    if (!selectedStartup) return;
    
    setAdding(true);
    
    try {
      const response = await fetch(`/api/program-manager/cohorts/${cohortId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startupId: selectedStartup
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add member');
      }
      
      // Refresh members list
      const cohortResponse = await fetch(`/api/program-manager/cohorts/${cohortId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (cohortResponse.ok) {
        const cohortData = await cohortResponse.json();
        setMembers(cohortData.startups || []);
      }
      
      setAddDialogOpen(false);
      setSelectedStartup("");
    } catch (error) {
      console.error('Error adding member:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء إضافة العضو", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (startupId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذه الشركة من الدفعة؟')) return;
    
    try {
      const response = await fetch(`/api/program-manager/cohorts/${cohortId}/members?startupId=${startupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove member');
      }
      
      // Refresh members list
      setMembers(members.filter(m => m.startup.id !== startupId));
    } catch (error) {
      console.error('Error removing member:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء إزالة العضو", variant: "destructive" });
    }
  };

  const columns: ColumnDef<CohortMember>[] = [
    {
      accessorKey: "startup.name",
      header: "اسم الشركة",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.startup.name}</div>
      ),
    },
    {
      accessorKey: "startup.industry",
      header: "الصناعة",
      cell: ({ row }) => <div>{row.original.startup.industry}</div>,
    },
    {
      accessorKey: "startup.stage",
      header: "المرحلة",
      cell: ({ row }) => <div>{row.original.startup.stage}</div>,
    },
    {
      accessorKey: "startup.teamSize",
      header: "حجم الفريق",
      cell: ({ row }) => <div>{row.original.startup.teamSize}</div>,
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "outline" | "secondary" | "destructive" = "default";
        let label = status;
        
        if (status === "ACTIVE") {
          variant = "default";
          label = "نشط";
        } else if (status === "GRADUATED") {
          variant = "secondary";
          label = "تخرج";
        } else if (status === "DROPPED") {
          variant = "destructive";
          label = "منسحب";
        }
        
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "joinDate",
      header: "تاريخ الانضمام",
      cell: ({ row }) => (
        <div>{new Date(row.original.joinDate).toLocaleDateString('ar-SA')}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => handleRemoveMember(row.original.startup.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const filteredMembers = members.filter(member =>
    member.startup.name.toLowerCase().includes(searchQuery.toLowerCase())
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
              إضافة شركة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة شركة للدفعة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedStartup} onValueChange={setSelectedStartup}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر شركة" />
                </SelectTrigger>
                <SelectContent>
                  {availableStartups
                    .filter(s => !members.some(m => m.startup.id === s.id))
                    .map(startup => (
                      <SelectItem key={startup.id} value={startup.id}>
                        {startup.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddMember} 
                disabled={!selectedStartup || adding}
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
            <h1 className="text-3xl font-bold">إدارة الشركات</h1>
            <p className="text-muted-foreground">{cohort.name} - {cohort.program.name}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>الشركات في الدفعة ({members.length})</CardTitle>
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
            data={filteredMembers}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}