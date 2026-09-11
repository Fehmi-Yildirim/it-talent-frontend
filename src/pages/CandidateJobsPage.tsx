import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../services/api/apiError'
import { getCandidateJobs } from '../features/jobs/jobs.api'
import { getSkills } from '../features/candidate/candidate.api'
import { useTranslation } from '../i18n/useTranslation'
import type {
    EmploymentType,
    JobDiscoveryQuery,
    JobDiscoveryResponse,
    Skill,
    WorkMode,
} from '../types/job'
import './CandidateJobsPage.css'

const PAGE_SIZE = 20

function formatSalary(
    salaryMin: string | number | null,
    salaryMax: string | number | null,
    currency: string | null,
    from: string,
    upTo: string,
): string | null {
    if (salaryMin === null && salaryMax === null) {
        return null
    }

    const currencyLabel = currency ? ` ${currency}` : ''

    if (salaryMin !== null && salaryMax !== null) {
        return `${salaryMin} - ${salaryMax}${currencyLabel}`
    }

    if (salaryMin !== null) {
        return `${from} ${salaryMin}${currencyLabel}`
    }

    return `${upTo} ${salaryMax}${currencyLabel}`
}

function formatDate(
    value: string | null,
    locale: string,
    notSpecified: string,
): string {
    if (!value) {
        return notSpecified
    }

    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
    }).format(new Date(value))
}

