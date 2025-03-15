"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Building, Mail, Phone, MapPin, Globe, Upload, Save, Edit, BookOpen, Briefcase } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Define types for role-specific profiles
interface AcceleratorProfile {
  organizationName?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  foundingDate?: string;
  teamSize?: number;
  industry?: string;
}

interface MentorProfile {
  expertise?: string;
  experience?: string;
  availability?: string;
  position?: string;
}

interface StartupProfile {
  companyName?: string;
  industry?: string;
  stage?: string;
  foundingDate?: string;
  website?: string;
  description?: string;
  teamSize?: number;
}

interface ProfileData {
  bio?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  position?: string; // Added position field to match the database schema
}

export default function ProfilePage() {
  const { user, token } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    personal: {
      name: "",
      email: "",
      phone: "+966 50 123 4567", // Default phone number
      position: "",
      bio: "",
      avatar: "/placeholder-avatar.jpg",
      specialization: "تقنية المعلومات", // Default specialization
      role: ""
    },
    company: {
      name: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      description: "",
      logo: "/placeholder-logo.jpg",
      founded: "",
      size: "",
      industry: ""
    }
  })

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return
      
      try {
        setIsLoading(true)
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
          console.log("User data fetched:", data) // Debug log
        } else {
          console.error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [token])

  // Initialize profile data with user data
  useEffect(() => {
    if (userData) {
      // Map role to Arabic
      const roleInArabic = mapRoleToArabic(userData.role)
      
      // Get profile data
      const profile: ProfileData = userData.profile || {}
      
      // Get role-specific profile
      let roleProfile: any = {}
      if (userData.role === 'ACCELERATOR' && userData.acceleratorProfile) {
        roleProfile = userData.acceleratorProfile as AcceleratorProfile
      } else if (userData.role === 'MENTOR' && userData.mentorProfile) {
        roleProfile = userData.mentorProfile as MentorProfile
      } else if (userData.role === 'PARTICIPANT' && userData.participantProfile) {
        roleProfile = userData.participantProfile
      } else if (userData.role === 'STARTUP' && userData.startupProfile) {
        roleProfile = userData.startupProfile as StartupProfile
      } else if (userData.role === 'INVESTOR' && userData.investorProfile) {
        roleProfile = userData.investorProfile
      } else if (userData.role === 'JUDGE' && userData.judgeProfile) {
        roleProfile = userData.judgeProfile
      } else if (userData.role === 'ADMIN' && userData.adminProfile) {
        roleProfile = userData.adminProfile
      } else if (userData.role === 'PROGRAM_MANAGER' && userData.programManagerProfile) {
        roleProfile = userData.programManagerProfile
      }
      
      setProfileData({
        personal: {
          name: userData.name || "",
          email: userData.email || "",
          phone: profile.phone || profileData.personal.phone, // Use default if not available
          position: profile.position || "", // Use position from profile
          bio: profile.bio || "",
          avatar: profile.avatar || "/placeholder-avatar.jpg",
          specialization: userData.specialization || profileData.personal.specialization, // Use default if not available
          role: roleInArabic
        },
        company: {
          name: (roleProfile as AcceleratorProfile)?.organizationName || (roleProfile as StartupProfile)?.companyName || "",
          email: (roleProfile as AcceleratorProfile)?.email || "",
          phone: (roleProfile as AcceleratorProfile)?.phone || "",
          website: (roleProfile as AcceleratorProfile)?.website || (roleProfile as StartupProfile)?.website || "",
          address: profile.address || "",
          description: (roleProfile as AcceleratorProfile)?.description || (roleProfile as StartupProfile)?.description || "",
          logo: "/placeholder-logo.jpg",
          founded: (roleProfile as AcceleratorProfile)?.foundingDate || (roleProfile as StartupProfile)?.foundingDate 
            ? new Date((roleProfile as AcceleratorProfile)?.foundingDate || (roleProfile as StartupProfile)?.foundingDate || "").getFullYear().toString() 
            : "",
          size: (roleProfile as AcceleratorProfile)?.teamSize || (roleProfile as StartupProfile)?.teamSize 
            ? `${(roleProfile as AcceleratorProfile)?.teamSize || (roleProfile as StartupProfile)?.teamSize} موظف` 
            : "",
          industry: (roleProfile as AcceleratorProfile)?.industry || (roleProfile as StartupProfile)?.industry || ""
        }
      })
      
      console.log("Profile position:", profile.position) // Debug log
    } else if (user) {
      // Fallback to auth context if API call fails
      const roleInArabic = mapRoleToArabic(user.role)
      
      setProfileData(prevData => ({
        ...prevData,
        personal: {
          ...prevData.personal,
          name: user.name || "",
          email: user.email || "",
          specialization: user.specialization || prevData.personal.specialization, // Use default if not available
          role: roleInArabic
        }
      }))
    }
  }, [userData, user])

  // Helper function to map role to Arabic
  const mapRoleToArabic = (role: string | undefined) => {
    if (!role) return ""
    
    const roleMap: Record<string, string> = {
      "ADMIN": "مدير النظام",
      "PROGRAM_MANAGER": "مدير البرنامج",
      "STARTUP": "شركة ناشئة",
      "MENTOR": "مرشد",
      "INVESTOR": "مستثمر",
      "JUDGE": "محكم",
      "PARTICIPANT": "مشارك",
      "ACCELERATOR": "رائد أعمال"
    }
    
    return roleMap[role] || role
  }

  const handleEdit = () => {
    setIsEditing(true)
    setSaveStatus(null)
  }

  const handleSave = async () => {
    setIsEditing(false)
    setSaveStatus("saving")
    
    try {
      console.log("Saving profile data:", profileData) // Debug log
      
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Profile updated successfully:", data)
        setSaveStatus("success")
        
        // Update user data with the response
        setUserData(data.user)
      } else {
        console.error("Failed to update profile")
        setSaveStatus("error")
      }
    } catch (error) {
      console.error('Error saving profile data:', error)
      setSaveStatus("error")
    }
  }

  const handleChange = (section: 'personal' | 'company', field: string, value: string) => {
    console.log(`Changing ${section}.${field} to:`, value) // Debug log
    
    setProfileData({
      ...profileData,
      [section]: {
        ...profileData[section],
        [field]: value
      }
    })
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">جاري تحميل البيانات...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
        <div className="flex items-center gap-2">
          {saveStatus === "success" && (
            <span className="text-green-600 text-sm">تم حفظ البيانات بنجاح</span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-600 text-sm">حدث خطأ أثناء حفظ البيانات</span>
          )}
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
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          {/* Company tab is hidden/disabled */}
          <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>المعلومات الشخصية</CardTitle>
                
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                <div className="space-y-2">
                    <Label htmlFor="role">الدور</Label>
                    <div className="flex items-center">
                      
                      <Input 
                        id="role" 
                        value={profileData.personal.role} 
                        disabled={true} // Role should not be editable
                        className="text-right"
                      />
                      <Briefcase className="h-4 w-4 ml-2 text-muted-foreground" />
                    </div>
                  </div>
                  
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <div className="flex items-center">
                      
                      <Input 
                        className="text-end"
                        id="name" 
                        value={profileData.personal.name} 
                        onChange={(e) => handleChange('personal', 'name', e.target.value)}
                        disabled={!isEditing}
                      />
                      <User className="h-4 w-4 ml-2 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">المنصب</Label>
                    <Input 
                      className="text-end"
                      id="position" 
                      value={profileData.personal.position} 
                      onChange={(e) => handleChange('personal', 'position', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="flex items-center">
                      
                      <Input 
                        className="text-end"
                        id="email" 
                        type="email" 
                        value={profileData.personal.email} 
                        onChange={(e) => handleChange('personal', 'email', e.target.value)}
                        disabled={!isEditing}
                      />
                      <Mail className="h-4 w-4 ml-2 text-muted-foreground text-end" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="flex items-center">
                      
                      <Input 
                        className="text-end"
                        id="phone" 
                        value={profileData.personal.phone} 
                        onChange={(e) => handleChange('personal', 'phone', e.target.value)}
                        disabled={!isEditing}
                      />
                      <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">التخصص</Label>
                    <div className="flex items-center">
                      
                      <Input 
                        id="specialization" 
                        value={profileData.personal.specialization} 
                        onChange={(e) => handleChange('personal', 'specialization', e.target.value)}
                        disabled={!isEditing}
                        className="text-right"
                      />
                      <BookOpen className="h-4 w-4 ml-2 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">نبذة شخصية</Label>
                  <Textarea 
                    className="text-end"
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

        {/* Company tab content is still defined but not accessible through the UI */}
        <TabsContent value="company" className="hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>معلومات المسرع</CardTitle>
                
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
                        disabled={true}
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
                        disabled={true}
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
                        disabled={true}
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
                        disabled={true}
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
                        disabled={true}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-founded">سنة التأسيس</Label>
                    <Input 
                      id="company-founded" 
                      value={profileData.company.founded} 
                      onChange={(e) => handleChange('company', 'founded', e.target.value)}
                      disabled={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-size">حجم الفريق</Label>
                    <Input 
                      id="company-size" 
                      value={profileData.company.size} 
                      onChange={(e) => handleChange('company', 'size', e.target.value)}
                      disabled={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-industry">المجال</Label>
                    <Input 
                      id="company-industry" 
                      value={profileData.company.industry} 
                      onChange={(e) => handleChange('company', 'industry', e.target.value)}
                      disabled={true}
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
                    disabled={true}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>شعار الشركة</CardTitle>
                
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  <img 
                    src={profileData.company.logo} 
                    alt="شعار الشركة" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
