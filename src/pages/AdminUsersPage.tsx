import { useEffect, useState } from 'react'
import {
    deleteUser,
    getUsers,
    updateUser,
} from '../features/admin/admin.api'
import type { User, UserRole, UserStatus } from '../types/user'

function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingUserId, setEditingUserId] = useState<string | null>(null)
    const [editRole, setEditRole] = useState<UserRole>('CANDIDATE')
    const [editStatus, setEditStatus] = useState<UserStatus>('ACTIVE')
    const [isSaving, setIsSaving] = useState(false)

    const loadUsers = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await getUsers()
            setUsers(data)
        } catch {
            setError('Failed to load users.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadUsers()
    }, [])

    const startEditing = (user: User) => {
        setEditingUserId(user.id)
        setEditRole(user.role)
        setEditStatus(user.status)
    }

    const cancelEditing = () => {
        setEditingUserId(null)
    }

    const saveUser = async (userId: string) => {
        setIsSaving(true)
        setError(null)

        try {
            const updatedUser = await updateUser(userId, {
                role: editRole,
                status: editStatus,
            })

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === userId ? updatedUser : user,
                ),
            )

            setEditingUserId(null)
        } catch {
            setError('Failed to update user.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (user: User) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${user.email}?`,
        )

        if (!confirmed) {
            return
        }

        setError(null)

        try {
            await deleteUser(user.id)

            setUsers((currentUsers) =>
                currentUsers.filter((currentUser) => currentUser.id !== user.id),
            )
        } catch {
            setError('Failed to delete user.')
        }
    }

    if (isLoading) {
        return <main>Loading users...</main>
    }

    return (
        <main>
            <h1>Admin — User Management</h1>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            <button type="button" onClick={() => void loadUsers()}>
                Refresh
            </button>

            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => {
                            const isEditing = editingUserId === user.id

                            return (
                                <tr key={user.id}>
                                    <td>{user.email}</td>

                                    <td>
                                        {isEditing ? (
                                            <select
                                                value={editRole}
                                                onChange={(event) =>
                                                    setEditRole(event.target.value as UserRole)
                                                }
                                                disabled={isSaving}
                                            >
                                                <option value="CANDIDATE">CANDIDATE</option>
                                                <option value="RECRUITER">RECRUITER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        ) : (
                                            user.role
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <select
                                                value={editStatus}
                                                onChange={(event) =>
                                                    setEditStatus(event.target.value as UserStatus)
                                                }
                                                disabled={isSaving}
                                            >
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="PENDING">PENDING</option>
                                                <option value="SUSPENDED">SUSPENDED</option>
                                                <option value="DELETED">DELETED</option>
                                            </select>
                                        ) : (
                                            user.status
                                        )}
                                    </td>

                                    <td>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => void saveUser(user.id)}
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? 'Saving...' : 'Save'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={cancelEditing}
                                                    disabled={isSaving}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(user)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => void handleDelete(user)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </main>
    )
}

export default AdminUsersPage
