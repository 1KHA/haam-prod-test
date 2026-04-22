"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Settings, 
  User, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Building, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DollarSign, 
  Edit, 
  Save, 
  Eye, 
  EyeOff,
  Upload,
  Briefcase,
  Target,
  Tag
} from "lucide-react"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  
  const [profile, setProfile] = useState({
    personal: {
      name: "محمد العبدالله",
      email: "m.abdullah@example.com",
      phone: "+966 55 123 4567",
      position: "مدير استثمار",
      bio: "مستثمر ذو خبرة 15 عاماً في مجال التكنولوجيا والشركات الناشئة. متخصص في استثمارات المراحل المبكرة والتمويل الأولي."
    },
    investment: {
      type: "مستثمر ملاك",
      strategy: "استثمارات المراحل المبكرة",
      minInvestment: "100,000",
      maxInvestment: "1,000,000",
      sectors: ["التكنولوجيا المالية", "الذكاء الاصطناعي", "التجارة الإلكترونية"],
      stage: ["تمويل أولي", "جولة أولى"]
    },
    preferences: {
      notifyNewOpportunities: true,
      notifyStartupUpdates: true,
      notifyFundingRounds: true,
      notifyEvents: true
    }
  })

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes logic would go here
    }
    setIsEditing(!isEditing)
  }

  const handleVisibilityToggle = () => {
    setIsPublic(!isPublic)
  }

  const handleInputChange = (section: string, field: string, value: string) => {
    setProfile({
      ...profile,
      [section]: {
        ...profile[section as keyof typeof profile],
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={isEditing ? "default" : "outline"} 
            className="flex items-center gap-2"
            onClick={handleEditToggle}
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            <span>{isEditing ? "حفظ التغييرات" : "تعديل الملف الشخصي"}</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleVisibilityToggle}
          >
            {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{isPublic ? "ملف شخصي عام" : "ملف شخصي خاص"}</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-4 relative">
                <User className="h-16 w-16 text-muted-foreground" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute bottom-0 right-0 bg-background rounded-full border"
                  disabled={!isEditing}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-bold">{profile.personal.name}</h2>
              <p className="text-muted-foreground">{profile.personal.position}</p>
              <div className="mt-4 w-full">
                <div className="flex items-center justify-between py-2 border-b">
                  <span>{profile.investment.type}</span>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span>{profile.investment.strategy}</span>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>{profile.investment.sectors.length} قطاعات</span>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 justify-end">
                  <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
                  <TabsTrigger value="investment">استراتيجية الاستثمار</TabsTrigger>
                  <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {activeTab === "personal" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الاسم</label>
                      <Input 
                        value={profile.personal.name} 
                        onChange={(e) => handleInputChange('personal', 'name', e.target.value)}
                        disabled={!isEditing}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">المنصب</label>
                      <Input 
                        value={profile.personal.position} 
                        onChange={(e) => handleInputChange('personal', 'position', e.target.value)}
                        disabled={!isEditing}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">البريد الإلكتروني</label>
                      <Input 
                        value={profile.personal.email} 
                        onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                        disabled={!isEditing}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">رقم الهاتف</label>
                      <Input 
                        value={profile.personal.phone} 
                        onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                        disabled={!isEditing}
                        className="text-right"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">نبذة شخصية</label>
                    <textarea 
                      value={profile.personal.bio} 
                      onChange={(e) => handleInputChange('personal', 'bio', e.target.value)}
                      disabled={!isEditing}
                      className="w-full min-h-[100px] p-2 border rounded-md text-right"
                    />
                  </div>
                </div>
              )}
              
              {activeTab === "investment" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">نوع المستثمر</label>
                      <select 
                        value={profile.investment.type} 
                        onChange={(e) => handleInputChange('investment', 'type', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-md text-right"
                      >
                        <option value="مستثمر ملاك">مستثمر ملاك</option>
                        <option value="رأس مال مخاطر">رأس مال مخاطر</option>
                        <option value="مؤسسة استثمارية">مؤسسة استثمارية</option>
                        <option value="مانح">مانح</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">استراتيجية الاستثمار</label>
                      <select 
                        value={profile.investment.strategy} 
                        onChange={(e) => handleInputChange('investment', 'strategy', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-md text-right"
                      >
                        <option value="استثمارات المراحل المبكرة">استثمارات المراحل المبكرة</option>
                        <option value="استثمارات النمو">استثمارات النمو</option>
                        <option value="استثمارات التوسع">استثمارات التوسع</option>
                        <option value="استثمارات متنوعة">استثمارات متنوعة</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الحد الأدنى للاستثمار (ريال)</label>
                      <Input 
                        value={profile.investment.minInvestment} 
                        onChange={(e) => handleInputChange('investment', 'minInvestment', e.target.value)}
                        disabled={!isEditing}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">الحد الأقصى للاستثمار (ريال)</label>
                      <Input 
                        value={profile.investment.maxInvestment} 
                        onChange={(e) => handleInputChange('investment', 'maxInvestment', e.target.value)}
                        disabled={!isEditing}
                        className="text-right"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">القطاعات المفضلة</label>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {profile.investment.sectors.map((sector, index) => (
                        <div key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                          {sector}
                          {isEditing && (
                            <button 
                              className="ml-2 text-red-500"
                              onClick={() => {
                                const newSectors = [...profile.investment.sectors]
                                newSectors.splice(index, 1)
                                setProfile({
                                  ...profile,
                                  investment: {
                                    ...profile.investment,
                                    sectors: newSectors
                                  }
                                })
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newSector = prompt("أدخل اسم القطاع الجديد")
                            if (newSector) {
                              setProfile({
                                ...profile,
                                investment: {
                                  ...profile.investment,
                                  sectors: [...profile.investment.sectors, newSector]
                                }
                              })
                            }
                          }}
                        >
                          + إضافة قطاع
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">مراحل الاستثمار المفضلة</label>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {profile.investment.stage.map((stage, index) => (
                        <div key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                          {stage}
                          {isEditing && (
                            <button 
                              className="ml-2 text-red-500"
                              onClick={() => {
                                const newStages = [...profile.investment.stage]
                                newStages.splice(index, 1)
                                setProfile({
                                  ...profile,
                                  investment: {
                                    ...profile.investment,
                                    stage: newStages
                                  }
                                })
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newStage = prompt("أدخل اسم المرحلة الجديدة")
                            if (newStage) {
                              setProfile({
                                ...profile,
                                investment: {
                                  ...profile.investment,
                                  stage: [...profile.investment.stage, newStage]
                                }
                              })
                            }
                          }}
                        >
                          + إضافة مرحلة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "preferences" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="notifyNewOpportunities" 
                        checked={profile.preferences.notifyNewOpportunities}
                        onChange={(e) => {
                          setProfile({
                            ...profile,
                            preferences: {
                              ...profile.preferences,
                              notifyNewOpportunities: e.target.checked
                            }
                          })
                        }}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                      <label htmlFor="notifyNewOpportunities" className="text-sm">تفعيل</label>
                    </div>
                    <div className="text-right">
                      <h3 className="font-medium">إشعارات الفرص الاستثمارية الجديدة</h3>
                      <p className="text-sm text-muted-foreground">استلام إشعارات عند توفر فرص استثمارية جديدة تناسب تفضيلاتك</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="notifyStartupUpdates" 
                        checked={profile.preferences.notifyStartupUpdates}
                        onChange={(e) => {
                          setProfile({
                            ...profile,
                            preferences: {
                              ...profile.preferences,
                              notifyStartupUpdates: e.target.checked
                            }
                          })
                        }}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                      <label htmlFor="notifyStartupUpdates" className="text-sm">تفعيل</label>
                    </div>
                    <div className="text-right">
                      <h3 className="font-medium">تحديثات الشركات الناشئة</h3>
                      <p className="text-sm text-muted-foreground">استلام تحديثات دورية عن أداء الشركات الناشئة في محفظتك</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="notifyFundingRounds" 
                        checked={profile.preferences.notifyFundingRounds}
                        onChange={(e) => {
                          setProfile({
                            ...profile,
                            preferences: {
                              ...profile.preferences,
                              notifyFundingRounds: e.target.checked
                            }
                          })
                        }}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                      <label htmlFor="notifyFundingRounds" className="text-sm">تفعيل</label>
                    </div>
                    <div className="text-right">
                      <h3 className="font-medium">جولات التمويل</h3>
                      <p className="text-sm text-muted-foreground">استلام إشعارات عند بدء جولات تمويل جديدة للشركات الناشئة</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="notifyEvents" 
                        checked={profile.preferences.notifyEvents}
                        onChange={(e) => {
                          setProfile({
                            ...profile,
                            preferences: {
                              ...profile.preferences,
                              notifyEvents: e.target.checked
                            }
                          })
                        }}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                      <label htmlFor="notifyEvents" className="text-sm">تفعيل</label>
                    </div>
                    <div className="text-right">
                      <h3 className="font-medium">الفعاليات والأحداث</h3>
                      <p className="text-sm text-muted-foreground">استلام دعوات للفعاليات وأيام العرض للشركات الناشئة</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
