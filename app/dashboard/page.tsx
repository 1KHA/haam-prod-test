"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, BarChart, PieChart } from "@/components/Charts"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">نظرة عامة على لوحة التحكم</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="justify-end">
          <TabsTrigger value="events">الفعاليات</TabsTrigger>
          <TabsTrigger value="teams">الفرق</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>إجمالي المستخدمين</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">1,234</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>الفرق النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">56</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>الفعاليات القادمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">3</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle>إجمالي الموجهين</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">42</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>نمو المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الفرق</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>حضور الفعاليات</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

