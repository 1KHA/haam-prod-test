"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Phone, 
  Trash, 
  Edit, 
  Plus, 
  Save, 
  X,
  UserPlus,
  Search
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  position: string
  email: string
  phone: string
  avatar: string
  department: string
}

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  
  // Mock data for team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "أحمد محمد",
      position: "مدير البرامج",
      email: "ahmed@example.com",
      phone: "+966 50 123 4567",
      avatar: "/placeholder-avatar.jpg",
      department: "إدارة البرامج"
    },
    {
      id: "2",
      name: "سارة علي",
      position: "مديرة التسويق",
      email: "sara@example.com",
      phone: "+966 50 765 4321",
      avatar: "/placeholder-avatar.jpg",
      department: "التسويق"
    },
    {
      id: "3",
      name: "محمد خالد",
      position: "مستشار مالي",
      email: "mohammed@example.com",
      phone: "+966 50 111 2222",
      avatar: "/placeholder-avatar.jpg",
      department: "المالية"
    },
    {
      id: "4",
      name: "نورة عبدالله",
      position: "مديرة العلاقات",
      email: "noura@example.com",
      phone: "+966 50 333 4444",
      avatar: "/placeholder-avatar.jpg",
      department: "العلاقات العامة"
    },
    {
      id: "5",
      name: "فهد سعود",
      position: "مستشار قانوني",
      email: "fahad@example.com",
      phone: "+966 50 555 6666",
      avatar: "/placeholder-avatar.jpg",
      department: "الشؤون القانونية"
    }
  ])

  const [newMember, setNewMember] = useState<Omit<TeamMember, "id">>({
    name: "",
    position: "",
    email: "",
    phone: "",
    avatar: "/placeholder-avatar.jpg",
    department: ""
  })

  const departments = Array.from(new Set(teamMembers.map(member => member.department)))

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.includes(searchQuery) || 
                          member.position.includes(searchQuery) || 
                          member.email.includes(searchQuery) ||
                          member.department.includes(searchQuery)
    
    if (activeTab === "all") return matchesSearch
    return matchesSearch && member.department === activeTab
  })

  const handleAddMember = () => {
    const id = Math.random().toString(36).substring(2, 9)
    setTeamMembers([...teamMembers, { ...newMember, id }])
    setNewMember({
      name: "",
      position: "",
      email: "",
      phone: "",
      avatar: "/placeholder-avatar.jpg",
      department: ""
    })
    setIsAddingMember(false)
  }

  const handleUpdateMember = (id: string) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, ...newMember, id } : member
    ))
    setEditingMemberId(null)
  }

  const handleDeleteMember = (id: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id))
  }

  const handleEditMember = (member: TeamMember) => {
    setNewMember({
      name: member.name,
      position: member.position,
      email: member.email,
      phone: member.phone,
      avatar: member.avatar,
      department: member.department
    })
    setEditingMemberId(member.id)
  }

  const handleCancelEdit = () => {
    setEditingMemberId(null)
    setIsAddingMember(false)
    setNewMember({
      name: "",
      position: "",
      email: "",
      phone: "",
      avatar: "/placeholder-avatar.jpg",
      department: ""
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => setIsAddingMember(true)}
          className="flex items-center gap-2"
          disabled={isAddingMember || editingMemberId !== null}
        >
          <UserPlus className="h-4 w-4" />
          إضافة عضو جديد
        </Button>
        <h1 className="text-3xl font-bold">فريق العمل</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث..." 
            className="pr-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          إجمالي الأعضاء: {teamMembers.length}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          {departments.map(department => (
            <TabsTrigger key={department} value={department}>{department}</TabsTrigger>
          ))}
          <TabsTrigger value="all">جميع الأقسام</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isAddingMember && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle>إضافة عضو جديد</CardTitle>
                <CardDescription>أدخل معلومات العضو الجديد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">الاسم الكامل</Label>
                    <Input 
                      id="new-name" 
                      value={newMember.name} 
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-position">المنصب</Label>
                    <Input 
                      id="new-position" 
                      value={newMember.position} 
                      onChange={(e) => setNewMember({...newMember, position: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">البريد الإلكتروني</Label>
                    <Input 
                      id="new-email" 
                      type="email" 
                      value={newMember.email} 
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-phone">رقم الهاتف</Label>
                    <Input 
                      id="new-phone" 
                      value={newMember.phone} 
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-department">القسم</Label>
                    <Input 
                      id="new-department" 
                      value={newMember.department} 
                      onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button onClick={handleAddMember}>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className={editingMemberId === member.id ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col items-end">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.position}</CardDescription>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingMemberId === member.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-name-${member.id}`}>الاسم الكامل</Label>
                        <Input 
                          id={`edit-name-${member.id}`} 
                          value={newMember.name} 
                          onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-position-${member.id}`}>المنصب</Label>
                        <Input 
                          id={`edit-position-${member.id}`} 
                          value={newMember.position} 
                          onChange={(e) => setNewMember({...newMember, position: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-email-${member.id}`}>البريد الإلكتروني</Label>
                        <Input 
                          id={`edit-email-${member.id}`} 
                          type="email" 
                          value={newMember.email} 
                          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-phone-${member.id}`}>رقم الهاتف</Label>
                        <Input 
                          id={`edit-phone-${member.id}`} 
                          value={newMember.phone} 
                          onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-department-${member.id}`}>القسم</Label>
                        <Input 
                          id={`edit-department-${member.id}`} 
                          value={newMember.department} 
                          onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 ml-2" />
                          إلغاء
                        </Button>
                        <Button onClick={() => handleUpdateMember(member.id)}>
                          <Save className="h-4 w-4 ml-2" />
                          حفظ
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-sm">{member.email}</span>
                          <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="text-sm">{member.phone}</span>
                          <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="text-sm">{member.department}</span>
                          <User className="h-4 w-4 ml-2 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex justify-end mt-4 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">لا يوجد أعضاء في هذا القسم</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
