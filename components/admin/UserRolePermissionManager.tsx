'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Shield, User, Settings, Trash2, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  category: string;
  action: string;
}

interface UserRole {
  id: string;
  role: Role;
  assignedAt: string;
}

interface UserPermission {
  id: string;
  category: string;
  action: string;
  source: 'role' | 'direct';
  roleName?: string;
}

interface UserRolePermissionManagerProps {
  userId: string;
}

export default function UserRolePermissionManager({ userId }: UserRolePermissionManagerProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Load user data and permissions
  useEffect(() => {
    if (userId) {
      loadUserData();
      loadAvailableRoles();
      loadAvailablePermissions();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user basic info
      const userResponse = await fetch(`/api/admin/users/${userId}`, { headers: getAuthHeaders() });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      // Load user roles
      const rolesResponse = await fetch(`/api/admin/users/${userId}/roles`, { headers: getAuthHeaders() });
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setUserRoles(rolesData.userRoles || []);
      }

      // Load user permissions
      const permissionsResponse = await fetch(`/api/admin/users/${userId}/permissions`, { headers: getAuthHeaders() });
      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setUserPermissions(permissionsData.allPermissions || []);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles', { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadAvailablePermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions', { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setAvailablePermissions(data);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const assignRole = async () => {
    if (!selectedRole) {
      toast({
        title: 'Error',
        description: 'Please select a role to assign',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roleIds: [selectedRole] }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role assigned successfully',
        });
        setSelectedRole('');
        loadUserData(); // Refresh data
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to assign role',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/roles?roleIds=${roleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role removed successfully',
        });
        loadUserData(); // Refresh data
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to remove role',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const assignPermissions = async () => {
    if (selectedPermissions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select permissions to assign',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ permissionIds: selectedPermissions }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Permissions assigned successfully',
        });
        setSelectedPermissions([]);
        loadUserData(); // Refresh data
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to assign permissions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error assigning permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removePermission = async (permissionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/permissions?permissionIds=${permissionId}&type=direct`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Permission removed successfully',
        });
        loadUserData(); // Refresh data
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to remove permission',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error removing permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove permission',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Loading user data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user.name}
          </CardTitle>
          <CardDescription>
            {user.email} • Default Role: <Badge variant="outline">{user.role}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs for different management sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Manage Roles</TabsTrigger>
          <TabsTrigger value="permissions">Manage Permissions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Assigned Roles ({userRoles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  {userRoles.length > 0 ? (
                    <div className="space-y-2">
                      {userRoles.map((ur) => (
                        <div key={ur.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{ur.role.name}</div>
                            <div className="text-sm text-gray-500">
                              {ur.role.permissions?.length || 0} permissions
                            </div>
                          </div>
                          <Badge variant="secondary">Role</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No roles assigned</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Current Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  All Permissions ({userPermissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  {userPermissions.length > 0 ? (
                    <div className="space-y-2">
                      {userPermissions.map((perm) => (
                        <div key={perm.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{perm.category}:{perm.action}</div>
                            {perm.roleName && (
                              <div className="text-sm text-gray-500">via {perm.roleName}</div>
                            )}
                          </div>
                          <Badge variant={perm.source === 'role' ? 'secondary' : 'default'}>
                            {perm.source}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No permissions assigned</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roles Management Tab */}
        <TabsContent value="roles" className="space-y-6">
          {/* Assign New Role */}
          <Card>
            <CardHeader>
              <CardTitle>Assign Role</CardTitle>
              <CardDescription>Assign a new role to this user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a role to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.filter(role => !userRoles.some(ur => ur.role.id === role.id)).map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} ({role.permissions?.length || 0} permissions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={assignRole} disabled={loading || !selectedRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Roles with Remove Option */}
          <Card>
            <CardHeader>
              <CardTitle>Current Roles</CardTitle>
              <CardDescription>Manage assigned roles for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {userRoles.length > 0 ? (
                <div className="space-y-3">
                  {userRoles.map((ur) => (
                    <div key={ur.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{ur.role.name}</div>
                        <div className="text-sm text-gray-500">
                          {ur.role.description}
                        </div>
                        <div className="text-sm text-blue-600">
                          {ur.role.permissions?.length || 0} permissions included
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeRole(ur.role.id)}
                        disabled={loading}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No roles assigned to this user</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Management Tab */}
        <TabsContent value="permissions" className="space-y-6">
          {/* Assign Direct Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Assign Direct Permissions</CardTitle>
              <CardDescription>Assign specific permissions directly to this user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-48 border rounded p-3">
                <div className="space-y-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <Label
                        htmlFor={permission.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.category}:{permission.action}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button 
                onClick={assignPermissions} 
                disabled={loading || selectedPermissions.length === 0}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Assign Selected Permissions ({selectedPermissions.length})
              </Button>
            </CardContent>
          </Card>

          {/* Current Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Current Permissions</CardTitle>
              <CardDescription>All permissions for this user (role-based and direct)</CardDescription>
            </CardHeader>
            <CardContent>
              {userPermissions.length > 0 ? (
                <div className="space-y-3">
                  {userPermissions.map((perm) => (
                    <div key={perm.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{perm.category}:{perm.action}</div>
                        <div className="text-sm text-gray-500">
                          Source: {perm.source === 'role' ? `Role (${perm.roleName})` : 'Direct assignment'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={perm.source === 'role' ? 'secondary' : 'default'}>
                          {perm.source}
                        </Badge>
                        {perm.source === 'direct' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removePermission(perm.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No permissions assigned to this user</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
