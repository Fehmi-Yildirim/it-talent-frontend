import { useEffect, useState } from 'react'
import {
    deleteUser,
    getUsers,
    updateUser,
} from '../features/admin/admin.api'
import type { User, UserRole, UserStatus } from '../types/user'
import { useTranslation } from '../i18n/context'

function formatRole(
    role: UserRole,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (role) {
        case 'CANDIDATE':
            return t('adminUsers.candidate')
        case 'RECRUITER':
            return t('adminUsers.recruiter')
        case 'ADMIN':
            return t('adminUsers.admin')
        default:
            return role
    }
}

function formatStatus(
    status: UserStatus,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (status) {
        case 'ACTIVE':
            return t('adminUsers.active')
        case 'PENDING':
            return t('adminUsers.pending')
        case 'SUSPENDED':
            return t('adminUsers.suspended')
        case 'DELETED':
            return t('adminUsers.deleted')
        default:
            return status
    }
}

function AdminUsersPage() {
    const { language, t } = useTranslation()

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
            setError(t('adminUsers.loadError'))
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
            setError(t('adminUsers.updateError'))
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (user: User) => {
        const confirmed = window.confirm(
            `${t('adminUsers.deleteConfirmation')} ${user.email}`,
        )

        if (!confirmed) {
            return
        }

        setError(null)

        try {
            await deleteUser(user.id)

            setUsers((currentUsers) =>
                currentUsers.filter(
                    (currentUser) => currentUser.id !== user.id,
                ),
            )
        } catch {
            setError(t('adminUsers.deleteError'))
        }
    }

    const locale = language === 'nl' ? 'nl-NL' : 'en-US'

    if (isLoading) {
        return (
            <main>
                {t('adminUsers.loading')}
            </main>
        )
    }

    return (
        <main>
            <h1>{t('adminUsers.title')}</h1>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={() => void loadUsers()}
            >
                {t('adminUsers.refresh')}
            </button>

            {users.length === 0 ? (
                <p>{t('adminUsers.noUsers')}</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>{t('adminUsers.email')}</th>
                            <th>{t('adminUsers.role')}</th>
                            <th>{t('adminUsers.status')}</th>
                            <th>{t('adminUsers.created')}</th>
                            <th>{t('adminUsers.actions')}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => {
                            const isEditing =
                                editingUserId === user.id

                            return (
                                <tr key={user.id}>
                                    <td>{user.email}</td>

                                    <td>
                                        {isEditing ? (
                                            <select
                                                value={editRole}
                                                onChange={(event) =>
                                                    setEditRole(
                                                        event.target.value as UserRole,
                                                    )
                                                }
                                                disabled={isSaving}
                                            >
                                                <option value="CANDIDATE">
                                                    {t('adminUsers.candidate')}
                                                </option>
                                                <option value="RECRUITER">
                                                    {t('adminUsers.recruiter')}
                                                </option>
                                                <option value="ADMIN">
                                                    {t('adminUsers.admin')}
                                                </option>
                                            </select>
                                        ) : (
                                            formatRole(user.role, t)
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <select
                                                value={editStatus}
                                                onChange={(event) =>
                                                    setEditStatus(
                                                        event.target.value as UserStatus,
                                                    )
                                                }
                                                disabled={isSaving}
                                            >
                                                <option value="ACTIVE">
                                                    {t('adminUsers.active')}
                                                </option>
                                                <option value="PENDING">
                                                    {t('adminUsers.pending')}
                                                </option>
                                                <option value="SUSPENDED">
                                                    {t('adminUsers.suspended')}
                                                </option>
                                                <option value="DELETED">
                                                    {t('adminUsers.deleted')}
                                                </option>
                                            </select>
                                        ) : (
                                            formatStatus(user.status, t)
                                        )}
                                    </td>

                                    <td>
                                        {new Date(
                                            user.createdAt,
                                        ).toLocaleDateString(locale)}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void saveUser(user.id)
                                                    }
                                                    disabled={isSaving}
                                                >
                                                    {isSaving
                                                        ? t('adminUsers.saving')
                                                        : t('adminUsers.save')}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={cancelEditing}
                                                    disabled={isSaving}
                                                >
                                                    {t('adminUsers.cancel')}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startEditing(user)
                                                    }
                                                >
                                                    {t('adminUsers.edit')}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleDelete(user)
                                                    }
                                                >
                                                    {t('adminUsers.delete')}
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