function CandidateJobsPage() {
    const { language, t } = useTranslation()

    const employmentTypes: Array<{
        value: EmploymentType
        label: string
    }> = [
            { value: 'FULL_TIME', label: t('candidateJobs.fullTime') },
            { value: 'PART_TIME', label: t('candidateJobs.partTime') },
            { value: 'CONTRACT', label: t('candidateJobs.contract') },
            { value: 'FREELANCE', label: t('candidateJobs.freelance') },
            { value: 'INTERNSHIP', label: t('candidateJobs.internship') },
        ]

    const workModes: Array<{
        value: WorkMode
        label: string
    }> = [
            { value: 'REMOTE', label: t('candidateJobs.remote') },
            { value: 'HYBRID', label: t('candidateJobs.hybrid') },
            { value: 'ONSITE', label: t('candidateJobs.onsite') },
            { value: 'FLEXIBLE', label: t('candidateJobs.flexible') },
        ]

    const [response, setResponse] =
        useState<JobDiscoveryResponse | null>(null)
    const [skills, setSkills] = useState<Skill[]>([])

    const [search, setSearch] = useState('')
    const [location, setLocation] = useState('')
    const [workMode, setWorkMode] = useState<WorkMode | ''>('')
    const [employmentType, setEmploymentType] =
        useState<EmploymentType | ''>('')
    const [salaryMin, setSalaryMin] = useState('')
    const [salaryMax, setSalaryMax] = useState('')
    const [selectedSkillIds, setSelectedSkillIds] =
        useState<string[]>([])
    const [sort, setSort] =
        useState<JobDiscoveryQuery['sort']>('newest')
    const [page, setPage] = useState(1)

    const [loading, setLoading] = useState(true)
    const [skillsLoading, setSkillsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pageLoading, setPageLoading] = useState(false)
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function loadSkills() {
            setSkillsLoading(true)

            try {
                const result = await getSkills()

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
    }, [])

    useEffect(() => {
        let cancelled = false

        async function loadJobs() {
            setLoading(true)
            setPageLoading(true)
            setError(null)

            const query: JobDiscoveryQuery = {
                q: search || undefined,
                location: location || undefined,
                workMode: workMode || undefined,
                employmentType: employmentType || undefined,
                salaryMin: salaryMin ? Number(salaryMin) : undefined,
                salaryMax: salaryMax ? Number(salaryMax) : undefined,
                skillIds:
                    selectedSkillIds.length > 0
                        ? selectedSkillIds
                        : undefined,
                sort,
                page,
                limit: PAGE_SIZE,
            }

            try {
                const result = await getCandidateJobs(query)

                if (!cancelled) {
                    setResponse(result)
                }
            } catch (caught) {
                if (!cancelled) {
                    if (
                        caught instanceof ApiError &&
                        caught.status === 400
                    ) {
                        setError(
                            caught.message ||
                            t('candidateJobs.invalidSearch'),
                        )
                    } else {
                        setError(t('candidateJobs.loadError'))
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                    setPageLoading(false)
                }
            }
        }

        void loadJobs()

        return () => {
            cancelled = true
        }
    }, [
        search,
        location,
        workMode,
        employmentType,
        salaryMin,
        salaryMax,
        selectedSkillIds,
        sort,
        page,
        retryCount,
        t,
    ])

    function handleSearchSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()
        setPage(1)
    }

    function toggleSkill(skillId: string) {
        setSelectedSkillIds((current) =>
            current.includes(skillId)
                ? current.filter((id) => id !== skillId)
                : [...current, skillId],
        )
        setPage(1)
    }

    function clearFilters() {
        setSearch('')
        setLocation('')
        setWorkMode('')
        setEmploymentType('')
        setSalaryMin('')
        setSalaryMax('')
        setSelectedSkillIds([])
        setSort('newest')
        setPage(1)
    }

    const items = response?.items ?? []
    const totalPages = response?.totalPages ?? 0
    const locale = language === 'nl' ? 'nl-NL' : 'en-US'

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
                className="candidate-jobs-filters"
                aria-labelledby="job-search-heading"
            >
                <h2 id="job-search-heading">
                    {t('candidateJobs.searchJobs')}
                </h2>

                <form onSubmit={handleSearchSubmit}>
                    <div className="candidate-jobs-filter-grid">
                        <label>
                            {t('candidateJobs.search')}

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
                            {t('candidateJobs.location')}

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

                        <label>
                            {t('candidateJobs.workMode')}

                            <select
                                value={workMode}
                                onChange={(event) => {
                                    setWorkMode(
                                        event.target.value as
                                        | WorkMode
                                        | '',
                                    )
                                    setPage(1)
                                }}
                            >
                                <option value="">
                                    {t(
                                        'candidateJobs.allWorkModes',
                                    )}
                                </option>

                                {workModes.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            {t('candidateJobs.employmentType')}

                            <select
                                value={employmentType}
                                onChange={(event) => {
                                    setEmploymentType(
                                        event.target.value as
                                        | EmploymentType
                                        | '',
                                    )
                                    setPage(1)
                                }}
                            >
                                <option value="">
                                    {t(
                                        'candidateJobs.allEmploymentTypes',
                                    )}
                                </option>

                                {employmentTypes.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            {t('candidateJobs.minimumSalary')}

                            <input
                                type="number"
                                min="0"
                                value={salaryMin}
                                placeholder="0"
                                onChange={(event) => {
                                    setSalaryMin(event.target.value)
                                    setPage(1)
                                }}
                            />
                        </label>

                        <label>
                            {t('candidateJobs.maximumSalary')}

                            <input
                                type="number"
                                min="0"
                                value={salaryMax}
                                placeholder="100000"
                                onChange={(event) => {
                                    setSalaryMax(event.target.value)
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
                                        event.target
                                            .value as JobDiscoveryQuery['sort'],
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

                    <fieldset className="candidate-jobs-skills">
                        <legend>
                            {t('candidateJobs.skills')}
                        </legend>

                        {skillsLoading ? (
                            <p>
                                {t('candidateJobs.loadingSkills')}
                            </p>
                        ) : skills.length === 0 ? (
                            <p>{t('candidateJobs.noSkills')}</p>
                        ) : (
                            <div className="candidate-jobs-skill-list">
                                {skills.map((skill) => (
                                    <label key={skill.id}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSkillIds.includes(
                                                skill.id,
                                            )}
                                            onChange={() =>
                                                toggleSkill(skill.id)
                                            }
                                        />

                                        {skill.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    </fieldset>

                    <div className="candidate-jobs-filter-actions">
                        <button type="submit">
                            {t('candidateJobs.search')}
                        </button>

                        <button
                            type="button"
                            className="candidate-jobs-secondary-button"
                            onClick={clearFilters}
                        >
                            {t('candidateJobs.clearFilters')}
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
                        {t('candidateJobs.tryAgain')}
                    </button>
                </section>
            )}

            {!error && loading && !response && (
                <p
                    className="candidate-jobs-loading"
                    role="status"
                    aria-live="polite"
                >
                    {t('candidateJobs.loadingJobs')}
                </p>
            )}

            {!error && response && response.total === 0 && (
                <section className="candidate-jobs-state">
                    <h2>{t('candidateJobs.noJobsFound')}</h2>

                    <p>{t('candidateJobs.noJobsMatch')}</p>

                    <button
                        type="button"
                        onClick={clearFilters}
                    >
                        {t('candidateJobs.clearFilters')}
                    </button>
                </section>
            )}

            {!error && response && response.total > 0 && (
                <>
                    <div className="candidate-jobs-results-header">
                        <p>
                            {response.total}{' '}
                            {response.total === 1
                                ? t('candidateJobs.jobFound')
                                : t('candidateJobs.jobsFound')}
                        </p>

                        {pageLoading && (
                            <span role="status">
                                {t('candidateJobs.loadingPage')}
                            </span>
                        )}
                    </div>

                    <div
                        className="candidate-jobs-list"
                        aria-busy={pageLoading}
                    >
                        {items.map((job) => {
                            const salary = formatSalary(
                                job.salaryMin,
                                job.salaryMax,
                                job.currency,
                                t('candidateJobs.from'),
                                t('candidateJobs.upTo'),
                            )

                            return (
                                <article
                                    className="candidate-job-card"
                                    key={job.id}
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
                                            {job.company.name}
                                        </p>

                                        <div className="candidate-job-meta">
                                            {job.location && (
                                                <span>
                                                    {job.location}
                                                </span>
                                            )}

                                            <span>
                                                {job.workMode}
                                            </span>

                                            <span>
                                                {job.employmentType}
                                            </span>

                                            {salary && (
                                                <span>{salary}</span>
                                            )}
                                        </div>

                                        {job.requirements.length > 0 && (
                                            <div className="candidate-job-skills">
                                                {job.requirements.map(
                                                    (requirement) => (
                                                        <span
                                                            key={
                                                                requirement.id
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
                                                job.publishedAt,
                                                locale,
                                                t(
                                                    'candidateJobs.notSpecified',
                                                ),
                                            )}
                                        </p>
                                    </div>

                                    <Link
                                        to={`/jobs/${job.id}`}
                                        className="candidate-job-view-button"
                                    >
                                        {t(
                                            'candidateJobs.viewJob',
                                        )}
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
                                    page <= 1 || pageLoading
                                }
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current - 1,
                                    )
                                }
                            >
                                {t('candidateJobs.previous')}
                            </button>

                            <span>
                                {t('candidateJobs.page')} {page}{' '}
                                {t('candidateJobs.of')}{' '}
                                {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    page >= totalPages ||
                                    pageLoading
                                }
                                onClick={() =>
                                    setPage(
                                        (current) =>
                                            current + 1,
                                    )
                                }
                            >
                                {t('candidateJobs.next')}
                            </button>
                        </nav>
                    )}
                </>
            )}
        </section>
    )
}

export default CandidateJobsPage
