import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getCandidateJobs } from '../features/jobs/jobs.api'
import { getSkills } from '../features/candidate/candidate.api'
import {
    EMPLOYMENT_TYPES,
    WORK_MODES,
    type CandidateJob,
    type EmploymentType,
    type JobDiscoveryQuery,
    type WorkMode,
} from '../types/job'
import './CandidateJobsPage.css'
import {
    LOCALES,
    EMPLOYMENT_TYPE_TRANSLATION_KEYS,
    WORK_MODE_TRANSLATION_KEYS,
} from '../i18n'
import { useTranslation } from '../i18n/useTranslation'

const PAGE_SIZE = 20

export function CandidateJobsPage() {
    const { language, t } = useTranslation()
    const locale = LOCALES[language]

    const employmentTypeLabel = (value: EmploymentType) =>
        t(EMPLOYMENT_TYPE_TRANSLATION_KEYS[value])

    const workModeLabel = (value: WorkMode) =>
        t(WORK_MODE_TRANSLATION_KEYS[value])

    function formatSalary(
        salaryMin: string | number | null,
        salaryMax: string | number | null,
        currency: string | null,
    ): string | null {
        if (salaryMin === null && salaryMax === null) {
            return null
        }

        const currencyLabel = currency ? ` ${currency}` : ''

        if (salaryMin !== null && salaryMax !== null) {
            return `${salaryMin} - ${salaryMax}${currencyLabel}`
        }

        if (salaryMin !== null) {
            return `${t('candidateJobs.from')} ${salaryMin}${currencyLabel}`
        }

        return `${t('candidateJobs.upTo')} ${salaryMax}${currencyLabel}`
    }

    function formatDate(value: string | null): string {
        if (!value) {
            return t('candidateJobs.notSpecified')
        }

        return new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
        }).format(new Date(value))
    }

    const [response, setResponse] = useState<{
        items: CandidateJob[]
        total: number
        totalPages: number
    } | null>(null)

    const [search, setSearch] = useState('')
    const [location, setLocation] = useState('')

    const [selectedWorkModes, setSelectedWorkModes] =
        useState<WorkMode[]>([])
    const [pendingWorkModes, setPendingWorkModes] =
        useState<WorkMode[]>([])
    const [workModeDropdownOpen, setWorkModeDropdownOpen] =
        useState(false)

    const [selectedEmploymentTypes, setSelectedEmploymentTypes] =
        useState<EmploymentType[]>([])
    const [pendingEmploymentTypes, setPendingEmploymentTypes] =
        useState<EmploymentType[]>([])
    const [employmentTypeDropdownOpen, setEmploymentTypeDropdownOpen] =
        useState(false)

    const [salaryMin, setSalaryMin] = useState('')
    const [salaryMax, setSalaryMax] = useState('')

    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [pendingSkills, setPendingSkills] = useState<string[]>([])
    const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false)
    const [skillSearch, setSkillSearch] = useState('')
    const [skills, setSkills] = useState<
        Awaited<ReturnType<typeof getSkills>>
    >([])
    const [skillsLoading, setSkillsLoading] = useState(false)

    const [sort, setSort] =
        useState<JobDiscoveryQuery['sort']>('newest')
    const [page, setPage] = useState(1)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    const query = useMemo<JobDiscoveryQuery>(
        () => ({
            q: search || undefined,
            location: location || undefined,
            workModes:
                selectedWorkModes.length > 0
                    ? selectedWorkModes
                    : undefined,
            employmentTypes:
                selectedEmploymentTypes.length > 0
                    ? selectedEmploymentTypes
                    : undefined,
            salaryMin: salaryMin
                ? Number(salaryMin)
                : undefined,
            salaryMax: salaryMax
                ? Number(salaryMax)
                : undefined,
            skillIds:
                selectedSkills.length > 0
                    ? selectedSkills
                    : undefined,
            sort,
            page,
            limit: PAGE_SIZE,
        }),
        [
            search,
            location,
            selectedWorkModes,
            selectedEmploymentTypes,
            salaryMin,
            salaryMax,
            selectedSkills,
            sort,
            page,
        ],
    )

    useEffect(() => {
        if (!skillsDropdownOpen) {
            return
        }

        let cancelled = false

        async function loadSkills() {
            setSkillsLoading(true)

            try {
                const result = await getSkills(skillSearch)

                if (!cancelled) {
                    setSkills(result)
                }
            } catch {
                if (!cancelled) {
                    setSkills([])
                }
            } finally {
                if (!cancelled) {
                    setSkillsLoading(false)
                }
            }
        }

        void loadSkills()

        return () => {
            cancelled = true
        }
    }, [skillsDropdownOpen, skillSearch])

    useEffect(() => {
        let cancelled = false

        async function loadJobs() {
            setLoading(true)
            setError(null)

            try {
                const result = await getCandidateJobs(query)

                if (!cancelled) {
                    setResponse(result)
                }
            } catch {
                if (!cancelled) {
                    setError(t('candidateJobs.loadError'))
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadJobs()

        return () => {
            cancelled = true
        }
    }, [query, retryCount, t])

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPage(1)
    }

    function toggleWorkMode(workMode: WorkMode) {
        setPendingWorkModes((current) =>
            current.includes(workMode)
                ? current.filter((mode) => mode !== workMode)
                : [...current, workMode],
        )
    }

    function openWorkModeDropdown() {
        setPendingWorkModes(selectedWorkModes)
        setWorkModeDropdownOpen(true)
    }

    function closeWorkModeDropdown() {
        setPendingWorkModes(selectedWorkModes)
        setWorkModeDropdownOpen(false)
    }

    function applyWorkModes() {
        setSelectedWorkModes(pendingWorkModes)
        setPage(1)
        setWorkModeDropdownOpen(false)
    }

    function clearWorkModes() {
        setPendingWorkModes([])
        setSelectedWorkModes([])
        setPage(1)
        setWorkModeDropdownOpen(false)
    }

    function toggleEmploymentType(
        employmentType: EmploymentType,
    ) {
        setPendingEmploymentTypes((current) =>
            current.includes(employmentType)
                ? current.filter(
                    (type) => type !== employmentType,
                )
                : [...current, employmentType],
        )
    }

    function openEmploymentTypeDropdown() {
        setPendingEmploymentTypes(selectedEmploymentTypes)
        setEmploymentTypeDropdownOpen(true)
    }

    function closeEmploymentTypeDropdown() {
        setPendingEmploymentTypes(selectedEmploymentTypes)
        setEmploymentTypeDropdownOpen(false)
    }

    function applyEmploymentTypes() {
        setSelectedEmploymentTypes(pendingEmploymentTypes)
        setPage(1)
        setEmploymentTypeDropdownOpen(false)
    }

    function clearEmploymentTypes() {
        setPendingEmploymentTypes([])
        setSelectedEmploymentTypes([])
        setPage(1)
        setEmploymentTypeDropdownOpen(false)
    }

    function toggleSkill(skillId: string) {
        setPendingSkills((current) =>
            current.includes(skillId)
                ? current.filter(
                    (currentSkill) => currentSkill !== skillId,
                )
                : [...current, skillId],
        )
    }

    function openSkillsDropdown() {
        setPendingSkills(selectedSkills)
        setSkillsDropdownOpen(true)
    }

    function closeSkillsDropdown() {
        setPendingSkills(selectedSkills)
        setSkillsDropdownOpen(false)
    }

    function applySkills() {
        setSelectedSkills(pendingSkills)
        setPage(1)
        setSkillsDropdownOpen(false)
    }

    function clearSkills() {
        setPendingSkills([])
        setSelectedSkills([])
        setSkillSearch('')
        setPage(1)
        setSkillsDropdownOpen(false)
    }

    function clearFilters() {
        setSearch('')
        setLocation('')

        setSelectedWorkModes([])
        setPendingWorkModes([])
        setWorkModeDropdownOpen(false)

        setSelectedEmploymentTypes([])
        setPendingEmploymentTypes([])
        setEmploymentTypeDropdownOpen(false)

        setSalaryMin('')
        setSalaryMax('')

        setSelectedSkills([])
        setPendingSkills([])
        setSkillsDropdownOpen(false)
        setSkillSearch('')

        setSort('newest')
        setPage(1)
    }

    const items = response?.items ?? []
    const total = response?.total ?? 0
    const totalPages = response?.totalPages ?? 0

    const selectedWorkModeLabel =
        selectedWorkModes.length === 0
            ? t('candidateJobs.allWorkModes')
            : selectedWorkModes.length === 1
                ? workModeLabel(selectedWorkModes[0])
                : `${selectedWorkModes.length} ${t('candidateJobs.workModesSelected')}`

    const selectedEmploymentTypeLabel =
        selectedEmploymentTypes.length === 0
            ? t('candidateJobs.allEmploymentTypes')
            : selectedEmploymentTypes.length === 1
                ? employmentTypeLabel(selectedEmploymentTypes[0])
                : `${selectedEmploymentTypes.length} ${t(
                    'candidateJobs.employmentTypesSelected',
                )}`

    return (
        <section className="candidate-jobs-page">
            <header className="candidate-jobs-header">
                <div>
                    <p className="candidate-jobs-eyebrow">
                        {t('candidateJobs.eyebrow')}
                    </p>

                    <h1>{t('candidateJobs.title')}</h1>

                    <p>{t('candidateJobs.description')}</p>
                </div>
            </header>

            <section
                aria-labelledby="job-search-heading"
                className="candidate-jobs-filters"
            >
                <h2 id="job-search-heading">
                    {t('candidateJobs.searchJobs')}
                </h2>

                <form onSubmit={handleSearch}>
                    <div className="candidate-jobs-filter-grid">
                        <label>
                            {t('common.search')}

                            <input
                                type="search"
                                value={search}
                                placeholder={t(
                                    'candidateJobs.searchPlaceholder',
                                )}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </label>

                        <label>
                            {t('common.location')}

                            <input
                                type="text"
                                value={location}
                                placeholder={t(
                                    'candidateJobs.locationPlaceholder',
                                )}
                                onChange={(event) => {
                                    setLocation(event.target.value)
                                    setPage(1)
                                }}
                            />
                        </label>

                        <div className="candidate-jobs-work-mode-filter">
                            <span className="candidate-jobs-filter-label">
                                {t('candidateJobs.workMode')}
                            </span>

                            <div className="candidate-jobs-work-mode-dropdown">
                                <button
                                    type="button"
                                    className="candidate-jobs-work-mode-trigger"
                                    aria-label={t(
                                        'candidateJobs.workMode',
                                    )}
                                    aria-haspopup="true"
                                    aria-expanded={
                                        workModeDropdownOpen
                                    }
                                    onClick={() => {
                                        if (
                                            workModeDropdownOpen
                                        ) {
                                            closeWorkModeDropdown()
                                        } else {
                                            openWorkModeDropdown()
                                        }
                                    }}
                                >
                                    <div className="work-mode-label">
                                        {selectedWorkModes.length >
                                            0 && (
                                                <span className="work-mode-count">
                                                    {
                                                        selectedWorkModes.length
                                                    }
                                                </span>
                                            )}

                                        <span>
                                            {selectedWorkModeLabel}
                                        </span>
                                    </div>

                                    <span
                                        aria-hidden="true"
                                        className="candidate-jobs-work-mode-arrow"
                                    >
                                        {workModeDropdownOpen
                                            ? '▲'
                                            : '▼'}
                                    </span>
                                </button>

                                {workModeDropdownOpen && (
                                    <div className="candidate-jobs-work-mode-options">
                                        <fieldset>
                                            <legend className="sr-only">
                                                {t(
                                                    'candidateJobs.workMode',
                                                )}
                                            </legend>

                                            {WORK_MODES.map(
                                                (option) => (
                                                    <label
                                                        key={option}
                                                        className="candidate-jobs-work-mode-option"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={pendingWorkModes.includes(
                                                                option,
                                                            )}
                                                            onChange={() =>
                                                                toggleWorkMode(
                                                                    option,
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {workModeLabel(
                                                                option,
                                                            )}
                                                        </span>
                                                    </label>
                                                ),
                                            )}
                                        </fieldset>

                                        <div className="candidate-jobs-work-mode-actions">
                                            <button
                                                type="button"
                                                className="candidate-jobs-secondary-button"
                                                onClick={
                                                    clearWorkModes
                                                }
                                            >
                                                {t(
                                                    'common.clearFilters',
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    applyWorkModes
                                                }
                                            >
                                                {t('common.search')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="candidate-jobs-work-mode-filter">
                            <span className="candidate-jobs-filter-label">
                                {t('candidateJobs.employmentType')}
                            </span>

                            <div className="candidate-jobs-work-mode-dropdown">
                                <button
                                    type="button"
                                    className="candidate-jobs-work-mode-trigger"
                                    aria-label={t(
                                        'candidateJobs.employmentType',
                                    )}
                                    aria-haspopup="true"
                                    aria-expanded={
                                        employmentTypeDropdownOpen
                                    }
                                    onClick={() => {
                                        if (
                                            employmentTypeDropdownOpen
                                        ) {
                                            closeEmploymentTypeDropdown()
                                        } else {
                                            openEmploymentTypeDropdown()
                                        }
                                    }}
                                >
                                    <div className="work-mode-label">
                                        {selectedEmploymentTypes.length >
                                            0 && (
                                                <span className="work-mode-count">
                                                    {
                                                        selectedEmploymentTypes.length
                                                    }
                                                </span>
                                            )}

                                        <span>
                                            {selectedEmploymentTypeLabel}
                                        </span>
                                    </div>

                                    <span
                                        aria-hidden="true"
                                        className="candidate-jobs-work-mode-arrow"
                                    >
                                        {employmentTypeDropdownOpen
                                            ? '▲'
                                            : '▼'}
                                    </span>
                                </button>

                                {employmentTypeDropdownOpen && (
                                    <div className="candidate-jobs-work-mode-options">
                                        <fieldset>
                                            <legend className="sr-only">
                                                {t(
                                                    'candidateJobs.employmentType',
                                                )}
                                            </legend>

                                            {EMPLOYMENT_TYPES.map(
                                                (option) => (
                                                    <label
                                                        key={option}
                                                        className="candidate-jobs-work-mode-option"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={pendingEmploymentTypes.includes(
                                                                option,
                                                            )}
                                                            onChange={() =>
                                                                toggleEmploymentType(
                                                                    option,
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {employmentTypeLabel(
                                                                option,
                                                            )}
                                                        </span>
                                                    </label>
                                                ),
                                            )}
                                        </fieldset>

                                        <div className="candidate-jobs-work-mode-actions">
                                            <button
                                                type="button"
                                                className="candidate-jobs-secondary-button"
                                                onClick={
                                                    clearEmploymentTypes
                                                }
                                            >
                                                {t(
                                                    'common.clearFilters',
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    applyEmploymentTypes
                                                }
                                            >
                                                {t('common.search')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="candidate-jobs-work-mode-filter">
                            <span className="candidate-jobs-filter-label">
                                {t('candidateJobs.skills')}
                            </span>

                            <div className="candidate-jobs-work-mode-dropdown">
                                <button
                                    type="button"
                                    className="candidate-jobs-work-mode-trigger"
                                    aria-label={t(
                                        'candidateJobs.skills',
                                    )}
                                    aria-haspopup="true"
                                    aria-expanded={skillsDropdownOpen}
                                    onClick={() => {
                                        if (skillsDropdownOpen) {
                                            closeSkillsDropdown()
                                        } else {
                                            openSkillsDropdown()
                                        }
                                    }}
                                >
                                    <div className="work-mode-label">
                                        {selectedSkills.length > 0 && (
                                            <span className="work-mode-count">
                                                {selectedSkills.length}
                                            </span>
                                        )}

                                        <span>
                                            {selectedSkills.length === 0
                                                ? t('candidateJobs.allSkills')
                                                : selectedSkills.length === 1
                                                    ? t('candidateJobs.skill')
                                                    : t('candidateJobs.skills')}
                                        </span>
                                    </div>

                                    <span
                                        aria-hidden="true"
                                        className="candidate-jobs-work-mode-arrow"
                                    >
                                        {skillsDropdownOpen
                                            ? '▲'
                                            : '▼'}
                                    </span>
                                </button>

                                {skillsDropdownOpen && (
                                    <div className="candidate-jobs-work-mode-options">
                                        <input
                                            type="search"
                                            value={skillSearch}
                                            placeholder={t(
                                                'candidateJobs.searchSkillsPlaceholder',
                                            )}
                                            aria-label={t(
                                                'candidateJobs.searchSkillsPlaceholder',
                                            )}
                                            onChange={(event) =>
                                                setSkillSearch(
                                                    event.target.value,
                                                )
                                            }
                                        />

                                        <fieldset>
                                            <legend className="sr-only">
                                                {t(
                                                    'candidateJobs.skills',
                                                )}
                                            </legend>

                                            {skillsLoading && (
                                                <p role="status">
                                                    {t(
                                                        'candidateJobs.loadingSkills',
                                                    )}
                                                </p>
                                            )}

                                            {!skillsLoading &&
                                                skills.length === 0 && (
                                                    <p>
                                                        {t(
                                                            'candidateJobs.noSkillsFound',
                                                        )}
                                                    </p>
                                                )}

                                            {!skillsLoading &&
                                                skills.map((skill) => (
                                                    <label
                                                        key={skill.id}
                                                        className="candidate-jobs-work-mode-option"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={pendingSkills.includes(
                                                                skill.id,
                                                            )}
                                                            onChange={() =>
                                                                toggleSkill(
                                                                    skill.id,
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {skill.name}
                                                        </span>
                                                    </label>
                                                ))}
                                        </fieldset>

                                        <div className="candidate-jobs-work-mode-actions">
                                            <button
                                                type="button"
                                                className="candidate-jobs-secondary-button"
                                                onClick={clearSkills}
                                            >
                                                {t(
                                                    'common.clearFilters',
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={applySkills}
                                            >
                                                {t('common.search')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <label>
                            {t('candidateJobs.minimumSalary')}

                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={salaryMin}
                                onChange={(event) => {
                                    setSalaryMin(
                                        event.target.value,
                                    )
                                    setPage(1)
                                }}
                            />
                        </label>

                        <label>
                            {t('candidateJobs.maximumSalary')}

                            <input
                                type="number"
                                min="0"
                                placeholder="100000"
                                value={salaryMax}
                                onChange={(event) => {
                                    setSalaryMax(
                                        event.target.value,
                                    )
                                    setPage(1)
                                }}
                            />
                        </label>

                        <label>
                            {t('candidateJobs.sort')}

                            <select
                                value={sort}
                                onChange={(event) => {
                                    setSort(
                                        event.target.value as JobDiscoveryQuery['sort'],
                                    )
                                    setPage(1)
                                }}
                            >
                                <option value="newest">
                                    {t('candidateJobs.newest')}
                                </option>

                                <option value="salary">
                                    {t('candidateJobs.salary')}
                                </option>

                                <option value="title">
                                    {t('candidateJobs.titleSort')}
                                </option>
                            </select>
                        </label>
                    </div>

                    <div className="candidate-jobs-filter-actions">
                        <button type="submit">
                            {t('common.search')}
                        </button>

                        <button
                            className="candidate-jobs-secondary-button"
                            type="button"
                            onClick={clearFilters}
                        >
                            {t('common.clearFilters')}
                        </button>
                    </div>
                </form>
            </section>

            {error && (
                <section
                    className="candidate-jobs-state candidate-jobs-state-error"
                    role="alert"
                >
                    <h2>
                        {t('candidateJobs.unableToLoadJobs')}
                    </h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            setRetryCount(
                                (current) => current + 1,
                            )
                        }
                    >
                        {t('common.tryAgain')}
                    </button>
                </section>
            )}

            {!error && loading && !response && (
                <p
                    className="candidate-jobs-loading"
                    role="status"
                    aria-live="polite"
                >
                    {t('candidateJobs.loadingPage')}
                </p>
            )}

            {!error && response && total === 0 && (
                <section className="candidate-jobs-state">
                    <h2>
                        {total} {t('candidateJobs.jobsFound')}
                    </h2>

                    <p>
                        {t('candidateJobs.noJobsMatch')}
                    </p>

                    <button
                        type="button"
                        onClick={clearFilters}
                    >
                        {t('common.clearFilters')}
                    </button>
                </section>
            )}

            {!error && response && total > 0 && (
                <>
                    <div className="candidate-jobs-results-header">
                        <p>
                            {total}{' '}
                            {total === 1
                                ? t('candidateJobs.jobFound')
                                : t('candidateJobs.jobsFound')}
                        </p>

                        {loading && (
                            <span role="status">
                                {t('candidateJobs.loadingPage')}
                            </span>
                        )}
                    </div>

                    <div
                        className="candidate-jobs-list"
                        aria-busy={loading}
                    >
                        {items.map((job) => {
                            const salary = formatSalary(
                                job.salaryMin,
                                job.salaryMax,
                                job.currency,
                            )

                            return (
                                <article
                                    key={job.id}
                                    className="candidate-job-card"
                                >
                                    <div className="candidate-job-card-main">
                                        <h2>
                                            <Link
                                                to={`/jobs/${job.id}`}
                                            >
                                                {job.title}
                                            </Link>
                                        </h2>

                                        <p className="candidate-job-company">
                                            {job.company?.name}
                                        </p>

                                        <div className="candidate-job-meta">
                                            {job.location && (
                                                <span>
                                                    {job.location}
                                                </span>
                                            )}

                                            <span>
                                                {workModeLabel(
                                                    job.workMode,
                                                )}
                                            </span>

                                            <span>
                                                {employmentTypeLabel(
                                                    job.employmentType,
                                                )}
                                            </span>

                                            {salary && (
                                                <span>
                                                    {salary}
                                                </span>
                                            )}
                                        </div>

                                        {job.requirements &&
                                            job.requirements.length >
                                            0 && (
                                                <div className="candidate-job-skills">
                                                    {job.requirements.map(
                                                        (
                                                            requirement,
                                                        ) => (
                                                            <span
                                                                key={
                                                                    requirement.id ??
                                                                    requirement.skillId
                                                                }
                                                            >
                                                                {
                                                                    requirement
                                                                        .skill
                                                                        .name
                                                                }
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                        <p className="candidate-job-published">
                                            {t(
                                                'candidateJobs.published',
                                            )}{' '}
                                            {formatDate(
                                                job.publishedAt ??
                                                job.createdAt,
                                            )}
                                        </p>
                                    </div>

                                    <Link
                                        className="candidate-job-view-button"
                                        to={`/jobs/${job.id}`}
                                    >
                                        {t('candidateJobs.viewJob')}
                                    </Link>
                                </article>
                            )
                        })}
                    </div>

                    {totalPages > 1 && (
                        <nav
                            className="candidate-jobs-pagination"
                            aria-label={t(
                                'candidateJobs.pagination',
                            )}
                        >
                            <button
                                type="button"
                                disabled={
                                    page <= 1 || loading
                                }
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current - 1,
                                    )
                                }
                            >
                                {t('common.previous')}
                            </button>

                            <span>
                                {t('common.page')} {page}{' '}
                                {t('common.of')} {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    page >= totalPages ||
                                    loading
                                }
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current + 1,
                                    )
                                }
                            >
                                {t('common.next')}
                            </button>
                        </nav>
                    )}
                </>
            )}
        </section>
    )
}

export default CandidateJobsPage