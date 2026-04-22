"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import UsersTable from "./users-table"
import { PermissionGate } from "@/hooks/usePermissions"

export default function UsersManagement() {
  const router = useRouter()
  
  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <PermissionGate
          requirement={{ category: 'users', action: 'add' }}
        >
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => router.push("/admin-dashboard/users/new")}
          >
            <UserPlus className="h-4 w-4" />
            <span>إضافة مستخدم</span>
          </Button>
        </PermissionGate>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>قائمة المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable />
        </CardContent>
      </Card>
    </div>
  )
}
