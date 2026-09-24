import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ActionMenu from '../components/ActionMenu/ActionMenu'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import {
    deleteUser,
    getUsers,
    updateUser,
} from '../features/admin/admin.api'
import { LOCALES } from '../i18n'
import { useTranslation } from '../i18n/useTranslation'
import {
    USER_ROLES,
    USER_STATUSES,
    type User,
    type UserRole,
    type UserStatus,
} from '../types/user'
import './AdminUsersPage.css'

function AdminUsersPage() {
    const { language, t } = useTranslation()

    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
    const [updatedField, setUpdatedField] = useState<{
        userId: string
        field: 'role' | 'status'
    } | null>(null)

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

    const handleRoleChange = async (
        user: User,
        role: UserRole,
    ) => {
        setError(null)
        setUpdatedField(null)
        setUpdatingUserId(user.id)

        try {
            const updatedUser = await updateUser(user.id, { role })

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? updatedUser
                        : currentUser,
                ),
            )

            setUpdatedField({
                userId: user.id,
                field: 'role',
            })

            window.setTimeout(() => {
                setUpdatedField((current) =>
                    current?.userId === user.id &&
                        current.field === 'role'
                        ? null
                        : current,
                )
            }, 2000)
        } catch {
            setError(t('adminUsers.updateError'))
        } finally {
            setUpdatingUserId(null)
        }
    }

    const handleStatusChange = async (
        user: User,
        status: UserStatus,
    ) => {
        setError(null)
        setUpdatedField(null)
        setUpdatingUserId(user.id)

        try {
            const updatedUser = await updateUser(user.id, { status })

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? updatedUser
                        : currentUser,
                ),
            )

            setUpdatedField({
                userId: user.id,
                field: 'status',
            })

            window.setTimeout(() => {
                setUpdatedField((current) =>
                    current?.userId === user.id &&
                        current.field === 'status'
                        ? null
                        : current,
                )
            }, 2000)
        } catch {
            setError(t('adminUsers.updateError'))
        } finally {
            setUpdatingUserId(null)
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

    const locale = LOCALES[language]

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
                                        <span className="admin-users-select-wrapper">
                                            <select
                                                value={user.role}
                                                disabled={
                                                    updatingUserId === user.id
                                                }
                                                onChange={(event) =>
                                                    void handleRoleChange(
                                                        user,
                                                        event.target
                                                            .value as UserRole,
                                                    )
                                                }
                                            >
                                                <option value={USER_ROLES.CANDIDATE}>
                                                    {t('common.candidate')}
                                                </option>
                                                <option value={USER_ROLES.RECRUITER}>
                                                    {t('common.recruiter')}
                                                </option>
                                                <option value={USER_ROLES.ADMIN}>
                                                    {t('common.admin')}
                                                </option>
                                            </select>

                                            {updatedField?.userId ===
                                                user.id &&
                                                updatedField.field ===
                                                'role' && (
                                                    <span
                                                        className="admin-users-update-success"
                                                        aria-label="Update successful"
                                                        title="Update successful"
                                                    >
                                                        ✓
                                                    </span>
                                                )}
                                        </span>
                                    </td>

                                    <td>
                                        <span className="admin-users-select-wrapper">
                                            <select
                                                value={user.status}
                                                disabled={
                                                    updatingUserId === user.id
                                                }
                                                onChange={(event) =>
                                                    void handleStatusChange(
                                                        user,
                                                        event.target
                                                            .value as UserStatus,
                                                    )
                                                }
                                            >
                                                <option value={USER_STATUSES.ACTIVE}>
                                                    {t('common.active')}
                                                </option>
                                                <option value={USER_STATUSES.PENDING}>
                                                    {t('common.pending')}
                                                </option>
                                                <option value={USER_STATUSES.SUSPENDED}>
                                                    {t('common.suspended')}
                                                </option>
                                                <option value={USER_STATUSES.DELETED}>
                                                    {t('common.deleted')}
                                                </option>
                                            </select>

                                            {updatedField?.userId ===
                                                user.id &&
                                                updatedField.field ===
                                                'status' && (
                                                    <span
                                                        className="admin-users-update-success"
                                                        aria-label="Update successful"
                                                        title="Update successful"
                                                    >
                                                        ✓
                                                    </span>
                                                )}
                                        </span>
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


