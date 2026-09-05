import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../services/api/apiError'
import { getCandidateJobs } from '../features/jobs/jobs.api'
import { getSkills } from '../features/candidate/candidate.api'
import type {
    EmploymentType,
    JobDiscoveryQuery,
    JobDiscoveryResponse,
    Skill,
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


    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
    }).format(new Date(value))

}

function CandidateJobsPage() {
    const [response, setResponse] = useState<JobDiscoveryResponse | null>(null)
    const [skills, setSkills] = useState<Skill[]>([])

    const [search, setSearch] = useState('')
    const [location, setLocation] = useState('')
    const [workMode, setWorkMode] = useState<WorkMode | ''>('')
    const [employmentType, setEmploymentType] = useState<
        EmploymentType | ''
    >('')
    const [salaryMin, setSalaryMin] = useState('')
    const [salaryMax, setSalaryMax] = useState('')
    const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
    const [sort, setSort] = useState<JobDiscoveryQuery['sort']>('newest')
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
                    if (caught instanceof ApiError && caught.status === 400) {
                        setError(
                            caught.message ||
                            'The search request is invalid. Please check your filters.',
                        )
                    } else {
                        setError('Unable to load jobs. Please try again.')
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

    return (
        <section className="candidate-jobs-page">
            <header className="candidate-jobs-header">
                <div>
                    <p className="candidate-jobs-eyebrow">Candidate</p>
                    <h1>Find your next opportunity</h1>
                    <p>
                        Search published jobs and filter them by your
                        preferences.
                    </p>
                </div>
            </header>

            <section
                className="candidate-jobs-filters"
                aria-labelledby="job-search-heading"
            >
                <h2 id="job-search-heading">Search jobs</h2>

                <form onSubmit={handleSearchSubmit}>
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

                        <label>
                            Work mode
                            <select
                                value={workMode}
                                onChange={(event) => {
                                    setWorkMode(
                                        event.target.value as WorkMode | '',
                                    )
                                    setPage(1)
                                }}
                            >
                                <option value="">All work modes</option>
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
                            Employment type
                            <select
                                value={employmentType}
                                onChange={(event) => {
                                    setEmploymentType(
                                        event.target
                                            .value as EmploymentType | '',
                                    )
                                    setPage(1)
                                }}
                            >
                                <option value="">All employment types</option>
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
                            Minimum salary
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
                            Maximum salary
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
                            Sort
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
                                <option value="newest">Newest</option>
                                <option value="salary">Salary</option>
                                <option value="title">Title</option>
                            </select>
                        </label>
                    </div>

                    <fieldset className="candidate-jobs-skills">
                        <legend>Skills</legend>

                        {skillsLoading ? (
                            <p>Loading skills...</p>
                        ) : skills.length === 0 ? (
                            <p>No skills available.</p>
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
                        <button type="submit">Search</button>

                        <button
                            type="button"
                            className="candidate-jobs-secondary-button"
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
                        onClick={() => setRetryCount((current) => current + 1)}
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
                    Loading jobs...
                </p>
            )}

            {!error && response && response.total === 0 && (
                <section className="candidate-jobs-state">
                    <h2>No jobs found</h2>
                    <p>
                        No published jobs match your current search and
                        filters.
                    </p>
                    <button type="button" onClick={clearFilters}>
                        Clear filters
                    </button>
                </section>
            )}

            {!error && response && response.total > 0 && (
                <>
                    <div className="candidate-jobs-results-header">
                        <p>
                            {response.total}{' '}
                            {response.total === 1 ? 'job' : 'jobs'} found
                        </p>

                        {pageLoading && (
                            <span role="status">Loading page...</span>
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
                            )

                            return (
                                <article
                                    className="candidate-job-card"
                                    key={job.id}
                                >
                                    <div className="candidate-job-card-main">
                                        <h2>
                                            <Link to={`/jobs/${job.id}`}>
                                                {job.title}
                                            </Link>
                                        </h2>

                                        <p className="candidate-job-company">
                                            {job.company.name}
                                        </p>

                                        <div className="candidate-job-meta">
                                            {job.location && (
                                                <span>{job.location}</span>
                                            )}
                                            <span>{job.workMode}</span>
                                            <span>{job.employmentType}</span>
                                            {salary && <span>{salary}</span>}
                                        </div>

                                        {job.requirements.length > 0 && (
                                            <div className="candidate-job-skills">
                                                {job.requirements.map(
                                                    (requirement) => (
                                                        <span
                                                            key={requirement.id}
                                                        >
                                                            {
                                                                requirement
                                                                    .skill.name
                                                            }
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                        <p className="candidate-job-published">
                                            Published{' '}
                                            {formatDate(job.publishedAt)}
                                        </p>
                                    </div>

                                    <Link
                                        to={`/jobs/${job.id}`}
                                        className="candidate-job-view-button"
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
                            aria-label="Job results pagination"
                        >
                            <button
                                type="button"
                                disabled={page <= 1 || pageLoading}
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
                            >
                                Previous
                            </button>

                            <span>
                                Page {page} of {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={page >= totalPages || pageLoading}
                                onClick={() =>
                                    setPage((current) => current + 1)
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
