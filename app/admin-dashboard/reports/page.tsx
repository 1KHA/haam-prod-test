"use client"

import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { exportPresets } from "@/lib/export-utils"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Download, 
  Printer,
  FileText,
  BarChart, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Layers,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  RefreshCw,
  ChevronDown,
  Mail,
  FileSpreadsheet
} from "lucide-react"

export default function ReportsManagement() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("month")
  
  // Helper function to convert dateRange to actual date objects
  const getDateRangeValues = (rangeType: string) => {
    const now = new Date()
    const endDate = new Date()
    let startDate = new Date()
    
    switch(rangeType) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1) // Default to month
    }
    
    return {
      start: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      end: endDate.toISOString().split('T')[0]
    }
  }
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  
  // Added state for API data and loading
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states for upload and filter functionality
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedScheduleReport, setSelectedScheduleReport] = useState<string | null>(null)
  const [scheduleData, setScheduleData] = useState({
    publishDate: '',
    publishTime: '09:00',
    notifyUsers: true,
    recurring: false,
    recurrencePattern: 'monthly'
  })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [filterOptions, setFilterOptions] = useState({
    category: "",
    status: "",
    format: "",
    dateFrom: "",
    dateTo: "",
    createdBy: ""
  })
  
  const [statistics, setStatistics] = useState({
    totalReports: 0,
    publishedReports: 0,
    draftReports: 0,
    scheduledReports: 0,
    totalDownloads: 0,
    mostDownloadedReport: null as any
  })

  // Function to update statistics based on fetched reports
  const updateStatistics = (reports: any[]) => {
    // Ensure reports is an array and not empty
    if (!Array.isArray(reports) || reports.length === 0) {
      setStatistics({
        totalReports: 0,
        publishedReports: 0,
        draftReports: 0,
        scheduledReports: 0,
        totalDownloads: 0,
        mostDownloadedReport: null
      })
      return
    }
    
    // Process reports with valid data
    const validReports = reports.filter(r => r !== null && r !== undefined)
    
    const totalReports = validReports.length
    const publishedReports = validReports.filter(r => r.status === 'published' || r.status === 'منشور').length
    const draftReports = validReports.filter(r => r.status === 'draft' || r.status === 'مسودة').length
    const scheduledReports = validReports.filter(r => r.status === 'scheduled' || r.status === 'مجدول').length
    const totalDownloads = validReports.reduce((sum, r) => sum + (r.downloadCount || 0), 0)
    
    // Calculate mostDownloadedReport safely
    let mostDownloadedReport = null
    if (validReports.length > 0) {
      // Find the report with the highest download count
      mostDownloadedReport = validReports.reduce((prev, current) => {
        // Handle missing downloadCount properties
        const prevCount = prev.downloadCount || 0
        const currentCount = current.downloadCount || 0
        
        return prevCount > currentCount ? prev : current
      }, validReports[0])
    }
    
    setStatistics({
      totalReports,
      publishedReports,
      draftReports,
      scheduledReports,
      totalDownloads,
      mostDownloadedReport
    })
  }

  // API functions to interact with the backend
  const fetchReports = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Add date range parameters based on the selected range
      const dateRangeValues = getDateRangeValues(dateRange)
      
      // Build query parameters based on filters
      let queryParams = new URLSearchParams()
      
      // Add date range parameters
      queryParams.append('dateFrom', dateRangeValues.start)
      queryParams.append('dateTo', dateRangeValues.end)
      
      if (searchQuery) {
        queryParams.append('search', searchQuery)
      }
      
      // Map tab to appropriate filter with more inclusive status values
      // Using both Arabic and English values to handle potential mismatches
      if (activeTab === "published") queryParams.append('status', 'published,منشور')
      if (activeTab === "draft") queryParams.append('status', 'draft,مسودة')
      if (activeTab === "scheduled") queryParams.append('status', 'scheduled,مجدول')
      if (activeTab === "financial") queryParams.append('category', 'مالي,التمويل')
      if (activeTab === "programs") queryParams.append('category', 'أداء البرامج,التوجيه')
      if (activeTab === "startups") queryParams.append('category', 'الشركات الناشئة')
      
      // Add debug logging for query parameters
      console.log('Query parameters:', queryParams.toString())
      
      const response = await fetchWithAuth(`/api/admin/reports?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache' // Prevent caching
        }
      }, 'direct')
      
      let data
      
      // Check if response is a standard Response object
      if (response instanceof Response) {
        if (!response.ok) {
          throw new Error('Failed to fetch reports')
        }
        
        data = await response.json()
      } else {
        // Handling for ApiResponse<any> type
        data = response
      }
      
      // Add logging to debug response format
      console.log('API Response:', data)
      
      // Check if data.reports exists and is an array
      if (!data.reports || !Array.isArray(data.reports)) {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response format')
      }
      
      setReports(data.reports)
      
      // Update statistics
      updateStatistics(data.reports)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setError('Failed to load reports. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to handle exporting reports
  const handleExport = async () => {
    try {
      // Build filter parameters based on current state
      const filters: Record<string, string> = {};
      
      // Add date range parameters based on the selected range
      const dateRangeValues = getDateRangeValues(dateRange);
      filters.dateFrom = dateRangeValues.start;
      filters.dateTo = dateRangeValues.end;
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      // Map activeTab to API parameters
      if (activeTab === "published") filters.status = "published,منشور";
      if (activeTab === "draft") filters.status = "draft,مسودة";
      if (activeTab === "scheduled") filters.status = "scheduled,مجدول";
      if (activeTab === "financial") filters.category = "مالي,التمويل";
      if (activeTab === "programs") filters.category = "أداء البرامج,التوجيه";
      if (activeTab === "startups") filters.category = "الشركات الناشئة";
      
      // Add selected reports IDs if any
      if (selectedReports.length > 0) {
        filters.ids = selectedReports.join(',');
      }
      
      // Use the export utility with automatic delimiter detection
      await exportPresets.reports(filters);
    } catch (error) {
      console.error('Error exporting reports:', error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء تصدير التقارير", variant: "destructive" });
    }
  }
  
  // Function to handle printing reports
  const handlePrint = (reportId: string) => {
    const token = localStorage.getItem('token')
    window.open(`/api/admin/reports/print?id=${reportId}&token=${encodeURIComponent(token || '')}`, '_blank')
  }
  
  // Function to handle viewing a report
  const handleView = async (reportId: string) => {
    try {
      const token = localStorage.getItem('token')
      
      // First fetch the report details to get the file path
      const response = await fetchWithAuth(`/api/admin/reports/view?id=${reportId}&skipViewIncrement=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      }, 'direct')
      
      let data: any

      if (!response.ok) {
        throw new Error('Failed to fetch report details')
      }
      
      data = await response.json()
      
      if (!data || !data.report || !data.report.filePath) {
        throw new Error('Report file not found')
      }
      
      // Then open the download endpoint in a new tab with token for authentication
      window.open(`/api/admin/reports/download?id=${reportId}&token=${encodeURIComponent(token || '')}`, '_blank')
    } catch (error) {
      console.error('Error viewing report:', error)
      toast({ title: "خطأ", description: "حدث خطأ أثناء عرض التقرير", variant: "destructive" })
    }
  }
  
  // Function to handle file upload
  const handleUpload = async () => {
    if (!uploadFile) return
    
    try {
      setUploadProgress(0)
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('title', uploadFile.name.split('.')[0])
      
      // Create a mock progress update
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 200)
      
      const response = await fetchWithAuth('/api/admin/reports/upload', {
        method: 'POST',
        body: formData,
      }, 'direct')
      
      clearInterval(progressInterval)
      
      if (!response.ok) {
        throw new Error('Failed to upload report')
      }
      
      setUploadProgress(100)
      
      // Reset the form and close modal after successful upload
      setTimeout(() => {
        setUploadFile(null)
        setUploadProgress(0)
        setShowUploadModal(false)
        // Refresh data
        fetchReports()
      }, 1000)
      
    } catch (error) {
      console.error('Error uploading report:', error)
      setError('Failed to upload report. Please try again.')
      setUploadProgress(0)
    }
  }
  
  // Function to handle advanced filtering
  const applyFilters = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Build query parameters based on filter options
      let queryParams = new URLSearchParams()
      
      if (filterOptions.category) queryParams.append('category', filterOptions.category)
      if (filterOptions.status) queryParams.append('status', filterOptions.status)
      if (filterOptions.format) queryParams.append('format', filterOptions.format)
      if (filterOptions.dateFrom) queryParams.append('dateFrom', filterOptions.dateFrom)
      if (filterOptions.dateTo) queryParams.append('dateTo', filterOptions.dateTo)
      if (filterOptions.createdBy) queryParams.append('createdBy', filterOptions.createdBy)
      
      const response = await fetchWithAuth(`/api/admin/reports/filter?${queryParams.toString()}`, {}, 'direct')
      
      let data
      
      // Check if response is a standard Response object or ApiResponse
      if (response instanceof Response) {
        if (!response.ok) {
          throw new Error('Failed to filter reports')
        }
        
        data = await response.json()
      } else {
        // Handling for ApiResponse<any> type
        data = response
      }
      
      setReports(data.reports)
      
      // Update statistics based on filtered reports
      updateStatistics(data.reports)
      
      // Close the filter modal
      setShowFilterModal(false)
    } catch (error) {
      console.error('Error filtering reports:', error)
      setError('Failed to filter reports. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to handle report sharing
  const handleShare = async (reportId: string, userIds: string[]) => {
    try {
      const response = await fetchWithAuth('/api/admin/reports/share', {
        method: 'POST',
        body: JSON.stringify({
          reportId,
          userIds,
          message: 'تمت مشاركة هذا التقرير معك'
        })
      }, 'direct')
      
      if (!response.ok) {
        throw new Error('Failed to share report')
      }
      
      // Optionally show success notification
      toast({ title: "تم", description: "تمت مشاركة التقرير بنجاح" })
    } catch (error) {
      console.error('Error sharing report:', error)
      toast({ title: "خطأ", description: "حدث خطأ أثناء مشاركة التقرير", variant: "destructive" })
    }
  }
  
  // Function to handle updating report data
  const handleUpdate = async (reportId: string, newData: any) => {
    try {
      const response = await fetchWithAuth(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify(newData)
      }, 'direct')
      
      if (!response.ok) {
        throw new Error('Failed to update report')
      }
      
      // Refresh data
      fetchReports()
    } catch (error) {
      console.error('Error updating report:', error)
    }
  }
  
  // Function to refresh data
  const refreshData = () => {
    fetchReports()
  }
  
  // Fetch reports when tab, search query, or date range changes
  useEffect(() => {
    fetchReports()
  }, [activeTab, searchQuery, dateRange])
  
  // Legacy sample data for comparison - to be removed
  const sampleReports = [
    { 
      id: "1", 
      title: "تقرير أداء المسرعات - الربع الأول 2025", 
      category: "أداء البرامج", 
      format: "PDF",
      status: "منشور", 
      date: "12 مارس 2025",
      time: "10:15:22",
      createdBy: "أحمد محمد",
      downloadCount: 85,
      size: "2.4 MB",
      description: "تقرير شامل عن أداء برامج المسرعات خلال الربع الأول من عام 2025، يتضمن مؤشرات الأداء الرئيسية والإنجازات والتحديات."
    },
    { 
      id: "2", 
      title: "تقرير التمويل الاستثماري - فبراير 2025", 
      category: "التمويل", 
      format: "XLSX",
      status: "منشور", 
      date: "5 مارس 2025",
      time: "14:30:45",
      createdBy: "محمد القحطاني",
      downloadCount: 120,
      size: "1.8 MB",
      description: "تحليل مفصل لصفقات التمويل الاستثماري خلال شهر فبراير 2025، يشمل توزيع الاستثمارات حسب القطاع والمرحلة وحجم الصفقات."
    },
    { 
      id: "3", 
      title: "تقرير نمو الشركات الناشئة - الربع الرابع 2024", 
      category: "الشركات الناشئة", 
      format: "PDF",
      status: "منشور", 
      date: "28 فبراير 2025",
      time: "09:20:15",
      createdBy: "سارة العتيبي",
      downloadCount: 95,
      size: "3.2 MB",
      description: "تقرير تحليلي عن نمو الشركات الناشئة خلال الربع الرابع من عام 2024، يتضمن مؤشرات النمو والتوظيف والإيرادات والتحديات."
    },
    { 
      id: "4", 
      title: "تقرير المستخدمين النشطين - يناير 2025", 
      category: "المستخدمين", 
      format: "PDF",
      status: "منشور", 
      date: "15 فبراير 2025",
      time: "16:45:30",
      createdBy: "نورة السعيد",
      downloadCount: 65,
      size: "1.5 MB",
      description: "تحليل لنشاط المستخدمين على المنصة خلال شهر يناير 2025، يشمل معدلات الاستخدام والتفاعل والمشاركة حسب نوع المستخدم."
    },
    { 
      id: "5", 
      title: "تقرير الفعاليات والورش - الربع الأول 2025", 
      category: "الفعاليات", 
      format: "PPTX",
      status: "مسودة", 
      date: "15 مارس 2025",
      time: "09:00:00",
      createdBy: "فهد العنزي",
      downloadCount: 0,
      size: "4.7 MB",
      description: "تقرير عن الفعاليات وورش العمل المنفذة خلال الربع الأول من عام 2025، يتضمن إحصائيات المشاركة والتقييمات والتوصيات."
    },
    { 
      id: "6", 
      title: "تقرير أداء المنصة - فبراير 2025", 
      category: "تقني", 
      format: "PDF",
      status: "مسودة", 
      date: "20 مارس 2025",
      time: "11:30:00",
      createdBy: "عبدالله الشمري",
      downloadCount: 0,
      size: "2.1 MB",
      description: "تقرير فني عن أداء المنصة خلال شهر فبراير 2025، يشمل معدلات الاستجابة وأوقات التحميل والأعطال والتحسينات المقترحة."
    },
    { 
      id: "7", 
      title: "تقرير التوجيه والإرشاد - الربع الأول 2025", 
      category: "التوجيه", 
      format: "PDF",
      status: "مجدول", 
      date: "31 مارس 2025",
      time: "08:00:00",
      createdBy: "النظام",
      downloadCount: 0,
      size: "0 KB",
      description: "تقرير عن برامج التوجيه والإرشاد خلال الربع الأول من عام 2025، يتضمن إحصائيات الجلسات والتقييمات والنتائج."
    },
    { 
      id: "8", 
      title: "تقرير الأداء المالي - الربع الأول 2025", 
      category: "مالي", 
      format: "XLSX",
      status: "مجدول", 
      date: "5 أبريل 2025",
      time: "09:00:00",
      createdBy: "النظام",
      downloadCount: 0,
      size: "0 KB",
      description: "تقرير مالي شامل عن الربع الأول من عام 2025، يتضمن الإيرادات والمصروفات والميزانية والتوقعات المالية."
    }
  ]

  // Filter reports based on active tab, search query, and date range
  const filteredReports = isLoading ? [] : reports.filter(report => {
    // Check if report is valid before filtering
    if (!report) return false
    
    // Handle potential missing properties
    const status = report.status || ""
    const category = report.category || ""
    
    // Map API status values to display values if needed
    const statusMapping: Record<string, string> = {
      'published': 'منشور',
      'draft': 'مسودة',
      'scheduled': 'مجدول'
    }
    
    // Use mapped status if available
    const displayStatus = statusMapping[status] || status
    
    // Filter by tab
    if (activeTab === "published" && displayStatus !== "منشور") return false
    if (activeTab === "draft" && displayStatus !== "مسودة") return false
    if (activeTab === "scheduled" && displayStatus !== "مجدول") return false
    if (activeTab === "financial" && category !== "مالي" && category !== "التمويل") return false
    if (activeTab === "programs" && category !== "أداء البرامج" && category !== "التوجيه") return false
    if (activeTab === "startups" && category !== "الشركات الناشئة") return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        report.title.toLowerCase().includes(query) ||
        report.category.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query)
      )
    }

    return true
  })

  const toggleReportSelection = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId))
    } else {
      setSelectedReports([...selectedReports, reportId])
    }
  }

  const selectAllReports = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(filteredReports.map(report => report.id))
    }
  }

  // Statistics are already calculated and stored in the statistics state
  // No need to recalculate here

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setShowUploadModal(true)}
            disabled={isLoading}
          >
            <FileText className="h-4 w-4" />
            <span>تحميل</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleExport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => {
              if (selectedReports.length === 1) {
                handlePrint(selectedReports[0])
              } else {
                toast({ title: "تنبيه", description: "الرجاء تحديد تقرير واحد للطباعة" })
              }
            }}
            disabled={isLoading || selectedReports.length !== 1}
          >
            <Printer className="h-4 w-4" />
            <span>طباعة</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => {
              if (selectedReports.length === 1) {
                // In a real implementation, we would show a sharing modal here
                handleShare(selectedReports[0], ['user1', 'user2'])
              } else {
                toast({ title: "تنبيه", description: "الرجاء تحديد تقرير واحد للمشاركة" })
              }
            }}
            disabled={isLoading || selectedReports.length !== 1}
          >
            <Share2 className="h-4 w-4" />
            <span>مشاركة</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={refreshData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>تحديث</span>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">إدارة التقارير</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي التقارير</span>
              <FileText className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{statistics.totalReports}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {statistics.publishedReports} منشور • {statistics.draftReports} مسودة • {statistics.scheduledReports} مجدول
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>إجمالي التنزيلات</span>
              <Download className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{statistics.totalDownloads}</div>
                <div className="flex items-center mt-2 text-green-600">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>+15% من الشهر السابق</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>التقارير المجدولة</span>
              <Calendar className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{statistics.scheduledReports}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {reports.find(r => r.status === "scheduled")?.publishDate 
                    ? new Date(reports.find(r => r.status === "scheduled")?.publishDate).toLocaleDateString('ar-SA')
                    : "لا يوجد"
                  }
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>الأكثر تنزيلاً</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : statistics.mostDownloadedReport ? (
              <>
                <div className="text-lg font-bold truncate" title={statistics.mostDownloadedReport.title}>
                  {statistics.mostDownloadedReport.title}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {statistics.mostDownloadedReport.downloadCount} تنزيل
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">لا توجد تقارير</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث في التقارير..." 
              className="pl-3 pr-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-xl font-bold mb-4 text-right">تحميل تقرير جديد</h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => document.getElementById('fileUpload')?.click()}>
                <input 
                  type="file" 
                  id="fileUpload" 
                  className="hidden" 
                  accept=".pdf,.xlsx,.pptx,.docx"
                  onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                />
                {uploadFile ? (
                  <div className="space-y-2">
                    <p>{uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <p>انقر لتحديد ملف أو اسحبه وأفلته هنا</p>
                    <p className="text-sm text-muted-foreground">PDF, XLSX, PPTX, DOCX (أقصى حجم: 10MB)</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploadProgress > 0}
                >
                  {uploadProgress > 0 ? 'جاري التحميل...' : 'تحميل'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-full">
            <h3 className="text-xl font-bold mb-4 text-right">جدولة التقرير</h3>
            
            <div className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ النشر</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-md"
                    value={scheduleData.publishDate}
                    onChange={(e) => setScheduleData({...scheduleData, publishDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">وقت النشر</label>
                  <input 
                    type="time" 
                    className="w-full p-2 border rounded-md"
                    value={scheduleData.publishTime}
                    onChange={(e) => setScheduleData({...scheduleData, publishTime: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="notifyUsers"
                  checked={scheduleData.notifyUsers}
                  onChange={(e) => setScheduleData({...scheduleData, notifyUsers: e.target.checked})}
                />
                <label htmlFor="notifyUsers" className="text-sm">إشعار المستخدمين عند النشر</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="recurring"
                  checked={scheduleData.recurring}
                  onChange={(e) => setScheduleData({...scheduleData, recurring: e.target.checked})}
                />
                <label htmlFor="recurring" className="text-sm">تكرار النشر</label>
              </div>
              
              {scheduleData.recurring && (
                <div>
                  <label className="block text-sm font-medium mb-1">نمط التكرار</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={scheduleData.recurrencePattern}
                    onChange={(e) => setScheduleData({...scheduleData, recurrencePattern: e.target.value})}
                  >
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="biweekly">كل أسبوعين</option>
                    <option value="monthly">شهري</option>
                    <option value="quarterly">ربع سنوي</option>
                  </select>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (!selectedScheduleReport) return;
                      
                      // Format the data for the API
                      const schedulingData = {
                        status: 'scheduled',
                        publishDate: scheduleData.publishDate,
                        scheduledTime: scheduleData.publishTime,
                        notifyUsers: scheduleData.notifyUsers,
                        isRecurring: scheduleData.recurring,
                        recurrencePattern: scheduleData.recurring ? scheduleData.recurrencePattern : null
                      };
                      
                      await handleUpdate(selectedScheduleReport, schedulingData);
                      
                      setShowScheduleModal(false);
                      toast({ title: "تم", description: "تم تحديث جدولة التقرير بنجاح" });
                    } catch (error) {
                      console.error('Error updating schedule:', error);
                      toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث الجدولة", variant: "destructive" });
                    }
                  }}
                >
                  حفظ الجدولة
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-full">
            <h3 className="text-xl font-bold mb-4 text-right">تصفية متقدمة</h3>
            
            <div className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">التصنيف</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={filterOptions.category}
                    onChange={(e) => setFilterOptions({...filterOptions, category: e.target.value})}
                  >
                    <option value="">الكل</option>
                    <option value="أداء البرامج">أداء البرامج</option>
                    <option value="التمويل">التمويل</option>
                    <option value="الشركات الناشئة">الشركات الناشئة</option>
                    <option value="المستخدمين">المستخدمين</option>
                    <option value="الفعاليات">الفعاليات</option>
                    <option value="تقني">تقني</option>
                    <option value="التوجيه">التوجيه</option>
                    <option value="مالي">مالي</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">الحالة</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={filterOptions.status}
                    onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value})}
                  >
                    <option value="">الكل</option>
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                    <option value="scheduled">مجدول</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">التنسيق</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={filterOptions.format}
                    onChange={(e) => setFilterOptions({...filterOptions, format: e.target.value})}
                  >
                    <option value="">الكل</option>
                    <option value="PDF">PDF</option>
                    <option value="XLSX">XLSX</option>
                    <option value="PPTX">PPTX</option>
                    <option value="DOCX">DOCX</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">المنشئ</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md"
                    value={filterOptions.createdBy}
                    onChange={(e) => setFilterOptions({...filterOptions, createdBy: e.target.value})}
                    placeholder="اسم المنشئ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">من تاريخ</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-md"
                    value={filterOptions.dateFrom}
                    onChange={(e) => setFilterOptions({...filterOptions, dateFrom: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">إلى تاريخ</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-md"
                    value={filterOptions.dateTo}
                    onChange={(e) => setFilterOptions({...filterOptions, dateTo: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilterModal(false)}
                >
                  إلغاء
                </Button>
                <div className="space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterOptions({
                        category: "",
                        status: "",
                        format: "",
                        dateFrom: "",
                        dateTo: "",
                        createdBy: ""
                      })
                    }}
                  >
                    إعادة تعيين
                  </Button>
                  <Button
                    onClick={applyFilters}
                    disabled={isLoading}
                  >
                    تطبيق
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          <p>{error}</p>
          <button 
            className="underline mt-2 text-sm"
            onClick={refreshData}
          >
            محاولة مرة أخرى
          </button>
        </div>
      )}
      
      <div className="flex gap-4">
        <select 
          className="p-2 border rounded-md"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="week">آخر 7 أيام</option>
          <option value="month">آخر 30 يوم</option>
          <option value="quarter">آخر 3 أشهر</option>
          <option value="year">آخر سنة</option>
        </select>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 md:grid-cols-7">
            <TabsTrigger value="startups">الشركات</TabsTrigger>
            <TabsTrigger value="programs">البرامج</TabsTrigger>
            <TabsTrigger value="financial">مالي</TabsTrigger>
            <TabsTrigger value="scheduled">مجدول</TabsTrigger>
            <TabsTrigger value="draft">مسودة</TabsTrigger>
            <TabsTrigger value="published">منشور</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedReports.length > 0 && (
                <>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>تنزيل المحدد</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>إرسال بالبريد</span>
                  </Button>
                </>
              )}
            </div>
            <CardTitle>قائمة التقارير ({filteredReports.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="border rounded-md">
            <div className="grid grid-cols-8 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
              <div className="col-span-1 flex items-center">
                <input 
                  type="checkbox" 
                  className="ml-2"
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onChange={selectAllReports}
                />
                <span>الإجراءات</span>
              </div>
              <div className="col-span-1">الحالة</div>
              <div className="col-span-1">التنسيق</div>
              <div className="col-span-1">التصنيف</div>
              <div className="col-span-1">التنزيلات</div>
              <div className="col-span-1">التاريخ</div>
              <div className="col-span-2">العنوان</div>
            </div>
            
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div key={report.id} className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-muted/20 text-sm">
                  <div className="col-span-1 flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedReports.includes(report.id)}
                      onChange={() => toggleReportSelection(report.id)}
                    />
                    <div className="flex gap-1">
                      <button 
                        className="text-blue-500 hover:text-blue-700"
                        onClick={async () => {
                          try {
                            await exportPresets.reports({ ids: report.id });
                          } catch (error) {
                            console.error('Error exporting report:', error);
                            toast({ title: "خطأ", description: "حدث خطأ أثناء تصدير التقرير", variant: "destructive" });
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-amber-500 hover:text-amber-700"
                        onClick={() => handleView(report.id)}
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {report.status === "منشور" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        منشور
                      </span>
                    ) : report.status === "مجدول" ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        مجدول
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        مسودة
                      </span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      {report.format === "PDF" ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : report.format === "XLSX" ? (
                        <FileSpreadsheet className="h-4 w-4 text-green-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-500" />
                      )}
                      <span>{report.format}</span>
                    </div>
                  </div>
                  <div className="col-span-1">{report.category}</div>
                  <div className="col-span-1">{report.downloadCount}</div>
                  <div className="col-span-1">{report.date}</div>
                  <div className="col-span-2 truncate" title={report.title}>{report.title}</div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                لا توجد نتائج مطابقة لبحثك
              </div>
            )}
          </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>توزيع التقارير حسب التصنيف</span>
              <PieChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "أداء البرامج", count: reports.filter(r => r.category === "أداء البرامج").length, color: "#3b82f6" },
                { category: "التمويل", count: reports.filter(r => r.category === "التمويل").length, color: "#10b981" },
                { category: "الشركات الناشئة", count: reports.filter(r => r.category === "الشركات الناشئة").length, color: "#f59e0b" },
                { category: "المستخدمين", count: reports.filter(r => r.category === "المستخدمين").length, color: "#ef4444" },
                { category: "الفعاليات", count: reports.filter(r => r.category === "الفعاليات").length, color: "#8b5cf6" },
                { category: "تقني", count: reports.filter(r => r.category === "تقني").length, color: "#ec4899" },
                { category: "التوجيه", count: reports.filter(r => r.category === "التوجيه").length, color: "#06b6d4" },
                { category: "مالي", count: reports.filter(r => r.category === "مالي").length, color: "#6b7280" }
              ].filter(item => item.count > 0).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="h-3 rounded-full ml-2"
                      style={{ 
                        width: `${(item.count / statistics.totalReports) * 100 / 3}rem`,
                        backgroundColor: item.color
                      }}
                    ></div>
                    <span className="text-lg font-bold">{item.count}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="text-xs text-muted-foreground mr-2">({Math.round((item.count / statistics.totalReports) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-end gap-2">
              <span>تنزيلات التقارير الشهرية</span>
              <BarChart className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-60 flex items-end justify-between gap-2 pt-10 pb-5">
              {[45, 60, 75, 90, 120, 150, 180, 210, 240, 270, 300, 365].map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-8 bg-primary rounded-t-md" 
                    style={{ height: `${(value / 365) * 100}%` }}
                  ></div>
                  <span className="text-xs">{['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][index]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-end gap-2">
            <span>التقارير المجدولة القادمة</span>
            <Calendar className="h-5 w-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              reports.filter(r => r.status === "scheduled").map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => {
                        // Set selected report and show schedule modal
                        setSelectedScheduleReport(report.id)
                        // Pre-fill with existing data if available
                        setScheduleData({
                          publishDate: report.publishDate ? new Date(report.publishDate).toISOString().split('T')[0] : '',
                          publishTime: report.scheduledTime || '09:00',
                          notifyUsers: true,
                          recurring: !!report.isRecurring,
                          recurrencePattern: report.recurrencePattern || 'monthly'
                        })
                        setShowScheduleModal(true)
                      }}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>تعديل الجدولة</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleView(report.id)}
                    >
                      <FileText className="h-4 w-4" />
                      <span>معاينة</span>
                    </Button>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">{report.title}</div>
                    <div className="text-sm text-muted-foreground">{report.category} • {report.format}</div>
                    <div className="text-xs text-muted-foreground">
                      تاريخ النشر: {report.publishDate ? new Date(report.publishDate).toLocaleDateString('ar-SA') : 'غير محدد'} {report.scheduledTime || ''}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
