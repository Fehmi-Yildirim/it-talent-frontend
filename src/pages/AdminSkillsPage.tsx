import {
    useCallback,
    useEffect,
    useState,
} from 'react'
import {
    createSkill,
    deleteSkill,
    getSkills,
    updateSkill,
} from '../features/admin/skills.api'
import type { Skill } from '../types/candidate'
import { useTranslation } from '../i18n/useTranslation'
import Drawer from '../components/Drawer/Drawer'
import ActionMenu from '../components/ActionMenu/ActionMenu'
import './AdminSkillsPage.css'

type SkillCategory =
    | 'FRONTEND'
    | 'BACKEND'
    | 'FULLSTACK'
    | 'MOBILE'
    | 'DEVOPS'
    | 'CLOUD'
    | 'DATA'
    | 'AI_ML'
    | 'SECURITY'
    | 'DATABASE'
    | 'TESTING'
    | 'PROJECT_MANAGEMENT'
    | 'DESIGN'
    | 'OTHER'

interface SkillForm {
    name: string
    slug: string
    category: SkillCategory | ''
    description: string
}

const INITIAL_FORM: SkillForm = {
    name: '',
    slug: '',
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
            slug: skill.slug,
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

        if (!form.slug.trim()) {
            setError(t('adminSkills.slugRequired'))
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

        const data = {
            name: form.name.trim(),
            slug: form.slug.trim(),
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

    const handleDelete = async (skill: Skill) => {
        const confirmed = window.confirm(
            `${t('adminSkills.deleteConfirmation')} ${skill.name}`,
        )

        if (!confirmed) {
            return
        }

        setError(null)

        try {
            await deleteSkill(skill.id)

            setSkills((currentSkills) =>
                currentSkills.filter(
                    (currentSkill) =>
                        currentSkill.id !== skill.id,
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
            <div className="admin-skills-page">
                <p>{t('adminSkills.loading')}</p>
            </div>
        )
    }

    return (
        <div className="admin-skills-page">
            <h1>{t('adminSkills.title')}</h1>

            {error && (
                <p
                    className="admin-skills-page__error"
                    role="alert"
                >
                    {error}
                </p>
            )}

            <section className="admin-skills-page__section">
                <div className="admin-skills-page__actions">
                    <button
                        type="button"
                        onClick={openCreateDrawer}
                    >
                        {t('adminSkills.createSkill')}
                    </button>
                </div>
            </section>

            <section className="admin-skills-page__section">
                <h2>{t('adminSkills.search')}</h2>

                <form
                    className="admin-skills-page__search"
                    onSubmit={(event) => {
                        event.preventDefault()
                        void handleSearch()
                    }}
                >
                    <div className="admin-skills-page__field admin-skills-page__search-field">
                        <label htmlFor="skill-search">
                            {t('adminSkills.search')}
                        </label>

                        <input
                            id="skill-search"
                            className="admin-skills-page__search-input"
                            type="search"
                            placeholder={t(
                                'adminSkills.searchPlaceholder',
                            )}
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <div className="admin-skills-page__search-actions">
                        <button type="submit">
                            {t('adminSkills.search')}
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
                    </div>
                </form>
            </section>

            <section className="admin-skills-page__section">
                {skills.length === 0 ? (
                    <p className="admin-skills-page__empty">
                        {search.trim()
                            ? t('adminSkills.noSkillsMatch')
                            : t('adminSkills.noSkills')}
                    </p>
                ) : (
                    <div className="admin-skills-page__table-wrapper">
                        <table className="admin-skills-page__table">
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
                                                            void handleDelete(
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
                    className="admin-skills-page__form"
                    onSubmit={(event) => {
                        event.preventDefault()
                        void saveSkill()
                    }}
                >
                    <div className="admin-skills-page__field">
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

                    <div className="admin-skills-page__field">
                        <label htmlFor="skill-slug">
                            {t('adminSkills.slug')}
                        </label>

                        <input
                            id="skill-slug"
                            type="text"
                            value={form.slug}
                            onChange={(event) =>
                                updateForm(
                                    'slug',
                                    event.target.value,
                                )
                            }
                            disabled={isSaving}
                        />
                    </div>

                    <div className="admin-skills-page__field">
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

                    <div className="admin-skills-page__field">
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

                    <div className="admin-skills-page__actions">
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
        </div>
    )
}

