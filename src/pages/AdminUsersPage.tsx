import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ActionMenu from '../components/ActionMenu/ActionMenu'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import Drawer from '../components/Drawer/Drawer'
import {
    deleteUser,
    getUsers,
    updateUser,
} from '../features/admin/admin.api'
import { useTranslation } from '../i18n/useTranslation'
import type { User, UserRole, UserStatus } from '../types/user'
import './AdminUsersPage.css'

function formatRole(
    role: UserRole,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (role) {
        case 'CANDIDATE':
            return t('common.candidate')
        case 'RECRUITER':
            return t('common.recruiter')
        case 'ADMIN':
            return t('common.admin')
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
            return t('common.active')
        case 'PENDING':
            return t('common.pending')
        case 'SUSPENDED':
            return t('common.suspended')
        case 'DELETED':
            return t('common.deleted')
        default:
            return status
    }
}

function AdminUsersPage() {
    const { language, t } = useTranslation()

    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [editRole, setEditRole] = useState<UserRole>('CANDIDATE')
    const [editStatus, setEditStatus] =
        useState<UserStatus>('ACTIVE')
    const [isSaving, setIsSaving] = useState(false)

    const [userToDelete, setUserToDelete] =
        useState<User | null>(null)

    const loadUsers = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const users = await getUsers()
            setUsers(users)
        } catch {
            setError(t('adminUsers.loadError'))
        } finally {
            setIsLoading(false)
        }
    }, [t])

    useEffect(() => {
        void loadUsers()
    }, [loadUsers])

    const startEditing = (user: User) => {
        setEditingUser(user)
        setEditRole(user.role)
        setEditStatus(user.status)
    }

    const cancelEditing = () => {
        if (!isSaving) {
            setEditingUser(null)
        }
    }

    const saveUser = async () => {
        if (!editingUser) {
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            const updatedUser = await updateUser(editingUser.id, {
                role: editRole,
                status: editStatus,
            })

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === editingUser.id
                        ? updatedUser
                        : user,
                ),
            )

            setEditingUser(null)
        } catch {
            setError(t('adminUsers.updateError'))
        } finally {
            setIsSaving(false)
        }
    }

    const openDeleteConfirmation = (user: User) => {
        setUserToDelete(user)
    }

    const closeDeleteConfirmation = () => {
        setUserToDelete(null)
    }

    const confirmDelete = async () => {
        if (!userToDelete) {
            return
        }

        setError(null)

        try {
            await deleteUser(userToDelete.id)

            setUsers((currentUsers) =>
                currentUsers.filter(
                    (user) => user.id !== userToDelete.id,
                ),
            )

            setUserToDelete(null)
        } catch {
            setError(t('adminUsers.deleteError'))
        }
    }

    const locale = language === 'nl' ? 'nl-NL' : 'en-US'

    if (isLoading) {
        return <div>{t('adminUsers.loading')}</div>
    }

    return (
        <>
            <Link
                to="/dashboard"
                className="back-to-dashboard"
            >
                ← {t('common.backToDashboard')}
            </Link>

            <h1>{t('adminUsers.title')}</h1>

            {error && <p role="alert">{error}</p>}

            <button
                type="button"
                onClick={() => void loadUsers()}
            >
                {t('common.refresh')}
            </button>

            {users.length === 0 ? (
                <p>{t('adminUsers.noUsers')}</p>
            ) : (
                <div className="admin-users-table-wrapper">
                    <table className="admin-users-table">
                        <thead>
                            <tr>
                                <th>{t('common.email')}</th>
                                <th>{t('common.role')}</th>
                                <th>{t('common.status')}</th>
                                <th>{t('common.created')}</th>
                                <th>{t('common.actions')}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>

                                    <td>
                                        {formatRole(user.role, t)}
                                    </td>

                                    <td>
                                        {formatStatus(user.status, t)}
                                    </td>

                                    <td>
                                        {new Date(
                                            user.createdAt,
                                        ).toLocaleDateString(locale)}
                                    </td>

                                    <td>
                                        <ActionMenu
                                            ariaLabel={`${t('common.actions')} - ${user.email}`}
                                            actions={[
                                                {
                                                    label: t('common.edit'),
                                                    onClick: () =>
                                                        startEditing(user),
                                                },
                                                {
                                                    label: t('common.delete'),
                                                    onClick: () =>
                                                        openDeleteConfirmation(
                                                            user,
                                                        ),
                                                    destructive: true,
                                                },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Drawer
                open={editingUser !== null}
                onClose={cancelEditing}
                title={t('adminUsers.editUser')}
                closeLabel={t('common.close')}
            >
                <div>
                    <label>
                        {t('common.role')}

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
                                {t('common.candidate')}
                            </option>
                            <option value="RECRUITER">
                                {t('common.recruiter')}
                            </option>
                            <option value="ADMIN">
                                {t('common.admin')}
                            </option>
                        </select>
                    </label>

                    <label>
                        {t('common.status')}

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
                                {t('common.active')}
                            </option>
                            <option value="PENDING">
                                {t('common.pending')}
                            </option>
                            <option value="SUSPENDED">
                                {t('common.suspended')}
                            </option>
                            <option value="DELETED">
                                {t('common.deleted')}
                            </option>
                        </select>
                    </label>

                    <button
                        type="button"
                        onClick={() => void saveUser()}
                        disabled={isSaving}
                    >
                        {isSaving
                            ? t('common.saving')
                            : t('common.save')}
                    </button>

                    <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={isSaving}
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </Drawer>

            <ConfirmDialog
                open={userToDelete !== null}
                title={t('common.confirmDeleteTitle')}
                message={
                    userToDelete
                        ? `${t('adminUsers.deleteConfirmation')} ${userToDelete.email}`
                        : ''
                }
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                destructive
                onConfirm={() => void confirmDelete()}
                onCancel={closeDeleteConfirmation}
            />
        </>
    )
}

export default AdminUsersPage