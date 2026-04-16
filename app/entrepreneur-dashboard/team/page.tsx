"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { User, Mail, Phone, UserPlus, Eye, EyeOff, Copy, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { PermissionGate } from "@/hooks/usePermissions"
import { Button } from "@/components/ui/button"
import { UserRole } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface CompanyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  profile?: {
    phone?: string;
    avatar?: string;
    position?: string;
    department?: string;
    [key: string]: any;
  } | null;
}

interface Invitation {
  id: string;
  inviteeEmail: string;
  status: string;
  createdAt: string;
}

export default function TeamPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  // Create member dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "Member" });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch entrepreneur's companies and set companyId
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const response = await fetch("/api/startups", {
        });
        if (response.ok) {
          const data = await response.json();
          if (data.companies && data.companies.length > 0) {
            setCompanyId(data.companies[0].id);
          } else {
            setError("لم يتم العثور على شركة لهذا المستخدم.");
          }
        } else {
          setError("فشل في جلب بيانات الشركة.");
        }
      } catch (err) {
        setError("حدث خطأ أثناء جلب بيانات الشركة.");
      }
    };
    fetchCompanyId();
  }, [token]);

  // Fetch company members and invitations
  useEffect(() => {
    const fetchMembers = async () => {
      if (!companyId) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/company/${companyId}/members`, {
        });
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members);
          setInvitations(data.invitations);
        } else {
          setError("فشل في جلب بيانات الفريق.");
        }
      } catch (err) {
        setError("حدث خطأ أثناء جلب بيانات الفريق.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, [token, companyId]);

  const handleInvite = async () => {
    if (!inviteEmail || !companyId) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/company/${companyId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "خطأ", description: data.error || "فشل في إرسال الدعوة", variant: "destructive" });
      } else {
        toast({ title: "تم الإرسال", description: `تم إرسال الدعوة إلى ${inviteEmail}` });
        setInvitations(prev => [...prev, data.invitation]);
        setShowInviteDialog(false);
        setInviteEmail("");
      }
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء إرسال الدعوة", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const handleCreateMember = async () => {
    if (!createForm.name || !createForm.email || !createForm.password || !companyId) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/company/${companyId}/create-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "خطأ", description: data.error || "فشل في إنشاء الحساب", variant: "destructive" });
      } else {
        setCreatedCredentials({ name: createForm.name, email: createForm.email, password: createForm.password });
        // Refresh members list
        const membersRes = await fetch(`/api/company/${companyId}/members`, {
        });
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData.members);
        }
        setCreateForm({ name: "", email: "", password: "", role: "Member" });
      }
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء إنشاء الحساب", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyField = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      (member.name && member.name.includes(searchQuery)) ||
      (member.email && member.email.includes(searchQuery)) ||
      (member.role && member.role.includes(searchQuery));
    return matchesSearch;
  });

  return (
    <RouteGuard
      requiredPermission={{ category: 'users', action: 'view' }}
      requiredRole={UserRole.ENTREPRENEUR}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">فريق العمل</h1>
          <PermissionGate
            requirement={{ category: 'users', action: 'add' }}
          >
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="ml-2 h-4 w-4" />
                دعوة عبر البريد
              </Button>
              <Button onClick={() => { setCreatedCredentials(null); setShowCreateDialog(true); }}>
                <UserPlus className="ml-2 h-4 w-4" />
                إنشاء حساب عضو
              </Button>
            </div>
          </PermissionGate>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center">
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <UserPlus className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              className="pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            إجمالي الأعضاء: {members.length}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">الأعضاء الحاليون</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">لا يوجد أعضاء في الفريق</p>
            </div>
          ) : (
            <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-start", "rtl-grid")}>
              {filteredMembers.map((member) => (
                <Card key={member.id} className="w-full">
                  <CardHeader className="pb-2 flex flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      <img
                        src={member.profile?.avatar || "https://via.placeholder.com/150"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <div className="text-sm text-muted-foreground">{member.role}</div>
                      {member.profile?.position && (
                        <div className="text-xs">{member.profile.position}</div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-right rtl-info">
                      <div className="flex items-center justify-start">
                        <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="text-sm">{member.email}</span>
                      </div>
                      {member.profile?.phone && (
                        <div className="flex items-center justify-start">
                          <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span className="text-sm">{member.profile.phone}</span>
                        </div>
                      )}
                      {member.profile?.department && (
                        <div className="flex items-center justify-start">
                          <User className="h-4 w-4 ml-2 text-muted-foreground" />
                          <span className="text-sm">{member.profile.department}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 mt-8">الدعوات المعلقة</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-16">
              <p>جاري تحميل الدعوات...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">لا توجد دعوات معلقة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-start">
              {invitations.map((inv) => (
                <Card key={inv.id} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-lg">دعوة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div>
                        <span className="font-semibold">البريد الإلكتروني:</span> {inv.inviteeEmail}
                      </div>
                      <div>
                        <span className="font-semibold">الحالة:</span> {inv.status}
                      </div>
                      <div>
                        <span className="font-semibold">تاريخ الإرسال:</span> {new Date(inv.createdAt).toLocaleString("ar-EG")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <style jsx global>{`
          .rtl-grid {
            direction: rtl;
          }
          .rtl-info {
            direction: rtl;
          }
        `}</style>
      </div>

      {/* Create Member Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) setCreatedCredentials(null); }}>
        <DialogContent>
          <div dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء حساب عضو</DialogTitle>
            </DialogHeader>
            {createdCredentials ? (
              <div className="space-y-4 py-2">
                <p className="text-sm text-muted-foreground">تم إنشاء الحساب بنجاح. احتفظ ببيانات الدخول لمشاركتها مع العضو.</p>
                {[
                  { label: "الاسم", field: "name", value: createdCredentials.name },
                  { label: "البريد الإلكتروني", field: "email", value: createdCredentials.email },
                  { label: "كلمة المرور", field: "password", value: createdCredentials.password },
                ].map(({ label, field, value }) => (
                  <div key={field} className="space-y-1">
                    <Label>{label}</Label>
                    <div className="flex gap-2 items-center">
                      <Input value={value} readOnly className="flex-1" />
                      <Button size="icon" variant="outline" onClick={() => handleCopyField(field, value)}>
                        {copiedField === field ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
                <DialogFooter>
                  <Button onClick={() => { setShowCreateDialog(false); setCreatedCredentials(null); }}>إغلاق</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="create-name">الاسم <span className="text-red-500">*</span></Label>
                  <Input
                    id="create-name"
                    placeholder="اسم العضو"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">البريد الإلكتروني <span className="text-red-500">*</span></Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="example@email.com"
                    value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">كلمة المرور <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={createForm.password}
                      onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                      className="pl-10"
                    />
                    <button
                      type="button"
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(p => !p)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role">الدور</Label>
                  <Input
                    id="create-role"
                    placeholder="Member"
                    value={createForm.role}
                    onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}
                  />
                </div>
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
                  <Button
                    onClick={handleCreateMember}
                    disabled={creating || !createForm.name || !createForm.email || !createForm.password}
                  >
                    {creating ? "جاري الإنشاء..." : "إنشاء الحساب"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <div dir="rtl">
          <DialogHeader>
            <DialogTitle>دعوة عضو جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">البريد الإلكتروني <span className="text-red-500">*</span></Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="example@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>إلغاء</Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
              {inviting ? "جاري الإرسال..." : "إرسال الدعوة"}
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </RouteGuard>
  );
}
