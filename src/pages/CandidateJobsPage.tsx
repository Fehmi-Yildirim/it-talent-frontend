import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCandidateJobs } from '../features/jobs/jobs.api'
import type {
    CandidateJob,
    EmploymentType,
    JobDiscoveryQuery,
    WorkMode,
} from '../types/job'
import './CandidateJobsPage.css'

const PAGE_SIZE = 20

const employmentTypes: Array<{
    value: EmploymentType
    label: string
}> = [
        { value: 'FULL_TIME', label: 'Full-time' },
        { value: 'PART_TIME', label: 'Part-time' },
        { value: 'CONTRACT', label: 'Contract' },
        { value: 'FREELANCE', label: 'Freelance' },
        { value: 'INTERNSHIP', label: 'Internship' },
    ]

const workModes: Array<{
    value: WorkMode
    label: string
}> = [
        { value: 'REMOTE', label: 'Remote' },
        { value: 'HYBRID', label: 'Hybrid' },
        { value: 'ONSITE', label: 'On-site' },
        { value: 'FLEXIBLE', label: 'Flexible' },
    ]

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
        return `From ${salaryMin}${currencyLabel}`
    }

    return `Up to ${salaryMax}${currencyLabel}`
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not specified'
    }

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
    }).format(new Date(value))
}

