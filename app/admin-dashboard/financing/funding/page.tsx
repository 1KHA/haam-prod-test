"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { type } from "os"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  DollarSign,
  ArrowUpRight,
  PieChart,
  RefreshCw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "react-hot-toast"

// Define funding item interface
interface FundingItem {
  id: string
  title: string
  amount: string
  startupId: string
  startupName: string
  status: string
  date: string
  fundingType: string
  investorName: string
  description?: string
  createdAt?: string
  updatedAt?: string
  category?: string
  entity?: string
}

// Define funding summary interface
interface FundingSummary {
  totalFunding: number
  completedDeals: number
  pendingDeals: number
  successRate: number
  avgFundingAmount: number
}

export default function FundingManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // State for funding data and summary
  const [fundingData, setFundingData] = useState<FundingItem[]>([])
  const [fundingSummary, setFundingSummary] = useState<FundingSummary>({
    totalFunding: 0,
    completedDeals: 0,
    pendingDeals: 0,
    successRate: 0,
    avgFundingAmount: 0
  })

  // Fetch funding data on component mount
  useEffect(() => {
    const fetchFundingData = async () => {
      setIsLoading(true)
      try {
        // Build query string based on filters
        let queryParams = new URLSearchParams()
        if (statusFilter !== 'all') {
          queryParams.append('status', statusFilter)
        }
        if (searchQuery) {
          queryParams.append('search', searchQuery)
        }
        
        // Get token from localStorage
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        
        const response = await fetch(`/api/admin/financing/funding?${queryParams.toString()}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch funding data')
        }
        
        const data = await response.json()
        setFundingData(data.data || [])
        setFundingSummary(data.summary || {
          totalFunding: 0,
          completedDeals: 0,
          pendingDeals: 0,
          successRate: 0,
          avgFundingAmount: 0
        })
      } catch (error) {
        console.error('Error fetching funding data:', error)
        toast.error('حدث خطأ أثناء تحميل بيانات التمويل')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFundingData()
  }, [searchQuery, statusFilter]);

  // No need to filter here as we're doing server-side filtering
  const filteredFunding = fundingData

  const deleteFunding = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التمويل؟')) {
      return
    }
    
    try {
      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      
      const response = await fetch(`/api/admin/financing/funding/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete funding')
      }
      
      // Update the funding list after successful deletion
      setFundingData(prevData => prevData.filter(item => item.id !== id))
      toast.success('تم حذف التمويل بنجاح')
    } catch (error) {
      console.error('Error deleting funding:', error)
      toast.error('حدث خطأ أثناء حذف التمويل')
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Link href="/admin-dashboard/financing/funding/create">
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>إضافة تمويل جديد</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => {
              // Get token from localStorage
              const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
              
              // Create export URL
              const exportUrl = '/api/admin/financing/funding/export';
              
              if (token) {
                // Create a temporary link element for the download with auth
                fetch(exportUrl, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                })
                .then(response => response.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'funding-export.csv';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  
                  toast.success('تم تصدير البيانات بنجاح');
                })
                .catch(error => {
                  console.error('Error exporting data:', error);
                  toast.error('حدث خطأ أثناء تصدير البيانات');
                });
              } else {
                toast.error('غير مصرح لك بتصدير البيانات');
              }
            }}
          >
            <Download className="h-4 w-4" />
            <span>تصدير بيانات التمويل</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة التمويل</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي التمويل</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fundingSummary.totalFunding.toLocaleString()} ريال</div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+15% من العام السابق</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>صفقات التمويل</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fundingSummary.completedDeals}</div>
            <div className="text-sm text-muted-foreground mt-1">{fundingSummary.pendingDeals} صفقات معلقة</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>متوسط التمويل</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(fundingSummary.avgFundingAmount / 1000000).toFixed(1)}M ريال</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>معدل النجاح</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{fundingSummary.successRate}%</div>
            <div className="text-sm text-muted-foreground mt-1">من طلبات التمويل</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث في التمويلات..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="مكتمل">مكتمل</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="مرفوض">مرفوض</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  // Get token from localStorage
                  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                  
                  // Create export URL
                  let exportUrl = '/api/admin/financing/funding/export';
                  
                  // Add query parameters if needed
                  const queryParams = new URLSearchParams();
                  if (statusFilter !== 'all') {
                    queryParams.append('status', statusFilter);
                  }
                  if (searchQuery) {
                    queryParams.append('search', searchQuery);
                  }
                  
                  if (queryParams.toString()) {
                    exportUrl += `?${queryParams.toString()}`;
                  }
                  
                  if (token) {
                    // Create a temporary link element for the download with auth
                    fetch(exportUrl, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    .then(response => response.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'funding-export.csv';
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      toast.success('تم تصدير البيانات بنجاح');
                    })
                    .catch(error => {
                      console.error('Error exporting data:', error);
                      toast.error('حدث خطأ أثناء تصدير البيانات');
                    });
                  } else {
                    toast.error('غير مصرح لك بتصدير البيانات');
                  }
                }}
              >
                <Download className="h-4 w-4" />
                <span>تصدير</span>
              </Button>
            </div>
            <CardTitle>قائمة التمويلات ({filteredFunding.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الإجراءات</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">نوع التمويل</TableHead>
                    <TableHead className="text-right">المستثمر</TableHead>
                    <TableHead className="text-right">الشركة الناشئة</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunding.length > 0 ? (
                    filteredFunding.map((funding) => (
                      <TableRow key={funding.id}>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/admin-dashboard/financing/funding/${funding.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/financing/funding/${funding.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4 text-amber-500" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteFunding(funding.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {funding.status === "مكتمل" ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                              مكتمل
                            </Badge>
                          ) : funding.status === "قيد المراجعة" ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              قيد المراجعة
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                              مرفوض
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{funding.fundingType}</TableCell>
                        <TableCell>{funding.investorName}</TableCell>
                        <TableCell>
                          <Link href={`/admin-dashboard/startups/${funding.startupId}`} className="text-primary hover:underline">
                            {funding.startupName}
                          </Link>
                        </TableCell>
                        <TableCell>{funding.amount}</TableCell>
                        <TableCell>{funding.date}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        لا توجد بيانات تمويل مطابقة لبحثك
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع التمويل حسب النوع</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">20,000,000 ريال</span>
                </div>
                <span className="text-muted-foreground">استثمار مباشر</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-3 bg-green-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">10,000,000 ريال</span>
                </div>
                <span className="text-muted-foreground">منح</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-4 h-3 bg-purple-500 rounded-full ml-2"></div>
                  <span className="text-lg font-bold">4,500,000 ريال</span>
                </div>
                <span className="text-muted-foreground">أنواع أخرى</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إحصائيات التمويل</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-right">
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">3</span>
                <span className="text-muted-foreground">عدد المستثمرين النشطين</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">5</span>
                <span className="text-muted-foreground">الشركات الناشئة الممولة</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">8</span>
                <span className="text-muted-foreground">إجمالي طلبات التمويل</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">6.9M</span>
                <span className="text-muted-foreground">متوسط قيمة التمويل</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-base font-medium">80%</span>
                <span className="text-muted-foreground">نسبة نجاح طلبات التمويل</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
