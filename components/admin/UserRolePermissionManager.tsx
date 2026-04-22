'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Shield, User, Settings, Trash2, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

type PermissionMap = Record<string, Record<string, boolean>>;

interface RoleOption {
  id: string;
  name: string;
  description?: string | null;
  permissions?: PermissionMap | Permission[];
  permissionsCount?: number;
}

interface Permission {
  id: string;
  category: string;
  action: string;
}

interface UserRoleAssignment {
  id: string;
  name: string;
  description?: string | null;
  assignedAt?: string;
  permissionCount: number;
}

interface UserPermission {
  id: string;
  category: string;
  action: string;
  source: 'role' | 'direct';
  roleName?: string | null;
}

interface UserRolesResponseItem {
  id?: string;
  name?: string;
  description?: string | null;
  assignedAt?: string;
  permissionsCount?: number;
  permissions?: PermissionMap | Permission[];
  role?: {
    id: string;
    name: string;
    description?: string | null;
    permissions?: PermissionMap | Permission[];
    permissionsCount?: number;
  };
}

interface UserRolePermissionManagerProps {
  userId: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'مدير النظام',
  PROGRAM_MANAGER: 'مدير البرنامج',
  MENTOR: 'موجه',
  INVESTOR: 'مستثمر',
  ENTREPRENEUR: 'رائد أعمال',
};

function getRoleLabel(role: string) {
  return ROLE_LABELS[role] || role;
}

function countRolePermissions(permissions?: PermissionMap | Permission[]) {
  if (!permissions) return 0;
  if (Array.isArray(permissions)) return permissions.length;

  return Object.values(permissions).reduce((total, actions) => {
    return total + Object.values(actions).filter(Boolean).length;
  }, 0);
}