export function CandidateJobsPage() {
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
                    setError('Failed to load jobs.')
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
    }, [query, retryCount])

    function handleSearch(
        event: React.FormEvent<HTMLFormElement>,
    ) {
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

    function toggleSkill(skill: string) {
        setSelectedSkills((current) =>
            current.includes(skill)
                ? current.filter(
                    (currentSkill) => currentSkill !== skill,
                )
                : [...current, skill],
        )
        setPage(1)
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
        setSort('newest')
        setPage(1)
    }

    const items = response?.items ?? []
    const total = response?.total ?? 0
    const totalPages = response?.totalPages ?? 0

    const workModeLabel =
        selectedWorkModes.length === 0
            ? 'All work modes'
            : selectedWorkModes.length === 1
                ? workModes.find(
                    (option) =>
                        option.value === selectedWorkModes[0],
                )?.label ?? 'All work modes'
                : `${selectedWorkModes.length} work modes`

    const employmentTypeLabel =
        selectedEmploymentTypes.length === 0
            ? 'All employment types'
            : selectedEmploymentTypes.length === 1
                ? employmentTypes.find(
                    (option) =>
                        option.value === selectedEmploymentTypes[0],
                )?.label ?? 'All employment types'
                : `${selectedEmploymentTypes.length} employment types`

    return (
        <section className="candidate-jobs-page">
            <header className="candidate-jobs-header">
                <div>
                    <p className="candidate-jobs-eyebrow">
                        Candidate
                    </p>

                    <h1>Find your next opportunity</h1>

                    <p>
                        Search published jobs and filter them by
                        your preferences.
                    </p>
                </div>
            </header>

            <section
                aria-labelledby="job-search-heading"
                className="candidate-jobs-filters"
            >
                <h2 id="job-search-heading">
                    Search jobs
                </h2>

                <form onSubmit={handleSearch}>
                    <div className="candidate-jobs-filter-grid">
                        <label>
                            Search

                            <input
                                type="search"
                                value={search}
                                placeholder="Title, description or company"
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </label>

                        <label>
                            Location

                            <input
                                type="text"
                                value={location}
                                placeholder="Amsterdam"
                                onChange={(event) => {
                                    setLocation(event.target.value)
                                    setPage(1)
                                }}
                            />
                        </label>

                        <div className="candidate-jobs-work-mode-filter">
                            <span className="candidate-jobs-filter-label">
                                Work mode
                            </span>

                            <div className="candidate-jobs-work-mode-dropdown">
                                <button
                                    type="button"
                                    className="candidate-jobs-work-mode-trigger"
                                    aria-label="Work mode"
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
                                            {workModeLabel}
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
                                                Work mode
                                            </legend>

                                            {workModes.map(
                                                (option) => (
                                                    <label
                                                        key={
                                                            option.value
                                                        }
                                                        className="candidate-jobs-work-mode-option"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={pendingWorkModes.includes(
                                                                option.value,
                                                            )}
                                                            onChange={() =>
                                                                toggleWorkMode(
                                                                    option.value,
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {
                                                                option.label
                                                            }
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
                                                Clear filters
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    applyWorkModes
                                                }
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="candidate-jobs-work-mode-filter">
                            <span className="candidate-jobs-filter-label">
                                Employment type
                            </span>

                            <div className="candidate-jobs-work-mode-dropdown">
                                <button
                                    type="button"
                                    className="candidate-jobs-work-mode-trigger"
                                    aria-label="Employment type"
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
                                            {employmentTypeLabel}
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
                                                Employment type
                                            </legend>

                                            {employmentTypes.map(
                                                (option) => (
                                                    <label
                                                        key={
                                                            option.value
                                                        }
                                                        className="candidate-jobs-work-mode-option"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={pendingEmploymentTypes.includes(
                                                                option.value,
                                                            )}
                                                            onChange={() =>
                                                                toggleEmploymentType(
                                                                    option.value,
                                                                )
                                                            }
                                                        />

                                                        <span>
                                                            {
                                                                option.label
                                                            }
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
                                                Clear filters
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    applyEmploymentTypes
                                                }
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <label>
                            Minimum salary

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
                            Maximum salary

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
                            Sort

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
                                    Newest
                                </option>

                                <option value="salary">
                                    Salary
                                </option>

                                <option value="title">
                                    Title
                                </option>
                            </select>
                        </label>
                    </div>

                    <fieldset className="candidate-jobs-skills">
                        <legend>Skills</legend>

                        <div className="candidate-jobs-skill-list">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedSkills.includes(
                                        'React',
                                    )}
                                    onChange={() =>
                                        toggleSkill('React')
                                    }
                                />

                                React
                            </label>

                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedSkills.includes(
                                        'TypeScript',
                                    )}
                                    onChange={() =>
                                        toggleSkill(
                                            'TypeScript',
                                        )
                                    }
                                />

                                TypeScript
                            </label>
                        </div>
                    </fieldset>

                    <div className="candidate-jobs-filter-actions">
                        <button type="submit">
                            Search
                        </button>

                        <button
                            className="candidate-jobs-secondary-button"
                            type="button"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>
                    </div>
                </form>
            </section>

            {error && (
                <section
                    className="candidate-jobs-state candidate-jobs-state-error"
                    role="alert"
                >
                    <h2>Unable to load jobs</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            setRetryCount(
                                (current) => current + 1,
                            )
                        }
                    >
                        Try again
                    </button>
                </section>
            )}

            {!error && loading && !response && (
                <p
                    className="candidate-jobs-loading"
                    role="status"
                    aria-live="polite"
                >
                    Loading page...
                </p>
            )}

            {!error && response && total === 0 && (
                <section className="candidate-jobs-state">
                    <h2>{total} jobs found</h2>
                    <p>
                        No jobs match your current filters.
                    </p>

                    <button
                        type="button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                </section>
            )}

            {!error && response && total > 0 && (
                <>
                    <div className="candidate-jobs-results-header">
                        <p>
                            {total}{' '}
                            {total === 1
                                ? 'job found'
                                : 'jobs found'}
                        </p>

                        {loading && (
                            <span role="status">
                                Loading page...
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
                                                    {
                                                        job.location
                                                    }
                                                </span>
                                            )}

                                            <span>
                                                {job.workMode}
                                            </span>

                                            <span>
                                                {
                                                    job.employmentType
                                                }
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
                                            Published{' '}
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
                                        View job
                                    </Link>
                                </article>
                            )
                        })}
                    </div>

                    {totalPages > 1 && (
                        <nav
                            className="candidate-jobs-pagination"
                            aria-label="Job pagination"
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
                                Previous
                            </button>

                            <span>
                                Page {page} of {totalPages}
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
                                Next
                            </button>
                        </nav>
                    )}
                </>
            )}
        </section>
    )
}

export default CandidateJobsPage
