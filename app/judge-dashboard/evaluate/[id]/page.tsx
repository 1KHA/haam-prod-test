"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft,
  Star,
  Download,
  ExternalLink,
  Github,
  Video,
  FileText,
  Code
} from "lucide-react"
import Link from "next/link"

export default function EvaluateProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id
  
  // Mock data for the project
  const project = {
    id: projectId,
    teamName: "فريق AI Innovators",
    projectName: "نظام ذكاء اصطناعي للكشف المبكر عن الأمراض",
    hackathon: "هاكاثون التقنية المالية",
    deadline: "7 أبريل 2025",
    description: "نظام يستخدم تقنيات الذكاء الاصطناعي والتعلم الآلي لتحليل البيانات الطبية واكتشاف علامات الأمراض في مراحلها المبكرة، مما يساعد في التشخيص المبكر وتحسين فرص العلاج.",
    members: [
      { name: "أحمد محمد", role: "مطور الذكاء الاصطناعي" },
      { name: "سارة علي", role: "مطورة واجهة المستخدم" },
      { name: "خالد عبدالله", role: "مهندس البيانات" },
      { name: "نورة سعد", role: "مديرة المشروع" }
    ],
    links: {
      github: "https://github.com/ai-innovators/early-disease-detection",
      demo: "https://ai-innovators-demo.com",
      video: "https://youtube.com/watch?v=demo123",
      presentation: "/files/presentation.pdf"
    }
  }

  // Evaluation criteria
  const criteria = [
    { id: 1, name: "الابتكار والإبداع", description: "مدى ابتكار وإبداع الفكرة وتميزها عن الحلول الموجودة", maxScore: 25 },
    { id: 2, name: "التنفيذ التقني", description: "جودة التنفيذ التقني والبرمجي للمشروع", maxScore: 25 },
    { id: 3, name: "تجربة المستخدم", description: "سهولة الاستخدام وجودة واجهة المستخدم", maxScore: 20 },
    { id: 4, name: "الأثر والفائدة", description: "مدى تأثير المشروع وفائدته للمجتمع أو القطاع المستهدف", maxScore: 20 },
    { id: 5, name: "العرض التقديمي", description: "جودة العرض التقديمي وشرح المشروع", maxScore: 10 }
  ]

  // State for scores and feedback
  const [scores, setScores] = useState<Record<number, number>>({})
  const [feedback, setFeedback] = useState("")
  
  // Calculate total score
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const maxTotalScore = criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0)
  
  // Handle score change
  const handleScoreChange = (criterionId: number, score: number, maxScore: number) => {
    if (score >= 0 && score <= maxScore) {
      setScores({ ...scores, [criterionId]: score })
    }
  }
  
  // Handle submit
  const handleSubmit = () => {
    // In a real application, this would send the evaluation to the server
    console.log("Submitting evaluation:", { projectId, scores, totalScore, feedback })
    
    // Navigate back to the dashboard
    router.push("/judge-dashboard")
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex justify-between items-center">
        <Link href="/judge-dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>العودة</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">تقييم المشروع</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المشروع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{project.projectName}</h2>
                  <p className="text-muted-foreground">{project.teamName}</p>
                </div>
                <div>
                  <h3 className="font-medium">الوصف</h3>
                  <p>{project.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">أعضاء الفريق</h3>
                  <ul className="space-y-1 mt-2">
                    {project.members.map((member, index) => (
                      <li key={index} className="flex justify-between">
                        <span className="text-muted-foreground">{member.role}</span>
                        <span>{member.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium">روابط المشروع</h3>
                  <div className="flex flex-wrap justify-end gap-4 mt-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                      <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        <span>العرض التجريبي</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                      <a href={project.links.video} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4" />
                        <span>فيديو المشروع</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                      <a href={project.links.presentation} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                        <span>العرض التقديمي</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>معلومات الهاكاثون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">اسم الهاكاثون</p>
                  <p className="font-medium">{project.hackathon}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الموعد النهائي للتقييم</p>
                  <p className="font-medium">{project.deadline}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معايير التقييم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="border-r-4 border-primary pr-4 py-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={criterion.maxScore}
                      value={scores[criterion.id] || 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScoreChange(criterion.id, parseInt(e.target.value), criterion.maxScore)}
                      className="w-16 h-10 text-center border rounded-md"
                    />
                    <span className="text-muted-foreground">/ {criterion.maxScore}</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{criterion.name}</h3>
                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{totalScore}</div>
            <div className="text-muted-foreground">/ {maxTotalScore}</div>
          </div>
          <div className="font-bold">المجموع</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ملاحظات وتعليقات</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={feedback}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
            placeholder="أضف ملاحظاتك وتعليقاتك على المشروع هنا..."
            className="min-h-32 text-right"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push("/judge-dashboard")}>إلغاء</Button>
        <Button onClick={handleSubmit}>إرسال التقييم</Button>
      </div>
    </div>
  )
}
