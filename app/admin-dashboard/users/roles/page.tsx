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

  // Dynamic role-permission mapping based on docs/rbac-permission-mapping.md
  // If the RBAC mapping changes, update this object accordingly.
  const rolePermissionMap = {
    ADMIN: [
      {
        category: "dashboard",
        displayName: "لوحة التحكم",
        actions: [
          { action: "view", pages: ["/admin-dashboard"] }
        ]
      },
      {
        category: "users",
        displayName: "إدارة المستخدمين",
        actions: [
          { action: "view", pages: ["/admin-dashboard/users"] },
          { action: "add", pages: ["/admin-dashboard/users (Add User)"] },
          { action: "edit", pages: ["/admin-dashboard/users (Edit User)", "/admin-dashboard/users (Roles Management)"] },
          { action: "delete", pages: ["/admin-dashboard/users (Delete User)"] }
        ]
      },
      {
        category: "programs",
        displayName: "إدارة البرامج",
        actions: [
          { action: "view", pages: ["/admin-dashboard/programs"] },
          { action: "add", pages: ["/admin-dashboard/programs"] },
          { action: "edit", pages: ["/admin-dashboard/programs"] },
          { action: "delete", pages: ["/admin-dashboard/programs"] }
        ]
      },
      {
        category: "startups",
        displayName: "إدارة الشركات الناشئة",
        actions: [
          { action: "view", pages: ["/admin-dashboard/startups"] },
          { action: "add", pages: ["/admin-dashboard/startups"] },
          { action: "edit", pages: ["/admin-dashboard/startups"] },
          { action: "delete", pages: ["/admin-dashboard/startups"] }
        ]
      },
      {
        category: "funding",
        displayName: "إدارة التمويل",
        actions: [
          { action: "view", pages: ["/admin-dashboard/funding"] },
          { action: "edit", pages: ["/admin-dashboard/funding"] }
        ]
      },
      {
        category: "payments",
        displayName: "إدارة المدفوعات",
        actions: [
          { action: "view", pages: ["/admin-dashboard/payments"] },
          { action: "edit", pages: ["/admin-dashboard/payments"] }
        ]
      },
      {
        category: "reports",
        displayName: "التقارير والتحليلات",
        actions: [
          { action: "view", pages: ["/admin-dashboard/reports"] }
        ]
      },
      {
        category: "settings",
        displayName: "الإعدادات",
        actions: [
          { action: "view", pages: ["/admin-dashboard/system", "/admin-dashboard/security"] },
          { action: "edit", pages: ["/admin-dashboard/system", "/admin-dashboard/security"] }
        ]
      },
      {
        category: "analytics",
        displayName: "التحليلات",
        actions: [
          { action: "view", pages: ["/admin-dashboard/analytics"] }
        ]
      },
      {
        category: "events",
        displayName: "الفعاليات",
        actions: [
          { action: "view", pages: ["/admin-dashboard/events"] },
          { action: "edit", pages: ["/admin-dashboard/events"] }
        ]
      },
      {
        category: "hackathons",
        displayName: "الهاكاثونات",
        actions: [
          { action: "view", pages: ["/admin-dashboard/hackathons"] },
          { action: "edit", pages: ["/admin-dashboard/hackathons"] }
        ]
      },
      {
        category: "integrations",
        displayName: "التكاملات",
        actions: [
          { action: "view", pages: ["/admin-dashboard/integrations"] },
          { action: "edit", pages: ["/admin-dashboard/integrations"] }
        ]
      },
      {
        category: "notifications",
        displayName: "الإشعارات",
        actions: [
          { action: "view", pages: ["/admin-dashboard/notifications"] },
          { action: "edit", pages: ["/admin-dashboard/notifications"] }
        ]
      }
    ],
    PROGRAM_MANAGER: [
      {
        category: "dashboard",
        displayName: "لوحة التحكم",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard"] }
        ]
      },
      {
        category: "applications",
        displayName: "الطلبات",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard/applications", "/program-manager-dashboard/selection"] },
          { action: "edit", pages: ["/program-manager-dashboard/applications", "/program-manager-dashboard/selection"] }
        ]
      },
      {
        category: "cohorts",
        displayName: "الدفعات",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard/cohorts"] },
          { action: "add", pages: ["/program-manager-dashboard/cohorts"] },
          { action: "edit", pages: ["/program-manager-dashboard/cohorts"] }
        ]
      },
      {
        category: "startups",
        displayName: "الشركات الناشئة",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard/startups", "/program-manager-dashboard/milestones", "/program-manager-dashboard/feedback"] },
          { action: "edit", pages: ["/program-manager-dashboard/startups", "/program-manager-dashboard/milestones", "/program-manager-dashboard/feedback"] }
        ]
      },
      {
        category: "mentorship",
        displayName: "الإرشاد",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard/mentors", "/program-manager-dashboard/sessions"] },
          { action: "edit", pages: ["/program-manager-dashboard/mentors", "/program-manager-dashboard/sessions"] }
        ]
      },
      {
        category: "events",
        displayName: "الفعاليات",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard/events"] },
          { action: "edit", pages: ["/program-manager-dashboard/events"] },
          { action: "add", pages: ["/program-manager-dashboard/events"] }
        ]
      },
      {
        category: "funding",
        displayName: "التمويل",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard/funding"] },
          { action: "edit", pages: ["/program-manager-dashboard/funding"] }
        ]
      },
      {
        category: "reports",
        displayName: "التقارير",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard/reports"] }
        ]
      },
      {
        category: "resources",
        displayName: "الموارد",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard/resources"] },
          { action: "edit", pages: ["/program-manager-dashboard/resources"] },
          { action: "add", pages: ["/program-manager-dashboard/resources"] }
        ]
      },
      {
        category: "discussions",
        displayName: "المناقشات",
        actions: [
          { action: "view", pages: ["/program-manager-dashboard/discussions"] },
          { action: "edit", pages: ["/program-manager-dashboard/discussions"] }
        ]
      }
    ],
    STARTUP: [
      {
        category: "dashboard",
        displayName: "لوحة التحكم",
        actions: [
          { action: "view", pages: ["/startup-dashboard"] }
        ]
      },
      {
        category: "users",
        displayName: "الفريق",
        actions: [
          { action: "view", pages: ["/startup-dashboard/team"] },
          { action: "add", pages: ["/startup-dashboard/team (Add Member)"] },
          { action: "edit", pages: ["/startup-dashboard/team (Edit Member)"] }
        ]
      },
      {
        category: "startups",
        displayName: "الشركة الناشئة",
        actions: [
          { action: "view", pages: ["/startup-dashboard/milestones"] },
          { action: "edit", pages: ["/startup-dashboard/milestones"] }
        ]
      },
      {
        category: "funding",
        displayName: "التمويل",
        actions: [
          { action: "view", pages: ["/startup-dashboard/funding"] },
          { action: "add", pages: ["/startup-dashboard/funding"] }
        ]
      },
      {
        category: "mentorship",
        displayName: "الإرشاد",
        actions: [
          { action: "view", pages: ["/startup-dashboard/mentors"] }
        ]
      },
      {
        category: "events",
        displayName: "الفعاليات",
        actions: [
          { action: "view", pages: ["/startup-dashboard/events"] }
        ]
      },
      {
        category: "resources",
        displayName: "الموارد",
        actions: [
          { action: "view", pages: ["/startup-dashboard/resources"] }
        ]
      },
      {
        category: "reports",
        displayName: "التقارير",
        actions: [
          { action: "view", pages: ["/startup-dashboard/reports"] }
        ]
      },
      {
        category: "discussions",
        displayName: "المناقشات",
        actions: [
          { action: "view", pages: ["/startup-dashboard/discussions"] },
          { action: "edit", pages: ["/startup-dashboard/discussions"] }
        ]
      }
    ],
    MENTOR: [
      {
        category: "dashboard",
        displayName: "لوحة التحكم",
        actions: [
          { action: "view", pages: ["/mentor-dashboard"] }
        ]
      },
      {
        category: "users",
        displayName: "الملف الشخصي",
        actions: [
          { action: "view", pages: ["/mentor-dashboard/profile"] },
          { action: "edit", pages: ["/mentor-dashboard/profile"] }
        ]
      },
      {
        category: "mentorship",
        displayName: "الإرشاد",
        actions: [
          { action: "view", pages: ["/mentor-dashboard/availability", "/mentor-dashboard/sessions", "/mentor-dashboard/feedback"] },
          { action: "edit", pages: ["/mentor-dashboard/availability", "/mentor-dashboard/sessions", "/mentor-dashboard/feedback"] }
        ]
      },
      {
        category: "startups",
        displayName: "الشركات الناشئة",
        actions: [
          { action: "view", pages: ["/mentor-dashboard/startups"] }
        ]
      },
      {
        category: "resources",
        displayName: "الموارد",
        actions: [
          { action: "view", pages: ["/mentor-dashboard/resources"] },
          { action: "add", pages: ["/mentor-dashboard/resources"] }
        ]
      },
      {
        category: "reports",
        displayName: "التقارير",
        actions: [
          { action: "view", pages: ["/mentor-dashboard/reports"] }
        ]
      },
      {
        category: "discussions",
        displayName: "المجتمع والمناقشات",
        actions: [
          { action: "view", pages: ["/mentor-dashboard/community", "/mentor-dashboard/discussions"] },
          { action: "edit", pages: ["/mentor-dashboard/community", "/mentor-dashboard/discussions"] }
        ]
      }
    ],
    INVESTOR: [
      {
        category: "dashboard",
        displayName: "لوحة التحكم",
        actions: [
          { action: "view", pages: ["/investor-dashboard"] }
        ]
      },
      {
        category: "startups",
        displayName: "الشركات الناشئة",
        actions: [
          { action: "view", pages: ["/investor-dashboard/discover", "/investor-dashboard/due-diligence", "/investor-dashboard/pitches", "/investor-dashboard/opportunities"] }
        ]
      },
      {
        category: "portfolio",
        displayName: "المحفظة",
        actions: [
          { action: "view", pages: ["/investor-dashboard/portfolio", "/investor-dashboard/performance"] }
        ]
      },
      {
        category: "funding",
        displayName: "التمويل",
        actions: [
          { action: "view", pages: ["/investor-dashboard/deals"] },
          { action: "add", pages: ["/investor-dashboard/deals"] },
          { action: "edit", pages: ["/investor-dashboard/deals"] }
        ]
      },
      {
        category: "events",
        displayName: "الفعاليات",
        actions: [
          { action: "view", pages: ["/investor-dashboard/events"] }
        ]
      },
      {
        category: "analytics",
        displayName: "التحليلات",
        actions: [
          { action: "view", pages: ["/investor-dashboard/analytics"] }
        ]
      },
      {
        category: "reports",
        displayName: "التقارير",
        actions: [
          { action: "view", pages: ["/investor-dashboard/reports"] }
        ]
      },
      {
        category: "discussions",
        displayName: "المناقشات",
        actions: [
          { action: "view", pages: ["/investor-dashboard/network", "/investor-dashboard/discussions"] },
          { action: "edit", pages: ["/investor-dashboard/discussions"] }
        ]
      },
      {
        category: "users",
        displayName: "الملف الشخصي",
        actions: [
          { action: "view", pages: ["/investor-dashboard/profile"] },
          { action: "edit", pages: ["/investor-dashboard/profile"] }
        ]
      }
    ],
    JUDGE: [
      {
        category: "dashboard",
        displayName: "لوحة التحكم",
        actions: [
          { action: "view", pages: ["/judge-dashboard"] }
        ]
      },
      {
        category: "evaluation",
        displayName: "التقييم",
        actions: [
          { action: "view", pages: ["/judge-dashboard/evaluate"] },
          { action: "edit", pages: ["/judge-dashboard/evaluate"] },
          { action: "add", pages: ["/judge-dashboard/evaluate (Score Submission)"] }
        ]
      }
    ],
    PARTICIPANT: [
      {
        category: "dashboard",
        displayName: "لوحة التحكم",
        actions: [
          { action: "view", pages: ["/participant-dashboard"] }
        ]
      }
    ],
    ACCELERATOR: [
      {
        category: "dashboard",
        displayName: "لوحة التحكم",
        actions: [
          { action: "view", pages: ["/accelerator-dashboard", "/accelerator-dashboard/support"] }
        ]
      },
      {
        category: "programs",
        displayName: "البرامج",
        actions: [
          { action: "view", pages: ["/accelerator-dashboard/programs"] }
        ]
      },
      {
        category: "applications",
        displayName: "الطلبات",
        actions: [
          { action: "add", pages: ["/accelerator-dashboard/apply"] }
        ]
      },
      {
        category: "startups",
        displayName: "الشركات الناشئة",
        actions: [
          { action: "view", pages: ["/accelerator-dashboard/startups"] }
        ]
      },
      {
        category: "mentorship",
        displayName: "الإرشاد",
        actions: [
          { action: "view", pages: ["/accelerator-dashboard/mentors"] }
        ]
      },
      {
        category: "funding",
        displayName: "التمويل",
        actions: [
          { action: "view", pages: ["/accelerator-dashboard/funding"] }
        ]
      },
      {
        category: "events",
        displayName: "الفعاليات",
        actions: [
          { action: "view", pages: ["/accelerator-dashboard/events"] }
        ]
      },
      {
        category: "resources",
        displayName: "الموارد",
        actions: [
          { action: "view", pages: ["/accelerator-dashboard/resources"] }
        ]
      },
      {
        category: "startups",
        displayName: "المهام",
        actions: [
          { action: "view", pages: ["/accelerator-dashboard/milestones"] }
        ]
      },
      {
        category: "users",
        displayName: "الملف الشخصي والفريق",
        actions: [
          { action: "view", pages: ["/accelerator-dashboard/profile", "/accelerator-dashboard/team"] },
          { action: "edit", pages: ["/accelerator-dashboard/profile"] }
        ]
      }
    ]
  };

  // Permission actions for icon mapping
  const permissionActions = [
    { id: "view", name: "عرض", icon: Eye },
    { id: "edit", name: "تعديل", icon: Edit },
    { id: "add", name: "إضافة", icon: Plus },
    { id: "delete", name: "حذف", icon: Trash2 }
  ];

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
    // Use ADMIN categories as the superset for all possible permissions
    (rolePermissionMap.ADMIN || []).forEach(category => {
      initialPermissions[category.category] = {};
      permissionActions.forEach(action => {
        initialPermissions[category.category][action.id] = false;
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
        (rolePermissionMap.ADMIN || []).forEach(category => {
          resetPermissions[category.category] = {};
          permissionActions.forEach(action => {
            resetPermissions[category.category][action.id] = false;
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
                  {(rolePermissionMap.ADMIN || []).map(category => (
                    <div key={category.category} className="border-b pb-4">
                      <h4 className="font-medium mb-2">{category.displayName}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {permissionActions.map(action => (
                          <div key={action.id} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox 
                              id={`new-${category.category}-${action.id}`} 
                              checked={newRolePermissions[category.category]?.[action.id] || false}
                              onCheckedChange={() => toggleNewRolePermission(category.category, action.id)}
                            />
                            <label 
                              htmlFor={`new-${category.category}-${action.id}`}
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
                  {(() => {
                    // Map Arabic/localized role names to internal keys
                    const roleNameMap: Record<string, string> = {
                      "مدير النظام": "ADMIN",
                      "مدير برنامج": "PROGRAM_MANAGER",
                      "شركة ناشئة": "STARTUP",
                      "موجه": "MENTOR",
                      "مستثمر": "INVESTOR",
                      "محكم": "JUDGE",
                      "مشارك": "PARTICIPANT",
"رائد أعمال": "ACCELERATOR"
                    };
                    const internalKey = roleNameMap[role.name] || (role.name || "").toUpperCase().replace(/\s+/g, "_");
                    const categories = rolePermissionMap[internalKey as keyof typeof rolePermissionMap];
                    if (!categories || categories.length === 0) {
                      return (
                        <div className="text-sm text-red-500 py-4">
                          لا توجد صلاحيات معرفة لهذا الدور (<span dir="ltr">{role.name}</span>)
                        </div>
                      );
                    }
                    return categories.map((category: {
                      category: string;
                      displayName: string;
                      actions: { action: string; pages: string[] }[];
                    }) => (
                      <div key={category.category} className="border-b pb-2">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex gap-2">
                            {editingRole === role.id && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 text-xs"
                                  onClick={() => grantAllPermissions(category.category)}
                                >
                                  منح الكل
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 text-xs"
                                  onClick={() => revokeAllPermissions(category.category)}
                                >
                                  إلغاء الكل
                                </Button>
                              </>
                            )}
                          </div>
                          <h4 className="font-medium">{category.displayName}</h4>
                        </div>
                        <div className="space-y-2">
                          {category.actions.map((actionObj: { action: string; pages: string[] }) => {
                            const action = permissionActions.find(a => a.id === actionObj.action);
                            const hasPermission = editingRole === role.id
                              ? editedPermissions[category.category]?.[actionObj.action] || false
                              : role.permissions[category.category]?.[actionObj.action] || false;
                            return (
                              <div key={actionObj.action} className="flex flex-col md:flex-row md:items-center md:gap-2">
                                <div className="flex items-center gap-2">
                                  {editingRole === role.id ? (
                                    <Checkbox 
                                      id={`${role.id}-${category.category}-${actionObj.action}`} 
                                      checked={hasPermission}
                                      onCheckedChange={() => toggleEditedPermission(category.category, actionObj.action)}
                                    />
                                  ) : (
                                    hasPermission ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <X className="h-4 w-4 text-red-500" />
                                    )
                                  )}
                                  <label 
                                    htmlFor={`${role.id}-${category.category}-${actionObj.action}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                                  >
                                    {action && <action.icon className="h-3 w-3" />}
                                    {action ? action.name : actionObj.action}
                                  </label>
                                </div>
                                {/* Show enabled pages/functions for this action */}
                                <div className="text-xs text-muted-foreground mt-1 md:mt-0 md:ml-4">
                                  {actionObj.pages && actionObj.pages.length > 0 && (
                                    <span>
                                      {actionObj.pages.map((page: string, idx: number) => (
                                        <span key={page}>
                                          {page}
                                          {idx < actionObj.pages.length - 1 ? "، " : ""}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
