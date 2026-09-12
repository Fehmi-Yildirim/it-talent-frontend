import {
    useCallback,
    useEffect,
    useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
    createSkill,
    deleteSkill,
    getSkills,
    updateSkill,
} from '../features/admin/skills.api'
import type { Skill } from '../types/candidate'
import type { SkillCategory } from '../types/skill'
import { useTranslation } from '../i18n/useTranslation'
import Drawer from '../components/Drawer/Drawer'
import ActionMenu from '../components/ActionMenu/ActionMenu'
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog'
import './AdminSkillsPage.css'

interface SkillForm {
    name: string
    category: SkillCategory | ''
    description: string
}

const INITIAL_FORM: SkillForm = {
    name: '',
    category: '',
    description: '',
}

const CATEGORIES: SkillCategory[] = [
    'FRONTEND',
    'BACKEND',
    'FULLSTACK',
    'MOBILE',
    'DEVOPS',
    'CLOUD',
    'DATA',
    'AI_ML',
    'SECURITY',
    'DATABASE',
    'TESTING',
    'PROJECT_MANAGEMENT',
    'DESIGN',
    'OTHER',
]

function formatCategory(
    category: string,
    t: (key: import('../i18n').TranslationKey) => string,
): string {
    switch (category) {
        case 'FRONTEND':
            return t('adminSkills.categories.frontend')
        case 'BACKEND':
            return t('adminSkills.categories.backend')
        case 'FULLSTACK':
            return t('adminSkills.categories.fullstack')
        case 'MOBILE':
            return t('adminSkills.categories.mobile')
        case 'DEVOPS':
            return t('adminSkills.categories.devops')
        case 'CLOUD':
            return t('adminSkills.categories.cloud')
        case 'DATA':
            return t('adminSkills.categories.data')
        case 'AI_ML':
            return t('adminSkills.categories.aiMl')
        case 'SECURITY':
            return t('adminSkills.categories.security')
        case 'DATABASE':
            return t('adminSkills.categories.database')
        case 'TESTING':
            return t('adminSkills.categories.testing')
        case 'PROJECT_MANAGEMENT':
            return t(
                'adminSkills.categories.projectManagement',
            )
        case 'DESIGN':
            return t('adminSkills.categories.design')
        case 'OTHER':
            return t('adminSkills.categories.other')
        default:
            return category
    }
}