export default function UserRolePermissionManager({ userId }: UserRolePermissionManagerProps) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [userRoles, setUserRoles] = useState<UserRoleAssignment[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    if (!userId) return;

    void loadUserData();
    void loadAvailableRoles();
    void loadAvailablePermissions();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setIsLoadingData(true);

      const [userResponse, rolesResponse, permissionsResponse] = await Promise.all([
        fetch(`/api/admin/users/${userId}`, { headers: getAuthHeaders() }),
        fetch(`/api/admin/users/${userId}/roles`, { headers: getAuthHeaders() }),
        fetch(`/api/admin/users/${userId}/permissions`, { headers: getAuthHeaders() }),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
      }

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        const normalizedRoles = ((rolesData.assignedRoles || rolesData.userRoles || []) as UserRolesResponseItem[]).map((role) => ({
          id: (role.id || role.role?.id) as string,
          name: (role.name || role.role?.name) as string,
          description: role.description || role.role?.description || null,
          assignedAt: role.assignedAt as string,
          permissionCount:
            role.permissionsCount ||
            countRolePermissions(role.permissions || role.role?.permissions),
        }));
        setUserRoles(normalizedRoles);
      } else {
        setUserRoles([]);
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setUserPermissions(permissionsData.allPermissions || []);
      } else {
        setUserPermissions([]);
      }
    } catch (error) {
      console.error('Error loading user role/permission data:', error);
      toast({
        title: 'خطأ',
        description: 'تعذر تحميل بيانات الأدوار والصلاحيات.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles', { headers: getAuthHeaders() });
      if (!response.ok) {
        setAvailableRoles([]);
        return;
      }

      const data = await response.json();
      const roles = (Array.isArray(data) ? data : []).filter((role: RoleOption) => role.name !== 'Direct Permissions');
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
      setAvailableRoles([]);
    }
  };

  const loadAvailablePermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions', { headers: getAuthHeaders() });
      if (!response.ok) {
        setAvailablePermissions([]);
        return;
      }

      const data = await response.json();
      setAvailablePermissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setAvailablePermissions([]);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadUserData(), loadAvailableRoles(), loadAvailablePermissions()]);
  };

  const assignRole = async () => {
    if (!selectedRole) {
      toast({
        title: 'تنبيه',
        description: 'اختر الدور الذي تريد إسناده للمستخدم.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsMutating(true);
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roleIds: [selectedRole] }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'خطأ',
          description: error.error || 'تعذر إسناد الدور.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'تم الحفظ',
        description: 'تم إسناد الدور للمستخدم بنجاح.',
      });
      setSelectedRole('');
      await loadUserData();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'خطأ',
        description: 'تعذر إسناد الدور.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      setIsMutating(true);
      const response = await fetch(`/api/admin/users/${userId}/roles?roleIds=${roleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'خطأ',
          description: error.error || 'تعذر إزالة الدور.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'تم الحذف',
        description: 'تمت إزالة الدور من المستخدم.',
      });
      await loadUserData();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'خطأ',
        description: 'تعذر إزالة الدور.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const assignPermissions = async () => {
    if (selectedPermissions.length === 0) {
      toast({
        title: 'تنبيه',
        description: 'اختر صلاحية واحدة على الأقل قبل الحفظ.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsMutating(true);
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ permissionIds: selectedPermissions }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'خطأ',
          description: error.error || 'تعذر إسناد الصلاحيات.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'تم الحفظ',
        description: 'تم إسناد الصلاحيات المحددة للمستخدم.',
      });
      setSelectedPermissions([]);
      await loadUserData();
    } catch (error) {
      console.error('Error assigning permissions:', error);
      toast({
        title: 'خطأ',
        description: 'تعذر إسناد الصلاحيات.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const removePermission = async (permissionId: string) => {
    try {
      setIsMutating(true);
      const response = await fetch(`/api/admin/users/${userId}/permissions?permissionIds=${permissionId}&type=direct`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'خطأ',
          description: error.error || 'تعذر إزالة الصلاحية.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'تم الحذف',
        description: 'تمت إزالة الصلاحية المباشرة من المستخدم.',
      });
      await loadUserData();
    } catch (error) {
      console.error('Error removing permission:', error);
      toast({
        title: 'خطأ',
        description: 'تعذر إزالة الصلاحية.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    );
  };

  const assignableRoles = availableRoles.filter((role) => !userRoles.some((assignedRole) => assignedRole.id === role.id));
  const assignablePermissions = availablePermissions.filter(
    (permission) => !userPermissions.some((userPermission) => userPermission.id === permission.id)
  );

  if (isLoadingData && !user) {
    return (
      <Card dir="rtl">
        <CardContent className="p-6 text-center">
          <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />
          <p>جاري تحميل بيانات الأدوار والصلاحيات...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card dir="rtl">
        <CardContent className="p-6 text-center text-muted-foreground">
          تعذر تحميل بيانات المستخدم.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center justify-end gap-2">
              <User className="h-5 w-5" />
              <span>{user.name}</span>
            </CardTitle>
            <CardDescription className="break-all">
              {user.email}
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit self-start">
            {getRoleLabel(user.role)}
          </Badge>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 sm:grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="roles">إدارة الأدوار</TabsTrigger>
          <TabsTrigger value="permissions">إدارة الصلاحيات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <Shield className="h-4 w-4" />
                  <span>الأدوار المسندة ({userRoles.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {userRoles.length > 0 ? (
                    <div className="space-y-2">
                      {userRoles.map((role) => (
                        <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                          <Badge variant="secondary">دور</Badge>
                          <div className="min-w-0 flex-1 text-right">
                            <div className="font-medium">{role.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {role.permissionCount} صلاحية
                            </div>
                            {role.description ? (
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">لا توجد أدوار مسندة لهذا المستخدم.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-2">
                  <Settings className="h-4 w-4" />
                  <span>كل الصلاحيات ({userPermissions.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {userPermissions.length > 0 ? (
                    <div className="space-y-2">
                      {userPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between rounded-lg border p-3">
                          <Badge variant={permission.source === 'role' ? 'secondary' : 'default'}>
                            {permission.source === 'role' ? 'من دور' : 'مباشرة'}
                          </Badge>
                          <div className="min-w-0 flex-1 text-right">
                            <div className="font-medium" dir="ltr">
                              {permission.category}:{permission.action}
                            </div>
                            {permission.roleName ? (
                              <div className="text-sm text-muted-foreground">
                                موروثة من الدور: {permission.roleName}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">لا توجد صلاحيات لهذا المستخدم.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إسناد دور جديد</CardTitle>
              <CardDescription>يمكنك إضافة دور إضافي للمستخدم من القائمة التالية.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={assignRole} disabled={isMutating || !selectedRole} className="sm:order-1">
                  <Plus className="ml-2 h-4 w-4" />
                  إسناد الدور
                </Button>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="flex-1 text-right">
                    <SelectValue placeholder="اختر دوراً لإسناده" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.length > 0 ? (
                      assignableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name} ({role.permissionsCount ?? countRolePermissions(role.permissions)} صلاحية)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-roles-left" disabled>
                        لا توجد أدوار إضافية متاحة
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>الأدوار الحالية</CardTitle>
                <CardDescription>إزالة الدور ستسحب الصلاحيات المرتبطة به من هذا المستخدم.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={refreshAll} disabled={isLoadingData || isMutating}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
            </CardHeader>
            <CardContent>
              {userRoles.length > 0 ? (
                <div className="space-y-3">
                  {userRoles.map((role) => (
                    <div key={role.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRole(role.id)}
                        disabled={isMutating}
                        className="self-start sm:order-1"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-right">
                        <div className="font-medium">{role.name}</div>
                        {role.description ? (
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        ) : null}
                        <div className="text-sm text-blue-600">{role.permissionCount} صلاحية ضمن هذا الدور</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">لا توجد أدوار حالية لهذا المستخدم.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إسناد صلاحيات مباشرة</CardTitle>
              <CardDescription>هذه الصلاحيات تضاف للمستخدم مباشرة ولا تعتمد على الأدوار.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-56 rounded-lg border p-3">
                {assignablePermissions.length > 0 ? (
                  <div className="space-y-3">
                    {assignablePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <Label htmlFor={permission.id} className="cursor-pointer text-right font-medium" dir="ltr">
                          {permission.category}:{permission.action}
                        </Label>
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-10 text-center text-muted-foreground">لا توجد صلاحيات إضافية متاحة للإسناد حالياً.</p>
                )}
              </ScrollArea>
              <Button
                onClick={assignPermissions}
                disabled={isMutating || selectedPermissions.length === 0}
                className="w-full"
              >
                <Save className="ml-2 h-4 w-4" />
                حفظ الصلاحيات المحددة ({selectedPermissions.length})
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الصلاحيات الحالية</CardTitle>
              <CardDescription>يمكن إزالة الصلاحيات المباشرة فقط من هذه الشاشة.</CardDescription>
            </CardHeader>
            <CardContent>
              {userPermissions.length > 0 ? (
                <div className="space-y-3">
                  {userPermissions.map((permission) => (
                    <div key={permission.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 self-start sm:order-1">
                        <Badge variant={permission.source === 'role' ? 'secondary' : 'default'}>
                          {permission.source === 'role' ? 'من دور' : 'مباشرة'}
                        </Badge>
                        {permission.source === 'direct' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePermission(permission.id)}
                            disabled={isMutating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                      <div className="flex-1 text-right">
                        <div className="font-medium" dir="ltr">
                          {permission.category}:{permission.action}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {permission.source === 'role'
                            ? `موروثة من الدور: ${permission.roleName || '-'}`
                            : 'تمت إضافتها مباشرة لهذا المستخدم'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">لا توجد صلاحيات حالية لهذا المستخدم.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
