"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Award, UserCheck, Mail, Phone } from "lucide-react"

interface Mentor {
  id: string
  name: string
  email: string
  mentorProfile?: {
    expertise?: string
    experience?: string
    availability?: string
  }
  profile?: {
    bio?: string
    phone?: string
    avatar?: string
  }
}

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [availabilityFilter, setAvailabilityFilter] = useState("all")

  useEffect(() => {
    // Token is now in HTTP-only cookie, credentials: "include" sends it automatically
  const token = null; // Cookie-based auth - no localStorage token needed
    fetch("/api/mentor", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMentors(data.mentors || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mentor.mentorProfile?.expertise || "").toLowerCase().includes(searchQuery.toLowerCase())

    if (availabilityFilter === "available")
      return matchesSearch && mentor.mentorProfile?.availability === "متاح"
    if (availabilityFilter === "unavailable")
      return matchesSearch && mentor.mentorProfile?.availability !== "متاح"

    return matchesSearch
  })

  const availableCount = mentors.filter(
    (m) => m.mentorProfile?.availability === "متاح"
  ).length

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right">
      <h1 className="text-3xl font-bold">تعيين الموجهين</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Award className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{mentors.length}</div>
            <p className="text-muted-foreground">إجمالي الموجهين</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <UserCheck className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold">{availableCount}</div>
            <p className="text-muted-foreground">موجهين متاحين</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  className="pl-3 pr-9 w-full md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={availabilityFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAvailabilityFilter("all")}
                >
                  الكل
                </Button>
                <Button
                  variant={availabilityFilter === "available" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAvailabilityFilter("available")}
                >
                  متاحين
                </Button>
                <Button
                  variant={availabilityFilter === "unavailable" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAvailabilityFilter("unavailable")}
                >
                  غير متاحين
                </Button>
              </div>
            </div>
            <CardTitle>الموجهين ({filteredMentors.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMentors.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {mentors.length === 0 ? "لا يوجد موجهون مسجلون في النظام" : "لا توجد نتائج مطابقة للبحث"}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredMentors.map((mentor) => (
                <div key={mentor.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {mentor.mentorProfile?.availability && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              mentor.mentorProfile.availability === "متاح"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {mentor.mentorProfile.availability}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg">{mentor.name}</h3>
                    </div>

                    {mentor.profile?.bio && (
                      <p className="text-muted-foreground mb-3">{mentor.profile.bio}</p>
                    )}

                    {mentor.mentorProfile?.expertise && (
                      <div className="mb-3">
                        <div className="text-sm text-muted-foreground mb-1">مجالات الخبرة</div>
                        <p className="text-sm">{mentor.mentorProfile.expertise}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{mentor.email}</span>
                        </div>
                        {mentor.profile?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{mentor.profile.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
