"use client"

import { useState, useEffect } from "react"
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
import { showAdminToast } from "@/components/admin/admin-toaster"

interface Permission {
  id: string
  category: string
  action: string
}

interface RolePermission {
  id: string
  roleId: string
  permissionId: string
  permission: Permission
}

interface Role {
  id: string
  name: string
  description: string | null
  usersCount: number
  permissions: Record<string, Record<string, boolean>>
  createdAt: string
  updatedAt: string
}

export default function RolesPermissions() {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [showAddRole, setShowAddRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [newRolePermissions, setNewRolePermissions] = useState<Record<string, Record<string, boolean>>>({})
  const [editedPermissions, setEditedPermissions] = useState<Record<string, Record<string, boolean>>>({})
  const [token, setToken] = useState<string | null>(null)

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

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Initialize new role permissions
  useEffect(() => {
    const initialPermissions: Record<string, Record<string, boolean>> = {};
    
    permissionCategories.forEach(category => {
      initialPermissions[category.id] = {};
      
      permissionActions.forEach(action => {
        initialPermissions[category.id][action.id] = false;
      });
    });
    
    setNewRolePermissions(initialPermissions);
  }, []);

  // Fetch roles from API
  const fetchRoles = async () => {
    if (!token) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let url = '/api/admin/roles';
      
      if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch roles:', errorData.error);
        showAdminToast({
          title: "خطأ",
          description: "فشل في جلب الأدوار",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في جلب الأدوار",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchRoles();
    }
  }, [token]);

  // Handle search
  const handleSearch = () => {
    fetchRoles();
  };

  // Handle add role
  const handleAddRole = async () => {
    if (!token) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!newRoleName) {
      showAdminToast({
        title: "خطأ",
        description: "اسم الدور مطلوب",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDescription,
          permissions: newRolePermissions
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        showAdminToast({
          title: "تم بنجاح",
          description: "تم إضافة الدور بنجاح"
        });
        
        setShowAddRole(false);
        setNewRoleName("");
        setNewRoleDescription("");
        
        // Reset permissions
        const resetPermissions: Record<string, Record<string, boolean>> = {};
        
        permissionCategories.forEach(category => {
          resetPermissions[category.id] = {};
          
          permissionActions.forEach(action => {
            resetPermissions[category.id][action.id] = false;
          });
        });
        
        setNewRolePermissions(resetPermissions);
        
        // Refresh roles
        fetchRoles();
      } else {
        const errorData = await response.json();
        showAdminToast({
          title: "خطأ",
          description: errorData.error || "فشل في إضافة الدور",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding role:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في إضافة الدور",
        variant: "destructive"
      });
    }
  };

  // Handle delete role
  const handleDeleteRole = async (roleId: string) => {
    if (!token) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        showAdminToast({
          title: "تم بنجاح",
          description: "تم حذف الدور بنجاح"
        });
        
        // Refresh roles
        fetchRoles();
      } else {
        const errorData = await response.json();
        showAdminToast({
          title: "خطأ",
          description: errorData.error || "فشل في حذف الدور",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في حذف الدور",
        variant: "destructive"
      });
    }
  };

  // Start editing role
  const startEditingRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      setEditedPermissions({...role.permissions});
      setEditingRole(roleId);
    }
  };

  // Save edited role
  const saveEditedRole = async (roleId: string) => {
    if (!token) {
      showAdminToast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive"
      });
      return;
    }

    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: role.name,
          description: role.description,
          permissions: editedPermissions
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        showAdminToast({
          title: "تم بنجاح",
          description: "تم تحديث الدور بنجاح"
        });
        
        setEditingRole(null);
        
        // Refresh roles
        fetchRoles();
      } else {
        const errorData = await response.json();
        showAdminToast({
          title: "خطأ",
          description: errorData.error || "فشل في تحديث الدور",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showAdminToast({
        title: "خطأ",
        description: "فشل في تحديث الدور",
        variant: "destructive"
      });
    }
  };

  // Toggle permission for new role
  const toggleNewRolePermission = (category: string, action: string) => {
    setNewRolePermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [action]: !prev[category][action]
      }
    }));
  };

  // Toggle permission for edited role
  const toggleEditedPermission = (category: string, action: string) => {
    setEditedPermissions(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [action]: !(prev[category] && prev[category][action])
      }
    }));
  };

  // Grant all permissions for a category
  const grantAllPermissions = (category: string) => {
    setEditedPermissions(prev => {
      const newPermissions = {...prev};
      
      if (!newPermissions[category]) {
        newPermissions[category] = {};
      }
      
      permissionActions.forEach(action => {
        newPermissions[category][action.id] = true;
      });
      
      return newPermissions;
    });
  };

  // Revoke all permissions for a category
  const revokeAllPermissions = (category: string) => {
    setEditedPermissions(prev => {
      const newPermissions = {...prev};
      
      if (!newPermissions[category]) {
        newPermissions[category] = {};
      }
      
      permissionActions.forEach(action => {
        newPermissions[category][action.id] = false;
      });
      
      return newPermissions;
    });
  };

  // Filter roles based on search query
  const filteredRoles = roles.filter(role => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        role.name.toLowerCase().includes(query) ||
        (role.description && role.description.toLowerCase().includes(query))
      );
    }
    return true;
  });

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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
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
                            <Checkbox 
                              id={`new-${category.id}-${action.id}`} 
                              checked={newRolePermissions[category.id]?.[action.id] || false}
                              onCheckedChange={() => toggleNewRolePermission(category.id, action.id)}
                            />
                            <label 
                              htmlFor={`new-${category.id}-${action.id}`}
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
                <Button onClick={handleAddRole}>
                  إضافة الدور
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <p>جاري التحميل...</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <p>لا توجد أدوار مطابقة للبحث</p>
        </div>
      ) : (
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
                        <Button variant="default" size="sm" onClick={() => saveEditedRole(role.id)}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => startEditingRole(role.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)}>
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
                <div className="mb-4 flex justify-start">
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
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-xs"
                                onClick={() => grantAllPermissions(category.id)}
                              >
                                منح الكل
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-xs"
                                onClick={() => revokeAllPermissions(category.id)}
                              >
                                إلغاء الكل
                              </Button>
                            </>
                          )}
                        </div>
                        <h4 className="font-medium">{category.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {permissionActions.map(action => {
                          // Get permission value
                          const hasPermission = editingRole === role.id
                            ? editedPermissions[category.id]?.[action.id] || false
                            : role.permissions[category.id]?.[action.id] || false;
                          
                          return (
                            <div key={action.id} className="flex items-center justify-start gap-2">
                              {editingRole === role.id ? (
                                <Checkbox 
                                  id={`${role.id}-${category.id}-${action.id}`} 
                                  checked={hasPermission}
                                  onCheckedChange={() => toggleEditedPermission(category.id, action.id)}
                                />
                              ) : (
                                hasPermission ? (
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
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
