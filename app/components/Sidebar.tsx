import Link from "next/link"
import { Home, Users, Flag, Award, Star, Book, Calendar } from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Teams", href: "/dashboard/teams", icon: Flag },
  { name: "Judges", href: "/dashboard/judges", icon: Award },
  { name: "Scores", href: "/dashboard/scores", icon: Star },
  { name: "Mentors", href: "/dashboard/mentors", icon: Book },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
]

export default function Sidebar() {
  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link href={item.href} className="flex items-center p-2 rounded hover:bg-gray-700">
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

