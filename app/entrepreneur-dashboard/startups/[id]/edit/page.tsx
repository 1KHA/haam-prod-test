"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { Upload, FileText, AlertCircle, ArrowLeft } from "lucide-react"

interface StartupFormData {
  name: string
  industry: string
  stage: string
  description: string
  problem: string
  solution: string
  targetMarket: string
  businessModel: string
  competitiveAdvantage: string
  teamSize: string
  fundingNeeds: string
  pitchDeck: File | null
}

export default function EditStartupPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPitchDeckUrl, setCurrentPitchDeckUrl] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<StartupFormData>({
    name: "",
    industry: "",
    stage: "idea",
    description: "",
    problem: "",
    solution: "",
    targetMarket: "",
    businessModel: "",
    competitiveAdvantage: "",
    teamSize: "1",
    fundingNeeds: "",
    pitchDeck: null,
  })

  const industries = [
    "تكنولوجيا المعلومات",
    "الرعاية الصحية",
    "التعليم",
    "التجارة الإلكترونية",
    "الخدمات المالية",
    "الزراعة",
    "الطاقة",
    "النقل",
    "العقارات",
    "الترفيه",
    "الأغذية والمشروبات",
    "السياحة والضيافة",
    "التصنيع",
    "البناء",
    "الاتصالات",
    "الإعلام",
    "الموارد البشرية",
    "الخدمات القانونية",
    "التسويق والإعلان",
    "أخرى"
  ]

  const stages = [
    { value: "idea", label: "فكرة" },
    { value: "prototype", label: "نموذج أولي" },
    { value: "mvp", label: "منتج قابل للحياة" },
    { value: "early_traction", label: "جذب مبكر" },
    { value: "growth", label: "نمو" },
    { value: "scale", label: "توسع" }
  ]

  useEffect(() => {
    const fetchStartupDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/startups/${params.id}`, {
        })
        
        if (response.ok) {
          const data = await response.json()
          const company = data.company
          
          setFormData({
            name: company.name,
            industry: company.industry,
            stage: company.stage,
            description: company.description,
            problem: company.problem,
            solution: company.solution,
            targetMarket: company.targetMarket || "",
            businessModel: company.businessModel || "",
            competitiveAdvantage: company.competitiveAdvantage || "",
            teamSize: company.teamSize.toString(),
            fundingNeeds: company.fundingNeeds || "",
            pitchDeck: null,
          })
          
          setCurrentPitchDeckUrl(company.pitchDeckUrl)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch company details')
        }
      } catch (err) {
        setError('An error occurred while fetching startup details')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStartupDetails()
  }, [token, params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setFormData(prev => ({ ...prev, pitchDeck: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Create form data for file upload
      const formDataToSend = new FormData()
      
      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'pitchDeck' && value !== null) {
          formDataToSend.append(key, value.toString())
        }
      })
      
      // Add file if selected
      if (selectedFile) {
        formDataToSend.append('pitchDeck', selectedFile)
      }
      
      // Send data to API
      const response = await fetch(`/api/startups/${params.id}`, {
        method: 'PUT',
        body: formDataToSend
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'حدث خطأ أثناء تحديث الشركة الناشئة')
      }
      
      // Success
      setSuccess(true)
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/entrepreneur-dashboard/startups/${params.id}`)
      }, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الشركة الناشئة')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">جاري تحميل البيانات...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          رجوع
        </Button>
        <h1 className="text-3xl font-bold">تعديل الشركة الناشئة</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 ml-2" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
          تم تحديث الشركة الناشئة بنجاح! جاري تحويلك...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الشركة الناشئة</CardTitle>
            <CardDescription>تعديل المعلومات الأساسية عن شركتك الناشئة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الشركة الناشئة</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="text-right"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">المجال</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(value) => handleSelectChange('industry', value)}
                  required
                >
                  <SelectTrigger id="industry" className="text-right">
                    <SelectValue placeholder="اختر المجال" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="text-right">
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stage">مرحلة الشركة الناشئة</Label>
                <Select 
                  value={formData.stage} 
                  onValueChange={(value) => handleSelectChange('stage', value)}
                  required
                >
                  <SelectTrigger id="stage" className="text-right">
                    <SelectValue placeholder="اختر المرحلة" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="text-right">
                    {stages.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف الشركة الناشئة</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                rows={3}
                className="text-right"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>نموذج الأعمال</CardTitle>
            <CardDescription>تعديل نموذج أعمال شركتك الناشئة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="problem">المشكلة التي تحلها</Label>
              <Textarea 
                id="problem" 
                name="problem" 
                value={formData.problem} 
                onChange={handleChange} 
                required 
                rows={3}
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="solution">الحل المقترح</Label>
              <Textarea 
                id="solution" 
                name="solution" 
                value={formData.solution} 
                onChange={handleChange} 
                required 
                rows={3}
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetMarket">السوق المستهدف</Label>
              <Textarea 
                id="targetMarket" 
                name="targetMarket" 
                value={formData.targetMarket} 
                onChange={handleChange} 
                rows={3}
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessModel">نموذج الإيرادات</Label>
              <Textarea 
                id="businessModel" 
                name="businessModel" 
                value={formData.businessModel} 
                onChange={handleChange} 
                rows={3}
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="competitiveAdvantage">الميزة التنافسية</Label>
              <Textarea 
                id="competitiveAdvantage" 
                name="competitiveAdvantage" 
                value={formData.competitiveAdvantage} 
                onChange={handleChange} 
                rows={3}
                className="text-right"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
            <CardDescription>تعديل معلومات إضافية عن شركتك الناشئة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamSize">حجم الفريق</Label>
                <Input 
                  id="teamSize" 
                  name="teamSize" 
                  type="number" 
                  min="1"
                  value={formData.teamSize} 
                  onChange={handleChange} 
                  required 
                  className="text-right"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fundingNeeds">احتياجات التمويل</Label>
                <Input 
                  id="fundingNeeds" 
                  name="fundingNeeds" 
                  value={formData.fundingNeeds} 
                  onChange={handleChange} 
                  placeholder="مثال: 500,000 ريال سعودي"
                  className="text-right"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pitchDeck">العرض التقديمي (Pitch Deck)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  id="pitchDeck"
                  className="hidden"
                  accept=".pdf,.pptx,.ppt"
                  onChange={handleFileChange}
                />
                <label htmlFor="pitchDeck" className="cursor-pointer flex flex-col items-center justify-center">
                  {selectedFile ? (
                    <>
                      <FileText className="h-10 w-10 text-blue-500 mb-2" />
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">انقر لتغيير الملف</p>
                    </>
                  ) : currentPitchDeckUrl ? (
                    <>
                      <FileText className="h-10 w-10 text-blue-500 mb-2" />
                      <p className="text-sm font-medium">تم رفع العرض التقديمي مسبقاً</p>
                      <p className="text-xs text-muted-foreground mt-1">انقر لتغيير الملف</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">انقر لرفع العرض التقديمي</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, PPT, PPTX (الحد الأقصى 10MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري التحديث..." : "تحديث الشركة الناشئة"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
