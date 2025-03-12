"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Check,
  X
} from "lucide-react"

export default function RolesPermissions() {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [showAddRole, setShowAddRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")

  // Sample roles data
  const roles = [
    {
      id: "1",
      name: "مدير النظام",
      description: "وصول كامل إلى جميع ميزات النظام وإعداداته",
      usersCount: 3,
      permissions: {
        dashboard: { view: true, edit: true },
        users: { view: true, edit: true, delete: true, add: true },
        programs: { view: true, edit: true, delete: true, add: true },
        startups: { view: true, edit: true, delete: true, add: true },
        funding: { view: true, edit: true, delete: true, add: true },
        payments: { view: true, edit: true, delete: true, add: true },
        reports: { view: true, edit: true, delete: true, add: true },
        settings: { view: true, edit: true }
      }
    },
    {
      id: "2",
      name: "مدير برنامج",
      description: "إدارة برامج المسرعات والحاضنات والشركات الناشئة المشاركة",
      usersCount: 12,
      permissions: {
        dashboard: { view: true, edit: false },
        users: { view: true, edit: false, delete: false, add: false },
        programs: { view: true, edit: true, delete: false, add: false },
        startups: { view: true, edit: true, delete: false, add: true },
        funding: { view: true, edit: false, delete: false, add: false },
        payments: { view: false, edit: false, delete: false, add: false },
        reports: { view: true, edit: false, delete: false, add: false },
        settings: { view: false, edit: false }
      }
    },
    {
      id: "3",
      name: "مستثمر",
      description: "عرض الشركات الناشئة وتقديم التمويل",
      usersCount: 49,
      permissions: {
        dashboard: { view: true, edit: false },
        users: { view: false, edit: false, delete: false, add: false },
        programs: { view: true, edit: false, delete: false, add: false },
        startups: { view: true, edit: false, delete: false, add: false },
        funding: { view: true, edit: true, delete: false, add: true },
        payments: { view: true, edit: false, delete: false, add: false },
        reports: { view: true, edit: false, delete: false, add: false },
        settings: { view: false, edit: false }
      }
    },
    {
      id: "4",
      name: "موجه",
      description: "تقديم الإرشاد والتوجيه للشركات الناشئة",
      usersCount: 215,
      permissions: {
        dashboard: { view: true, edit: false },
        users: { view: false, edit: false, delete: false, add: false },
        programs: { view: true, edit: false, delete: false, add: false },
        startups: { view: true, edit: false, delete: false, add: false },
        funding: { view: false, edit: false, delete: false, add: false },
        payments: { view: false, edit: false, delete: false, add: false },
        reports: { view: true, edit: false, delete: false, add: false },
        settings: { view: false, edit: false }
      }
    },
    {
      id: "5",
      name: "مؤسس شركة ناشئة",
      description: "إدارة الشركة الناشئة والوصول إلى الموارد والتمويل",
      usersCount: 850,
      permissions: {
        dashboard: { view: true, edit: false },
        users: { view: false, edit: false, delete: false, add: false },
        programs: { view: true, edit: false, delete: false, add: false },
        startups: { view: false, edit: false, delete: false, add: false },
        funding: { view: true, edit: false, delete: false, add: true },
        payments: { view: true, edit: false, delete: false, add: false },
        reports: { view: true, edit: false, delete: false, add: false },
        settings: { view: false, edit: false }
      }
    },
    {
      id: "6",
      name: "محكم",
      description: "تقييم الشركات الناشئة في الهاكاثونات والمسابقات",
      usersCount: 105,
      permissions: {
        dashboard: { view: true, edit: false },
        users: { view: false, edit: false, delete: false, add: false },
        programs: { view: false, edit: false, delete: false, add: false },
        startups: { view: true, edit: false, delete: false, add: false },
        funding: { view: false, edit: false, delete: false, add: false },
        payments: { view: false, edit: false, delete: false, add: false },
        reports: { view: true, edit: false, delete: false, add: false },
        settings: { view: false, edit: false }
      }
    }
  ]

  // Filter roles based on search query
  const filteredRoles = roles.filter(role => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Permission categories and actions
  const permissionCategories = [
    { id: "dashboard", name: "لوحة التحكم" },
    { id: "users", name: "إدارة المستخدمين" },
    { id: "programs", name: "إدارة البرامج" },
    { id: "startups", name: "إدارة الشركات الناشئة" },
    { id: "funding", name: "إدارة التمويل" },
    { id: "payments", name: "إدارة المدفوعات" },
    { id: "reports", name: "التقارير والتحليلات" },
    { id: "settings", name: "الإعدادات" }
  ]

  const permissionActions = [
    { id: "view", name: "عرض", icon: Eye },
    { id: "edit", name: "تعديل", icon: Edit },
    { id: "add", name: "إضافة", icon: Plus },
    { id: "delete", name: "حذف", icon: Trash2 }
  ]

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button 
          variant="default" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setShowAddRole(true)}
        >
          <Plus className="h-4 w-4" />
          <span>إضافة دور جديد</span>
        </Button>
        <h1 className="text-3xl font-bold">الأدوار والصلاحيات</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث عن دور..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {showAddRole && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة دور جديد</CardTitle>
            <CardDescription>أدخل معلومات الدور الجديد وحدد الصلاحيات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم الدور</label>
                  <Input 
                    value={newRoleName} 
                    onChange={(e) => setNewRoleName(e.target.value)} 
                    placeholder="أدخل اسم الدور"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">وصف الدور</label>
                  <Input 
                    value={newRoleDescription} 
                    onChange={(e) => setNewRoleDescription(e.target.value)} 
                    placeholder="أدخل وصف الدور"
                  />
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">الصلاحيات</h3>
                <div className="space-y-4">
                  {permissionCategories.map(category => (
                    <div key={category.id} className="border-b pb-4">
                      <h4 className="font-medium mb-2">{category.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {permissionActions.map(action => (
                          <div key={action.id} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox id={`${category.id}-${action.id}`} />
                            <label 
                              htmlFor={`${category.id}-${action.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                            >
                              <action.icon className="h-3 w-3" />
                              {action.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-start gap-2">
                <Button variant="outline" onClick={() => setShowAddRole(false)}>
                  إلغاء
                </Button>
                <Button>
                  إضافة الدور
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRoles.map(role => (
          <Card key={role.id} className={editingRole === role.id ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  {editingRole === role.id ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setEditingRole(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button variant="default" size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setEditingRole(role.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {role.name}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-end">
                <span className="text-sm text-muted-foreground">
                  {role.usersCount} مستخدم بهذا الدور
                </span>
              </div>

              <div className="space-y-4">
                {permissionCategories.map(category => (
                  <div key={category.id} className="border-b pb-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-2">
                        {editingRole === role.id && (
                          <>
                            <Button variant="outline" size="sm" className="h-6 text-xs">
                              منح الكل
                            </Button>
                            <Button variant="outline" size="sm" className="h-6 text-xs">
                              إلغاء الكل
                            </Button>
                          </>
                        )}
                      </div>
                      <h4 className="font-medium">{category.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {permissionActions.map(action => {
                        // Skip if the permission doesn't exist for this category
                        if (!role.permissions[category.id] || 
                            role.permissions[category.id][action.id] === undefined) {
                          return null
                        }
                        
                        return (
                          <div key={action.id} className="flex items-center justify-end gap-2">
                            {editingRole === role.id ? (
                              <Checkbox 
                                id={`${role.id}-${category.id}-${action.id}`} 
                                checked={role.permissions[category.id][action.id]}
                              />
                            ) : (
                              role.permissions[category.id][action.id] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )
                            )}
                            <label 
                              htmlFor={`${role.id}-${category.id}-${action.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                            >
                              <action.icon className="h-3 w-3" />
                              {action.name}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
