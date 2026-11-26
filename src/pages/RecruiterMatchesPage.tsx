import { useEffect, useMemo, useState } from 'react'
import Pagination from '../components/Pagination/Pagination'
import {
    getCandidatesForJob,
    getRecruiterMatchJobs,
} from '../features/matching/matching.api'
import { useTranslation } from '../i18n/useTranslation'
import type {
    MatchingMeta,
    RecruiterCandidateMatch,
    RecruiterMatchJob,
} from '../types/matching'
import './RecruiterMatchesPage.css'

type MatchFilter = 'all' | 'strong' | 'partial' | 'none'
type MatchSort = 'desc' | 'asc'

const PAGE_SIZE = 5

export default function RecruiterMatchesPage() {
    const { t } = useTranslation()

    const [jobs, setJobs] = useState<RecruiterMatchJob[]>([])
    const [jobsLoading, setJobsLoading] = useState(true)
    const [jobsError, setJobsError] = useState(false)
    const [selectedJobId, setSelectedJobId] = useState('')

    const [candidateMatches, setCandidateMatches] = useState<
        RecruiterCandidateMatch[]
    >([])
    const [matchesMeta, setMatchesMeta] = useState<MatchingMeta | null>(null)
    const [matchesLoading, setMatchesLoading] = useState(false)
    const [matchesError, setMatchesError] = useState(false)
    const [matchesPage, setMatchesPage] = useState(1)
    const [matchesRetry, setMatchesRetry] = useState(0)
    const [matchesFilter, setMatchesFilter] = useState<MatchFilter>('all')
    const [matchesSort, setMatchesSort] = useState<MatchSort>('desc')
    const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)

    const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null

    useEffect(() => {
        let cancelled = false

        async function loadJobs() {
            setJobsLoading(true)
            setJobsError(false)

            try {
                const response = await getRecruiterMatchJobs()

                if (!cancelled) {
                    setJobs(response.data)
                    setSelectedJobId((current) => {
                        if (current && response.data.some((job) => job.id === current)) {
                            return current
                        }

                        return response.data[0]?.id ?? ''
                    })
                }
            } catch {
                if (!cancelled) {
                    setJobsError(true)
                }
            } finally {
                if (!cancelled) {
                    setJobsLoading(false)
                }
            }
        }

        void loadJobs()

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        if (!selectedJobId) {
            setCandidateMatches([])
            setMatchesMeta(null)
            setMatchesLoading(false)
            return
        }

        let cancelled = false

        async function loadCandidates() {
            setMatchesLoading(true)
            setMatchesError(false)

            try {
                const response = await getCandidatesForJob(selectedJobId, {
                    page: matchesPage,
                    limit: PAGE_SIZE,
                    scoreRange: matchesFilter,
                })

                if (!cancelled) {
                    setCandidateMatches(response.data)
                    setMatchesMeta(response.meta)
                }
            } catch {
                if (!cancelled) {
                    setMatchesError(true)
                    setCandidateMatches([])
                    setMatchesMeta(null)
                }
            } finally {
                if (!cancelled) {
                    setMatchesLoading(false)
                }
            }
        }

        void loadCandidates()

        return () => {
            cancelled = true
        }
    }, [selectedJobId, matchesPage, matchesFilter, matchesRetry])

    function handleJobChange(jobId: string) {
        setSelectedJobId(jobId)
        setMatchesPage(1)
        setMatchesFilter('all')
        setMatchesSort('desc')
        setExpandedMatchId(null)
    }

    function handleFilterChange(filter: MatchFilter) {
        setMatchesFilter(filter)
        setMatchesPage(1)
        setExpandedMatchId(null)
    }

    const visibleCandidateMatches = useMemo(
        () =>
            [...candidateMatches].sort((a, b) => {
                const difference =
                    Number(b.overallScore) - Number(a.overallScore)

                return matchesSort === 'desc' ? difference : -difference
            }),
        [candidateMatches, matchesSort],
    )

    const filterLabels: Record<MatchFilter, string> = {
        all: t('recruiterMatches.allCandidates'),
        strong: t('recruiterMatches.strongMatchesFilter'),
        partial: t('recruiterMatches.partialMatchesFilter'),
        none: t('recruiterMatches.noMatchesFilter'),
    }

    if (jobsLoading) {
        return (
            <main className="recruiter-matches-page">
                <div className="recruiter-matches-state" role="status">
                    {t('recruiterMatches.loading')}
                </div>
            </main>
        )
    }

    if (jobsError) {
        return (
            <main className="recruiter-matches-page">
                <div className="recruiter-matches-state recruiter-matches-error" role="alert">
                    <p>{t('recruiterMatches.loadError')}</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        {t('dashboard.retry')}
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="recruiter-matches-page">
            <header className="recruiter-matches-page-header">
                <h1>{t('recruiterMatches.overviewTitle')}</h1>
                <p>{t('recruiterMatches.overviewDescription')}</p>
            </header>

            {jobs.length === 0 ? (
                <section className="recruiter-matches-empty-jobs">
                    <h2>{t('recruiterMatches.noPublishedJobs')}</h2>
                    <p>{t('recruiterMatches.noPublishedJobsDescription')}</p>
                </section>
            ) : (
                <>
                    <section className="recruiter-matches-overview">
                        <div className="recruiter-matches-overview-card">
                            <span>{t('recruiterMatches.publishedJobs')}</span>
                            <strong>{jobs.length}</strong>
                        </div>
                        <div className="recruiter-matches-overview-card">
                            <span>{t('recruiterMatches.totalMatches')}</span>
                            <strong>
                                {jobs.reduce((total, job) => total + job.matchCount, 0)}
                            </strong>
                        </div>
                        <div className="recruiter-matches-overview-card">
                            <span>{t('recruiterMatches.strongMatchesTotal')}</span>
                            <strong>
                                {jobs.reduce(
                                    (total, job) => total + job.strongMatchCount,
                                    0,
                                )}
                            </strong>
                        </div>
                    </section>

                    <section className="recruiter-matches-job-selection">
                        <label htmlFor="recruiter-match-job">
                            {t('recruiterMatches.selectJob')}
                        </label>
                        <select
                            id="recruiter-match-job"
                            value={selectedJobId}
                            onChange={(event) => handleJobChange(event.target.value)}
                        >
                            {jobs.map((job) => (
                                <option key={job.id} value={job.id}>
                                    {job.title} ({job.matchCount}{' '}
                                    {t('recruiterMatches.jobMatches')})
                                </option>
                            ))}
                        </select>
                    </section>

                    {selectedJob && (
                        <section className="recruiter-matches-section">
                            <div className="recruiter-matches-section-header">
                                <div>
                                    <h2>{selectedJob.title}</h2>
                                    <p>
                                        {selectedJob.matchCount}{' '}
                                        {t('recruiterMatches.totalMatches').toLowerCase()}
                                    </p>
                                </div>
                            </div>

                            <div className="recruiter-matches-job-stats">
                                <div className="recruiter-matches-stat">
                                    <strong>{selectedJob.matchCount}</strong>
                                    <span>{t('recruiterMatches.totalMatches')}</span>
                                </div>
                                <div className="recruiter-matches-stat">
                                    <strong>{selectedJob.strongMatchCount}</strong>
                                    <span>{t('recruiterMatches.strongMatchesTotal')}</span>
                                </div>
                                <div className="recruiter-matches-stat">
                                    <strong>{selectedJob.partialMatchCount}</strong>
                                    <span>{t('recruiterMatches.partialMatches')}</span>
                                </div>
                                <div className="recruiter-matches-stat">
                                    <strong>{selectedJob.noMatchCount}</strong>
                                    <span>{t('recruiterMatches.noMatches')}</span>
                                </div>
                            </div>

                            <div className="recruiter-matches-toolbar">
                                <div
                                    className="recruiter-matches-filters"
                                    aria-label={t('recruiterMatches.filterCandidatesByScore')}
                                >
                                    {(Object.keys(filterLabels) as MatchFilter[]).map(
                                        (filter) => (
                                            <button
                                                key={filter}
                                                type="button"
                                                className={`recruiter-matches-filter ${matchesFilter === filter ? 'active' : ''
                                                    }`}
                                                aria-pressed={matchesFilter === filter}
                                                onClick={() => handleFilterChange(filter)}
                                            >
                                                {filterLabels[filter]}
                                            </button>
                                        ),
                                    )}
                                </div>

                                <label className="recruiter-matches-sort">
                                    <span>{t('recruiterMatches.sortByScore')}</span>
                                    <select
                                        value={matchesSort}
                                        onChange={(event) =>
                                            setMatchesSort(event.target.value as MatchSort)
                                        }
                                    >
                                        <option value="desc">
                                            {t('recruiterMatches.highestFirst')}
                                        </option>
                                        <option value="asc">
                                            {t('recruiterMatches.lowestFirst')}
                                        </option>
                                    </select>
                                </label>
                            </div>

                            {matchesLoading ? (
                                <p className="recruiter-matches-state" role="status">
                                    {t('recruiterMatches.loading')}
                                </p>
                            ) : matchesError ? (
                                <div className="recruiter-matches-state recruiter-matches-error" role="alert">
                                    <p>{t('recruiterMatches.loadError')}</p>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setMatchesRetry((value) => value + 1)}
                                    >
                                        {t('dashboard.retry')}
                                    </button>
                                </div>
                            ) : visibleCandidateMatches.length > 0 ? (
                                <>
                                    <div className="recruiter-matches-list">
                                        {visibleCandidateMatches.map((match) => {
                                            const score = Number(match.overallScore)
                                            const isExpanded = expandedMatchId === match.id

                                            const matchStatus =
                                                score >= 80
                                                    ? t('recruiterMatches.strongMatch')
                                                    : score > 0
                                                        ? t('recruiterMatches.partialMatch')
                                                        : t('recruiterMatches.noMatch')

                                            return (
                                                <article
                                                    className="recruiter-match-card"
                                                    key={match.id}
                                                >
                                                    <div className="recruiter-match-card-main">
                                                        <div className="recruiter-match-candidate">
                                                            <h3>
                                                                {match.candidate.user.firstName}{' '}
                                                                {match.candidate.user.lastName}
                                                            </h3>
                                                            {match.candidate.headline && (
                                                                <p>{match.candidate.headline}</p>
                                                            )}
                                                            {match.candidate.location && (
                                                                <span>{match.candidate.location}</span>
                                                            )}
                                                        </div>

                                                        <div className="recruiter-match-score">
                                                            <strong>{score}%</strong>
                                                            <span>{t('recruiterMatches.matchScore')}</span>
                                                            <div
                                                                className="recruiter-match-progress"
                                                                role="progressbar"
                                                                aria-valuenow={score}
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                                aria-label={`${score}%`}
                                                            >
                                                                <span
                                                                    style={{
                                                                        width: `${Math.min(
                                                                            100,
                                                                            Math.max(0, score),
                                                                        )}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="recruiter-match-label">
                                                                {matchStatus}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="recruiter-match-details-toggle"
                                                        aria-expanded={isExpanded}
                                                        onClick={() =>
                                                            setExpandedMatchId(
                                                                isExpanded ? null : match.id,
                                                            )
                                                        }
                                                    >
                                                        {isExpanded
                                                            ? t('recruiterMatches.hideDetails')
                                                            : t('recruiterMatches.viewDetails')}
                                                        <span aria-hidden="true">
                                                            {isExpanded ? '−' : '+'}
                                                        </span>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="recruiter-match-details">
                                                            {match.explanation?.strengths &&
                                                                match.explanation.strengths.length > 0 && (
                                                                    <div className="recruiter-match-skills">
                                                                        <strong>
                                                                            {t('recruiterMatches.skills')}
                                                                        </strong>
                                                                        <ul>
                                                                            {match.explanation.strengths.map(
                                                                                (strength) => (
                                                                                    <li key={strength.skill}>
                                                                                        <span>{strength.skill}</span>
                                                                                        <span>
                                                                                            {t('recruiterMatches.level')}{' '}
                                                                                            {strength.candidateLevel ??
                                                                                                '—'}
                                                                                        </span>
                                                                                    </li>
                                                                                ),
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                            {match.explanation?.gaps &&
                                                                match.explanation.gaps.length > 0 && (
                                                                    <div className="recruiter-match-gaps">
                                                                        <strong>
                                                                            {t('recruiterMatches.skillGaps')}
                                                                        </strong>
                                                                        <ul>
                                                                            {match.explanation.gaps.map((gap) => (
                                                                                <li key={gap.skill}>
                                                                                    <span>{gap.skill}</span>
                                                                                    <span>
                                                                                        {t('recruiterMatches.requiredLevel')}{' '}
                                                                                        {gap.requiredLevel}
                                                                                    </span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                            {(!match.explanation?.strengths ||
                                                                match.explanation.strengths.length === 0) &&
                                                                (!match.explanation?.gaps ||
                                                                    match.explanation.gaps.length === 0) && (
                                                                    <p>
                                                                        {t('recruiterMatches.noSkillDetails')}
                                                                    </p>
                                                                )}
                                                        </div>
                                                    )}
                                                </article>
                                            )
                                        })}
                                    </div>

                                    {matchesMeta && matchesMeta.total > matchesMeta.limit && (
                                        <Pagination
                                            currentPage={matchesPage}
                                            totalItems={matchesMeta.total}
                                            itemsPerPage={matchesMeta.limit}
                                            onPageChange={(page) => {
                                                setMatchesPage(page)
                                                setExpandedMatchId(null)
                                            }}
                                        />
                                    )}
                                </>
                            ) : (
                                <p className="recruiter-matches-state">
                                    {matchesMeta?.total === 0
                                        ? t('recruiterMatches.empty')
                                        : t('recruiterMatches.noCandidatesForFilter')}
                                </p>
                            )}
                        </section>
                    )}
                </>
            )}
        </main>
    )
}
