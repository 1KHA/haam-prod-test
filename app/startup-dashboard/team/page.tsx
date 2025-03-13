"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

// Mock team members data
const teamMembers = [
  {
    id: 1,
    name: "أحمد محمد",
    role: "المؤسس والرئيس التنفيذي",
    email: "ahmed@techsolutions.com",
    phone: "+966 50 123 4567",
    avatar: "أح",
    color: "bg-primary",
    status: "active"
  },
  {
    id: 2,
    name: "سارة خالد",
    role: "مطورة واجهات المستخدم",
    email: "sarah@techsolutions.com",
    phone: "+966 55 987 6543",
    avatar: "سخ",
    color: "bg-blue-500",
    status: "active"
  },
  {
    id: 3,
    name: "محمد علي",
    role: "مطور خلفية",
    email: "mohammed@techsolutions.com",
    phone: "+966 54 456 7890",
    avatar: "مع",
    color: "bg-green-500",
    status: "active"
  }
]

// Mock pending invitations
const pendingInvitations = [
  {
    id: 1,
    name: "فاطمة أحمد",
    email: "fatima@example.com",
    role: "مصممة تجربة المستخدم",
    sentAt: "منذ 2 أيام"
  },
  {
    id: 2,
    name: "خالد عبدالله",
    email: "khalid@example.com",
    role: "مدير تسويق",
    sentAt: "منذ 5 أيام"
  }
]

export default function TeamManagement() {
  const [activeTab, setActiveTab] = useState("current")
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    phone: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewMember(prev => ({ ...prev, [name]: value }))
  }

  const handleAddMember = () => {
    // In a real app, this would send an invitation and add to pending
    console.log("Sending invitation to:", newMember)
    setNewMember({ name: "", email: "", role: "", phone: "" })
    setShowAddMember(false)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>{showAddMember ? "إلغاء" : "إضافة عضو جديد"}</span>
        </Button>
        <h1 className="text-3xl font-bold">إدارة فريق العمل</h1>
      </div>

      {showAddMember && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-xl border bg-card text-card-foreground shadow">
            <CardHeader>
              <CardTitle>إضافة عضو جديد للفريق</CardTitle>
              <CardDescription>أدخل بيانات العضو الجديد لإرسال دعوة انضمام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">الاسم الكامل</label>
                  <Input
                    id="name"
                    name="name"
                    value={newMember.name}
                    onChange={handleInputChange}
                    placeholder="أدخل الاسم الكامل"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newMember.email}
                    onChange={handleInputChange}
                    placeholder="example@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">المسمى الوظيفي</label>
                  <Input
                    id="role"
                    name="role"
                    value={newMember.role}
                    onChange={handleInputChange}
                    placeholder="مثال: مطور، مصمم، مدير تسويق"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">رقم الهاتف (اختياري)</label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newMember.phone}
                    onChange={handleInputChange}
                    placeholder="+966 5X XXX XXXX"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddMember}>إرسال دعوة</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="pending">الدعوات المعلقة</TabsTrigger>
          <TabsTrigger value="current">أعضاء الفريق الحاليين</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Card className="rounded-xl border bg-card text-card-foreground shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {member.id !== 1 && (
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="text-right">
                          <h3 className="font-bold text-lg">{member.name}</h3>
                          <p className="text-muted-foreground">{member.role}</p>
                          <div className="flex items-center justify-end mt-2">
                            <span className="text-sm ml-2">{member.email}</span>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex items-center justify-end mt-1">
                            <span className="text-sm ml-2">{member.phone}</span>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className={`h-16 w-16 rounded-full ${member.color} text-white flex items-center justify-center`}>
                          <span className="text-xl font-bold">{member.avatar}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card className="rounded-xl border bg-card text-card-foreground shadow">
            <CardHeader>
              <CardTitle>الدعوات المعلقة</CardTitle>
              <CardDescription>دعوات الانضمام التي تم إرسالها ولم يتم قبولها بعد</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{invitation.name}</span>
                        <span className="text-sm text-muted-foreground">{invitation.email}</span>
                        <span className="text-sm text-muted-foreground">{invitation.role}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4 ml-1" />
                          إعادة إرسال
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <XCircle className="h-4 w-4 ml-1" />
                          إلغاء
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">تم الإرسال {invitation.sentAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="rounded-xl border bg-card text-card-foreground shadow">
        <CardHeader>
          <CardTitle>صلاحيات الفريق</CardTitle>
          <CardDescription>إدارة صلاحيات أعضاء الفريق للوصول إلى ميزات المنصة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4">العضو</th>
                  <th className="text-center py-3 px-4">إدارة الفريق</th>
                  <th className="text-center py-3 px-4">إدارة المراحل</th>
                  <th className="text-center py-3 px-4">طلبات التمويل</th>
                  <th className="text-center py-3 px-4">التقارير</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end">
                      <span className="mr-2">أحمد محمد</span>
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                        <span className="font-bold">أح</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end">
                      <span className="mr-2">سارة خالد</span>
                      <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <span className="font-bold">سخ</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end">
                      <span className="mr-2">محمد علي</span>
                      <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <span className="font-bold">مع</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
