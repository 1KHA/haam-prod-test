"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Building, Mail, Phone, MapPin, Globe, Upload, Save, Edit } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  
  // Mock data for the profile
  const [profileData, setProfileData] = useState({
    personal: {
      name: "أحمد محمد",
      email: "ahmed@example.com",
      phone: "+966 50 123 4567",
      position: "مدير البرامج",
      bio: "خبرة أكثر من 10 سنوات في مجال ريادة الأعمال وتطوير الشركات الناشئة. عملت مع أكثر من 50 شركة ناشئة في مجالات مختلفة.",
      avatar: "/placeholder-avatar.jpg"
    },
    company: {
      name: "مسرع الأعمال التقني",
      email: "info@techaccelerator.com",
      phone: "+966 11 123 4567",
      website: "www.techaccelerator.com",
      address: "الرياض، المملكة العربية السعودية",
      description: "مسرع أعمال متخصص في دعم الشركات الناشئة في مجال التكنولوجيا. نقدم برامج تسريع مكثفة لمدة 3-6 أشهر، بالإضافة إلى التمويل والإرشاد والتوجيه.",
      logo: "/placeholder-logo.jpg",
      founded: "2018",
      size: "10-50 موظف",
      industry: "تكنولوجيا المعلومات"
    }
  })

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save the data to the backend
    alert("تم حفظ البيانات بنجاح")
  }

  const handleChange = (section: 'personal' | 'company', field: string, value: string) => {
    setProfileData({
      ...profileData,
      [section]: {
        ...profileData[section],
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          onClick={isEditing ? handleSave : handleEdit}
          className="flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              حفظ التغييرات
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              تعديل الملف الشخصي
            </>
          )}
        </Button>
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="company">معلومات المسرع</TabsTrigger>
          <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>المعلومات الشخصية</CardTitle>
                <CardDescription>معلوماتك الشخصية وبيانات الاتصال</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <div className="flex items-center">
                      <User className="h-4 w-4 ml-2 text-muted-foreground" />
                      <Input 
                        id="name" 
                        value={profileData.personal.name} 
                        onChange={(e) => handleChange('personal', 'name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">المنصب</Label>
                    <Input 
                      id="position" 
                      value={profileData.personal.position} 
                      onChange={(e) => handleChange('personal', 'position', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.personal.email} 
                        onChange={(e) => handleChange('personal', 'email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={profileData.personal.phone} 
                        onChange={(e) => handleChange('personal', 'phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">نبذة شخصية</Label>
                  <Textarea 
                    id="bio" 
                    rows={4} 
                    value={profileData.personal.bio} 
                    onChange={(e) => handleChange('personal', 'bio', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الصورة الشخصية</CardTitle>
                <CardDescription>صورتك الشخصية المعروضة في الملف</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <img 
                    src={profileData.personal.avatar} 
                    alt="صورة شخصية" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
                {isEditing && (
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 ml-2" />
                    تغيير الصورة
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="company">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>معلومات المسرع</CardTitle>
                <CardDescription>معلومات عن مسرع الأعمال الخاص بك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">اسم المسرع</Label>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 ml-2 text-muted-foreground" />
                      <Input 
                        id="company-name" 
                        value={profileData.company.name} 
                        onChange={(e) => handleChange('company', 'name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">البريد الإلكتروني للمسرع</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 ml-2 text-muted-foreground" />
                      <Input 
                        id="company-email" 
                        type="email" 
                        value={profileData.company.email} 
                        onChange={(e) => handleChange('company', 'email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">رقم هاتف المسرع</Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
                      <Input 
                        id="company-phone" 
                        value={profileData.company.phone} 
                        onChange={(e) => handleChange('company', 'phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-website">الموقع الإلكتروني</Label>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 ml-2 text-muted-foreground" />
                      <Input 
                        id="company-website" 
                        value={profileData.company.website} 
                        onChange={(e) => handleChange('company', 'website', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">العنوان</Label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
                      <Input 
                        id="company-address" 
                        value={profileData.company.address} 
                        onChange={(e) => handleChange('company', 'address', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-founded">سنة التأسيس</Label>
                    <Input 
                      id="company-founded" 
                      value={profileData.company.founded} 
                      onChange={(e) => handleChange('company', 'founded', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-size">حجم الفريق</Label>
                    <Input 
                      id="company-size" 
                      value={profileData.company.size} 
                      onChange={(e) => handleChange('company', 'size', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-industry">المجال</Label>
                    <Input 
                      id="company-industry" 
                      value={profileData.company.industry} 
                      onChange={(e) => handleChange('company', 'industry', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-description">وصف المسرع</Label>
                  <Textarea 
                    id="company-description" 
                    rows={4} 
                    value={profileData.company.description} 
                    onChange={(e) => handleChange('company', 'description', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>شعار المسرع</CardTitle>
                <CardDescription>شعار مسرع الأعمال الخاص بك</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  <img 
                    src={profileData.company.logo} 
                    alt="شعار المسرع" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
                {isEditing && (
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 ml-2" />
                    تغيير الشعار
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
