"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  User, 
  Mail, 
  Phone, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Briefcase, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Award, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar, 
  Save,
  Upload,
  Edit,
  Globe,
  MapPin,
  Linkedin,
  Twitter,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Github
} from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  
  const mentor = {
    name: "د. أحمد الشمري",
    title: "مستشار استراتيجي وخبير في ريادة الأعمال",
    email: "ahmed.alshammari@example.com",
    phone: "+966 50 123 4567",
    location: "الرياض، المملكة العربية السعودية",
    bio: "خبير في مجال ريادة الأعمال والابتكار مع أكثر من 15 عاماً من الخبرة في تطوير الشركات الناشئة. عملت مع أكثر من 50 شركة ناشئة في مجالات التقنية المالية، التجارة الإلكترونية، والتقنيات الصحية. حاصل على درجة الدكتوراه في إدارة الأعمال من جامعة ستانفورد.",
    expertise: [
      "استراتيجية الأعمال",
      "تطوير نماذج الأعمال",
      "التقنية المالية",
      "التجارة الإلكترونية",
      "جمع التمويل",
      "التسويق الرقمي"
    ],
    education: [
      {
        degree: "دكتوراه في إدارة الأعمال",
        institution: "جامعة ستانفورد",
        year: "2010"
      },
      {
        degree: "ماجستير في إدارة الأعمال",
        institution: "جامعة هارفارد",
        year: "2005"
      },
      {
        degree: "بكالوريوس في هندسة الحاسب",
        institution: "جامعة الملك سعود",
        year: "2002"
      }
    ],
    experience: [
      {
        position: "مستشار استراتيجي",
        company: "شركة الاستشارات العالمية",
        period: "2015 - الحالي"
      },
      {
        position: "مدير تطوير الأعمال",
        company: "شركة التقنية المتقدمة",
        period: "2010 - 2015"
      },
      {
        position: "مهندس برمجيات أول",
        company: "شركة البرمجيات العالمية",
        period: "2002 - 2010"
      }
    ],
    achievements: [
      "ساهمت في نجاح 10 شركات ناشئة في جمع تمويل بقيمة إجمالية تتجاوز 50 مليون دولار",
      "مؤلف كتاب 'استراتيجيات النجاح للشركات الناشئة' الذي تمت ترجمته إلى 5 لغات",
      "متحدث في أكثر من 30 مؤتمراً عالمياً حول ريادة الأعمال والابتكار",
      "عضو في مجلس إدارة 3 شركات تقنية ناجحة"
    ],
    preferredCommunication: [
      "البريد الإلكتروني",
      "مكالمات الفيديو",
      "الاجتماعات الشخصية"
    ],
    socialLinks: {
      linkedin: "linkedin.com/in/ahmed-alshammari",
      twitter: "twitter.com/ahmed_alshammari",
      website: "ahmedalshammari.com"
    },
    mentoringSince: "2015",
    totalSessions: 120,
    totalStartups: 25,
    rating: 4.8
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              <span>حفظ التغييرات</span>
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              <span>تعديل الملف الشخصي</span>
            </>
          )}
        </Button>
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-4">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="صورة الملف الشخصي"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <Button size="icon" variant="outline" className="rounded-full h-8 w-8 bg-white">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-3 w-full">
                  <Input 
                    defaultValue={mentor.name}
                    className="text-center font-bold text-lg"
                  />
                  <Input 
                    defaultValue={mentor.title}
                    className="text-center text-muted-foreground"
                  />
                </div>
              ) : (
                <>
                  <h2 className="font-bold text-lg">{mentor.name}</h2>
                  <p className="text-muted-foreground">{mentor.title}</p>
                </>
              )}
              
              <div className="flex justify-center mt-4 space-x-2">
                <Button variant="outline" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">معلومات الاتصال</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-right">
                  {isEditing ? (
                    <Input defaultValue={mentor.email} className="text-right" />
                  ) : (
                    <span>{mentor.email}</span>
                  )}
                </div>
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-right">
                  {isEditing ? (
                    <Input defaultValue={mentor.phone} className="text-right" />
                  ) : (
                    <span>{mentor.phone}</span>
                  )}
                </div>
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-right">
                  {isEditing ? (
                    <Input defaultValue={mentor.location} className="text-right" />
                  ) : (
                    <span>{mentor.location}</span>
                  )}
                </div>
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">إحصائيات الإرشاد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{mentor.mentoringSince}</span>
                <div className="text-right">
                  <span className="text-muted-foreground">موجه منذ</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">{mentor.totalSessions}</span>
                <div className="text-right">
                  <span className="text-muted-foreground">إجمالي الجلسات</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">{mentor.totalStartups}</span>
                <div className="text-right">
                  <span className="text-muted-foreground">الشركات الناشئة</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium">{mentor.rating}</span>
                  <span className="text-yellow-500 mr-1">★</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">متوسط التقييم</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">نبذة شخصية</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  defaultValue={mentor.bio}
                  className="min-h-[150px] text-right"
                />
              ) : (
                <p className="text-muted-foreground">{mentor.bio}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">مجالات الخبرة</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  {mentor.expertise.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <span className="text-xs">-</span>
                      </Button>
                      <Input defaultValue={item} className="text-right" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    <span>إضافة مجال خبرة</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((item, index) => (
                    <div key={index} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">الخبرات العملية</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {mentor.experience.map((exp, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <span className="text-xs">-</span>
                        </Button>
                        <Input defaultValue={exp.position} className="text-right" placeholder="المنصب" />
                      </div>
                      <div className="flex gap-2 mr-10">
                        <Input defaultValue={exp.period} className="text-right" placeholder="الفترة" />
                        <Input defaultValue={exp.company} className="text-right" placeholder="الشركة" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    <span>إضافة خبرة عملية</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mentor.experience.map((exp, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">{exp.period}</span>
                        <div className="text-right">
                          <h4 className="font-medium">{exp.position}</h4>
                          <p className="text-muted-foreground">{exp.company}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">المؤهلات العلمية</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {mentor.education.map((edu, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <span className="text-xs">-</span>
                        </Button>
                        <Input defaultValue={edu.degree} className="text-right" placeholder="الدرجة العلمية" />
                      </div>
                      <div className="flex gap-2 mr-10">
                        <Input defaultValue={edu.year} className="text-right w-24" placeholder="السنة" />
                        <Input defaultValue={edu.institution} className="text-right" placeholder="المؤسسة التعليمية" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    <span>إضافة مؤهل علمي</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mentor.education.map((edu, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">{edu.year}</span>
                        <div className="text-right">
                          <h4 className="font-medium">{edu.degree}</h4>
                          <p className="text-muted-foreground">{edu.institution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإنجازات</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  {mentor.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <span className="text-xs">-</span>
                      </Button>
                      <Input defaultValue={achievement} className="text-right" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    <span>إضافة إنجاز</span>
                  </Button>
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-2 text-right">
                  {mentor.achievements.map((achievement, index) => (
                    <li key={index} className="text-muted-foreground">{achievement}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">طرق التواصل المفضلة</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  {mentor.preferredCommunication.map((method, index) => (
                    <div key={index} className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <span className="text-xs">-</span>
                      </Button>
                      <Input defaultValue={method} className="text-right" />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    <span>إضافة طريقة تواصل</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {mentor.preferredCommunication.map((method, index) => (
                    <div key={index} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                      {method}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
