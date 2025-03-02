"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { BarChart as RechartsBarChart, Bar } from "recharts"
import { PieChart as RechartsPieChart, Pie, Cell } from "recharts"

const lineData = [
  { name: "يناير", users: 400 },
  { name: "فبراير", users: 300 },
  { name: "مارس", users: 200 },
  { name: "أبريل", users: 278 },
  { name: "مايو", users: 189 },
  { name: "يونيو", users: 239 },
]

export function LineChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="users" stroke="#8884d8" />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

const barData = [
  { name: "فعالية أ", attendees: 400 },
  { name: "فعالية ب", attendees: 300 },
  { name: "فعالية ج", attendees: 200 },
  { name: "فعالية د", attendees: 278 },
]

export function BarChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={barData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="attendees" fill="#8884d8" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

const pieData = [
  { name: "مطورون", value: 400 },
  { name: "مصممون", value: 300 },
  { name: "مدراء منتجات", value: 300 },
  { name: "آخرون", value: 200 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function PieChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

