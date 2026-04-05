import DataTable from "@/components/DataTable"

const columns = ["ID", "Name", "Email", "Role"]
const data = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Participant" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Mentor" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Participant" },
]

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