export default function AdminSkillsPage() {
    const { t } = useTranslation()

    const [skills, setSkills] = useState<Skill[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [search, setSearch] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingSkillId, setEditingSkillId] =
        useState<string | null>(null)
    const [skillToDelete, setSkillToDelete] =
        useState<Skill | null>(null)

    const [form, setForm] = useState<SkillForm>(INITIAL_FORM)

    const loadSkills = useCallback(
        async (searchTerm: string) => {
            setIsLoading(true)
            setError(null)

            try {
                const data = await getSkills(searchTerm)
                setSkills(data)
            } catch {
                setError(t('adminSkills.loadError'))
            } finally {
                setIsLoading(false)
            }
        },
        [t],
    )

    useEffect(() => {
        void loadSkills('')
    }, [loadSkills])

    const updateForm = (
        field: keyof SkillForm,
        value: string,
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))
    }

    const resetForm = () => {
        setForm(INITIAL_FORM)
        setEditingSkillId(null)
    }

    const openCreateDrawer = () => {
        resetForm()
        setError(null)
        setIsDrawerOpen(true)
    }

    const closeDrawer = () => {
        if (isSaving) {
            return
        }

        setIsDrawerOpen(false)
        resetForm()
        setError(null)
    }

    const startEditing = (skill: Skill) => {
        setEditingSkillId(skill.id)

        setForm({
            name: skill.name,
            category: skill.category as SkillCategory,
            description: skill.description ?? '',
        })

        setError(null)
        setIsDrawerOpen(true)
    }

    const validateForm = (): boolean => {
        if (!form.name.trim()) {
            setError(t('adminSkills.nameRequired'))
            return false
        }

        if (!form.category) {
            setError(t('adminSkills.categoryRequired'))
            return false
        }

        return true
    }

    const saveSkill = async () => {
        if (!validateForm()) {
            return
        }

        setIsSaving(true)
        setError(null)

        const name = form.name.trim()

        const data = {
            name,
            category: form.category as SkillCategory,
            description: form.description.trim() || null,
        }

        try {
            if (editingSkillId) {
                const updatedSkill = await updateSkill(
                    editingSkillId,
                    data,
                )

                setSkills((currentSkills) =>
                    currentSkills.map((skill) =>
                        skill.id === editingSkillId
                            ? updatedSkill
                            : skill,
                    ),
                )
            } else {
                const createdSkill = await createSkill(data)

                setSkills((currentSkills) => [
                    createdSkill,
                    ...currentSkills,
                ])
            }

            setIsDrawerOpen(false)
            resetForm()
        } catch (requestError) {
            const message =
                requestError instanceof Error
                    ? requestError.message
                    : ''

            if (
                message.toLowerCase().includes('slug') ||
                message.includes('409')
            ) {
                setError(t('adminSkills.duplicateSlug'))
            } else if (editingSkillId) {
                setError(t('adminSkills.updateError'))
            } else {
                setError(t('adminSkills.createError'))
            }
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!skillToDelete) {
            return
        }

        const skill = skillToDelete

        setSkillToDelete(null)
        setError(null)

        try {
            await deleteSkill(skill.id)

            setSkills((currentSkills) =>
                currentSkills.filter(
                    (currentSkill) => currentSkill.id !== skill.id,
                ),
            )

            if (editingSkillId === skill.id) {
                setIsDrawerOpen(false)
                resetForm()
            }
        } catch {
            setError(t('adminSkills.deleteError'))
        }
    }

    const handleSearch = async () => {
        await loadSkills(search.trim())
    }

    if (isLoading) {
        return (
            <div>
                <p>{t('adminSkills.loading')}</p>
            </div>
        )
    }

    return (
        <>
            <Link
                to="/dashboard"
                className="back-to-dashboard"
            >
                ← {t('common.backToDashboard')}
            </Link>
            <div>
                <h1>{t('adminSkills.title')}</h1>

                {error && (
                    <p role="alert">
                        {error}
                    </p>
                )}

                <section className="admin-skills-toolbar">
                    <button
                        type="button"
                        onClick={openCreateDrawer}
                    >
                        {t('adminSkills.createSkill')}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSearch('')
                            void loadSkills('')
                        }}
                    >
                        {t('adminSkills.refresh')}
                    </button>
                </section>

                <section>
                    <form
                        className="admin-skills-search"
                        onSubmit={(event) => {
                            event.preventDefault()
                            void handleSearch()
                        }}
                    >
                        <input
                            id="skill-search"
                            type="search"
                            placeholder={t(
                                'adminSkills.searchPlaceholder',
                            )}
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        <button
                            type="submit"
                            className="admin-skills-search-button"
                            aria-label={t('adminSkills.search')}
                            title={t('adminSkills.search')}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>
                        </button>
                    </form>
                </section>

                <section>
                    {skills.length === 0 ? (
                        <p>
                            {search.trim()
                                ? t('adminSkills.noSkillsMatch')
                                : t('adminSkills.noSkills')}
                        </p>
                    ) : (
                        <div>
                            <table className="admin-skills-table">
                                <thead>
                                    <tr>
                                        <th>{t('adminSkills.name')}</th>
                                        <th>{t('adminSkills.category')}</th>
                                        <th>
                                            {t(
                                                'adminSkills.description',
                                            )}
                                        </th>
                                        <th>{t('adminSkills.actions')}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {skills.map((skill) => (
                                        <tr key={skill.id}>
                                            <td>{skill.name}</td>

                                            <td>
                                                {formatCategory(
                                                    skill.category,
                                                    t,
                                                )}
                                            </td>

                                            <td>
                                                {skill.description ?? '—'}
                                            </td>

                                            <td>
                                                <ActionMenu
                                                    ariaLabel={`${t(
                                                        'adminSkills.actions',
                                                    )}: ${skill.name}`}
                                                    actions={[
                                                        {
                                                            label: t(
                                                                'adminSkills.edit',
                                                            ),
                                                            onClick: () =>
                                                                startEditing(
                                                                    skill,
                                                                ),
                                                        },
                                                        {
                                                            label: t(
                                                                'adminSkills.delete',
                                                            ),
                                                            onClick: () =>
                                                                setSkillToDelete(
                                                                    skill,
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
                </section>

                <Drawer
                    open={isDrawerOpen}
                    onClose={closeDrawer}
                    title={
                        editingSkillId
                            ? t('adminSkills.editSkill')
                            : t('adminSkills.createSkill')
                    }
                    closeLabel={t('adminSkills.cancel')}
                >
                    <form
                        onSubmit={(event) => {
                            event.preventDefault()
                            void saveSkill()
                        }}
                    >
                        <div>
                            <label htmlFor="skill-name">
                                {t('adminSkills.name')}
                            </label>

                            <input
                                id="skill-name"
                                type="text"
                                value={form.name}
                                onChange={(event) =>
                                    updateForm(
                                        'name',
                                        event.target.value,
                                    )
                                }
                                disabled={isSaving}
                            />
                        </div>

                        <div>
                            <label htmlFor="skill-category">
                                {t('adminSkills.category')}
                            </label>

                            <select
                                id="skill-category"
                                value={form.category}
                                onChange={(event) =>
                                    updateForm(
                                        'category',
                                        event.target.value,
                                    )
                                }
                                disabled={isSaving}
                            >
                                <option value="">
                                    {t('adminSkills.category')}
                                </option>

                                {CATEGORIES.map((category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {formatCategory(category, t)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="skill-description">
                                {t('adminSkills.description')}
                            </label>

                            <textarea
                                id="skill-description"
                                value={form.description}
                                onChange={(event) =>
                                    updateForm(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                disabled={isSaving}
                            />
                        </div>

                        <div className="admin-skills-form-actions">
                            <button
                                type="submit"
                                disabled={isSaving}
                            >
                                {isSaving
                                    ? t('adminSkills.saving')
                                    : t('adminSkills.save')}
                            </button>

                            <button
                                type="button"
                                onClick={closeDrawer}
                                disabled={isSaving}
                            >
                                {t('adminSkills.cancel')}
                            </button>
                        </div>
                    </form>
                </Drawer>

                <ConfirmDialog
                    open={skillToDelete !== null}
                    title={t('adminSkills.delete')}
                    message={
                        skillToDelete
                            ? `${t('adminSkills.deleteConfirmation')} ${skillToDelete.name}`
                            : ''
                    }
                    confirmLabel={t('adminSkills.delete')}
                    cancelLabel={t('adminSkills.cancel')}
                    onConfirm={() => void handleDelete()}
                    onCancel={() => setSkillToDelete(null)}
                    destructive
                />
            </div>
        </>
    )
}

