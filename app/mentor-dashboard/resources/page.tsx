"use client"

import { useEffect, useState } from "react"
import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ArrowRight, 
  BookOpen, 
  ExternalLink, 
  File, 
  Filter, 
  Link as LinkIcon, 
  Plus, 
  Search,
  Tag,
  Trash2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Resource {
  id: string
  title: string
  description: string
  type: "DOCUMENT" | "LINK" | "VIDEO"
  url: string
  category: string
  tags: string[]
  createdAt: string
  sharedWith: {
    id: string
    name: string
    type: "STARTUP" | "COHORT"
  }[]
}

export default function MentorResourcesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [resources, setResources] = useState<Resource[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [startups, setStartups] = useState<{id: string, name: string}[]>([])
  const [cohorts, setCohorts] = useState<{id: string, name: string}[]>([])
  
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "DOCUMENT",
    url: "",
    category: "",
    tags: "",
    sharedWith: [] as string[]
  })
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch("/api/mentor/resources", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch resources")
        }
        
        const data = await response.json()
        setResources(data.resources || [])
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.resources.map((r: Resource) => r.category))
        )
        setCategories(uniqueCategories as string[])
        
        // Get startups and cohorts for sharing
        setStartups(data.startups || [])
        setCohorts(data.cohorts || [])
      } catch (error) {
        console.error("Error fetching resources:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchResources()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewResource(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSharedWithChange = (id: string) => {
    setNewResource(prev => {
      const sharedWith = [...prev.sharedWith]
      
      if (sharedWith.includes(id)) {
        return {
          ...prev,
          sharedWith: sharedWith.filter(item => item !== id)
        }
      } else {
        return {
          ...prev,
          sharedWith: [...sharedWith, id]
        }
      }
    })
  }
  
  const handleAddResource = async () => {
    try {
      const response = await fetch("/api/mentor/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...newResource,
          tags: newResource.tags.split(",").map(tag => tag.trim())
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to add resource")
      }
      
      const data = await response.json()
      setResources(prev => [...prev, data.resource])
      
      // Reset form
      setNewResource({
        title: "",
        description: "",
        type: "DOCUMENT",
        url: "",
        category: "",
        tags: "",
        sharedWith: []
      })
    } catch (error) {
      console.error("Error adding resource:", error)
    }
  }
  
  const handleDeleteResource = async (id: string) => {
    try {
      const response = await fetch(`/api/mentor/resources/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete resource")
      }
      
      setResources(prev => prev.filter(resource => resource.id !== id))
    } catch (error) {
      console.error("Error deleting resource:", error)
    }
  }
  
  // Filter resources based on search and filters
  const filteredResources = () => {
    let filtered = [...resources]
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        resource => 
          resource.title.toLowerCase().includes(query) || 
          resource.description.toLowerCase().includes(query) ||
          resource.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(resource => resource.category === categoryFilter)
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(resource => resource.type === typeFilter)
    }
    
    return filtered
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter(null)
    setTypeFilter(null)
  }
  
  // Get icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "DOCUMENT":
        return <File className="h-5 w-5" />
      case "LINK":
        return <LinkIcon className="h-5 w-5" />
      case "VIDEO":
        return <BookOpen className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-full">جاري التحميل...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">الموارد التعليمية</h1>
      </div>
      
      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="resources">الموارد</TabsTrigger>
          <TabsTrigger value="add">إضافة مورد جديد</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="البحث عن مورد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} />
                    <span>التصنيف</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {categories.map((category) => (
                    <DropdownMenuItem 
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={categoryFilter === category ? "bg-primary/10" : ""}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} />
                    <span>النوع</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter("DOCUMENT")}
                    className={typeFilter === "DOCUMENT" ? "bg-primary/10" : ""}
                  >
                    مستند
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter("LINK")}
                    className={typeFilter === "LINK" ? "bg-primary/10" : ""}
                  >
                    رابط
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter("VIDEO")}
                    className={typeFilter === "VIDEO" ? "bg-primary/10" : ""}
                  >
                    فيديو
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {(searchQuery || categoryFilter || typeFilter) && (
                <Button variant="ghost" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>
          
          {/* Resources Grid */}
          {filteredResources().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources().map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="p-2 rounded-full bg-primary/10 text-primary">
                          {getResourceIcon(resource.type)}
                        </span>
                        <span>{resource.title}</span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">التصنيف:</span> {resource.category}
                      </div>
                      {resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {resource.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                            >
                              <Tag className="h-3 w-3 ml-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {resource.sharedWith.length > 0 && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">مشارك مع:</span>{" "}
                          {resource.sharedWith.map(item => item.name).join(", ")}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary flex items-center text-sm hover:underline"
                      >
                        فتح المورد
                        <ExternalLink className="h-4 w-4 mr-1" />
                      </a>
                      
                      <div className="text-xs text-gray-500">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-500">لا توجد موارد مطابقة للفلاتر المحددة</p>
              {(searchQuery || categoryFilter || typeFilter) && (
                <Button variant="link" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>إضافة مورد جديد</CardTitle>
              <CardDescription>
                أضف موارد تعليمية لمشاركتها مع الشركات الناشئة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newResource.title}
                    onChange={handleInputChange}
                    placeholder="عنوان المورد"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={newResource.description}
                    onChange={handleInputChange}
                    placeholder="وصف المورد"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">النوع</Label>
                    <select
                      id="type"
                      name="type"
                      value={newResource.type}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="DOCUMENT">مستند</option>
                      <option value="LINK">رابط</option>
                      <option value="VIDEO">فيديو</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">التصنيف</Label>
                    <Input
                      id="category"
                      name="category"
                      value={newResource.category}
                      onChange={handleInputChange}
                      placeholder="مثال: تطوير المنتج"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">الرابط</Label>
                  <Input
                    id="url"
                    name="url"
                    value={newResource.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/resource"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">الوسوم (مفصولة بفواصل)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={newResource.tags}
                    onChange={handleInputChange}
                    placeholder="مثال: تسويق, استراتيجية, تمويل"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>مشاركة مع</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">الشركات الناشئة</h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {startups.map(startup => (
                          <div key={startup.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`startup-${startup.id}`}
                              checked={newResource.sharedWith.includes(startup.id)}
                              onChange={() => handleSharedWithChange(startup.id)}
                              className="h-4 w-4 ml-2"
                            />
                            <Label htmlFor={`startup-${startup.id}`} className="text-sm font-normal">
                              {startup.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">البرامج</h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {cohorts.map(cohort => (
                          <div key={cohort.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`cohort-${cohort.id}`}
                              checked={newResource.sharedWith.includes(cohort.id)}
                              onChange={() => handleSharedWithChange(cohort.id)}
                              className="h-4 w-4 ml-2"
                            />
                            <Label htmlFor={`cohort-${cohort.id}`} className="text-sm font-normal">
                              {cohort.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleAddResource} className="w-full">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة مورد
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
