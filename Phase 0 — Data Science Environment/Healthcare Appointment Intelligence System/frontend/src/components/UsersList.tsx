import { useEffect, useState } from 'react'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { usersApi, type User } from '@/services/usersApi'
import { UserManagementModal } from './UserManagementModal'

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await usersApi.listUsers()
      setUsers(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setSelectedUser(null)
    setIsCreating(true)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user)
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
    setIsCreating(false)
  }

  const handleSaveUser = async () => {
    await loadUsers()
    handleCloseModal()
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await usersApi.deleteUser(userId)
      await loadUsers()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const getRoleBadgeTone = (role: string): 'neutral' | 'success' | 'warning' | 'danger' | 'primary' => {
    switch (role) {
      case 'admin':
        return 'danger'
      case 'doctor':
        return 'primary'
      default:
        return 'neutral'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader
          title="User Management"
          subtitle="Manage system users and their access levels"
          action={
            <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
              <Plus size={16} />
              Add User
            </Button>
          }
        />
        <CardContent className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No users found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="cds-table-header">
                  <th className="px-4 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-wider">Created</th>
                  <th className="px-4 py-2 text-right font-mono text-[10px] font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="cds-table-row">
                    <td className="px-4 py-3 font-semibold text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={getRoleBadgeTone(user.role)}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={16} className="text-primary-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <UserManagementModal
          user={isCreating ? null : selectedUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </>
  )
}
