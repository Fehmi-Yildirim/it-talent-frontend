import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../components/Pagination/Pagination'
import { getMyMatches } from '../features/matching/matching.api'
import { ApiError } from '../services/api/apiError'
import { LOCALES } from '../i18n'
import { useTranslation } from '../i18n/useTranslation'
import type {
    CandidateMatch,
    MatchingMeta,
} from '../types/matching'
import './CandidateMatchesPage.css'

const PAGE_SIZE = 5

function formatScore(score: number | string): string {
    const value = Number(score)

    return Number.isFinite(value)
        ? `${Math.round(value)}%`
        : '—'
}

export default function CandidateMatchesPage() {
    const { language, t } = useTranslation()
    const [matches, setMatches] = useState<CandidateMatch[]>([])
    const [meta, setMeta] = useState<MatchingMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [retryCount, setRetryCount] = useState(0)

    const locale = LOCALES[language]

    useEffect(() => {
        let cancelled = false

        async function loadMatches() {
            setLoading(true)
            setError(false)

            try {
                const response = await getMyMatches({
                    page: currentPage,
                    limit: PAGE_SIZE,
                })

                if (!cancelled) {
                    setMatches(response.data)
                    setMeta(response.meta)
                }
            } catch (caught) {
                if (!cancelled) {
                    setError(true)

                    if (caught instanceof ApiError) {
                        console.error(
                            'Failed to load candidate matches:',
                            caught.status,
                        )
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadMatches()

        return () => {
            cancelled = true
        }
    }, [currentPage, retryCount])

    return (
        <section className="candidate-matches-page">
            <header className="candidate-matches-header">
                <p className="candidate-matches-eyebrow">
                    {t('candidateMatches.eyebrow')}
                </p>
                <h1>{t('candidateMatches.title')}</h1>
                <p>{t('candidateMatches.description')}</p>
            </header>

            {loading && (
                <p className="candidate-matches-state" role="status">
                    {t('candidateMatches.loading')}
                </p>
            )}

            {!loading && error && (
                <div className="candidate-matches-state" role="alert">
                    <p>{t('candidateMatches.loadError')}</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setRetryCount((value) => value + 1)}
                    >
                        {t('common.tryAgain')}
                    </button>
                </div>
            )}

            {!loading && !error && matches.length === 0 && (
                <div className="candidate-matches-state">
                    <h2>{t('candidateMatches.emptyTitle')}</h2>
                    <p>{t('candidateMatches.emptyDescription')}</p>
                    <Link to="/jobs" className="btn btn-primary">
                        {t('common.findJobs')}
                    </Link>
                </div>
            )}

            {!loading && !error && matches.length > 0 && (
                <>
                    <div className="candidate-matches-list">
                        {matches.map((match) => {
                            const strengths =
                                match.explanation?.strengths ?? []
                            const gaps = match.explanation?.gaps ?? []

                            return (
                                <article
                                    className="candidate-match-card"
                                    key={match.id}
                                >
                                    <div className="candidate-match-card__header">
                                        <div>
                                            <h2>
                                                <Link
                                                    to={`/jobs/${match.job.id}`}
                                                    className="candidate-match-title-link"
                                                >
                                                    {match.job.title}
                                                </Link>
                                            </h2>
                                            <p>
                                                {match.job.company?.name}
                                                {match.job.location
                                                    ? ` · ${match.job.location}`
                                                    : ''}
                                            </p>
                                        </div>

                                        <div className="candidate-match-score">
                                            <strong>
                                                {formatScore(match.overallScore)}
                                            </strong>
                                            <span>
                                                {t('candidateMatches.matchScore')}
                                            </span>
                                        </div>
                                    </div>

                                    {(strengths.length > 0 || gaps.length > 0) && (
                                        <div className="candidate-match-skills">
                                            {strengths.length > 0 && (
                                                <div>
                                                    <h3>
                                                        {t('candidateMatches.matchingSkills')}
                                                    </h3>
                                                    <ul>
                                                        {strengths.map((item) => (
                                                            <li key={`${item.skill}-strength`}>
                                                                {item.skill}
                                                                {' · '}
                                                                {t('candidateMatches.yourLevel')}
                                                                {' '}
                                                                {item.candidateLevel}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {gaps.length > 0 && (
                                                <div>
                                                    <h3>
                                                        {t('candidateMatches.skillGaps')}
                                                    </h3>
                                                    <ul>
                                                        {gaps.map((item) => (
                                                            <li key={`${item.skill}-gap`}>
                                                                {item.skill}
                                                                {' · '}
                                                                {t('candidateMatches.requiredLevel')}
                                                                {' '}
                                                                {item.requiredLevel}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="candidate-match-card__footer">
                                        <span>
                                            {t('candidateMatches.calculatedAt')}
                                            {' '}
                                            {new Intl.DateTimeFormat(locale, {
                                                dateStyle: 'medium',
                                            }).format(new Date(match.calculatedAt))}
                                        </span>

                                        <Link
                                            to={`/jobs/${match.job.id}`}
                                            className="btn btn-secondary"
                                        >
                                            {t('candidateMatches.viewJob')}
                                        </Link>
                                    </div>
                                </article>
                            )
                        })}
                    </div>

                    {meta && meta.totalPages > 1 && (
                        <div className="candidate-matches-pagination">
                            <Pagination
                                currentPage={meta.page}
                                totalItems={meta.total}
                                itemsPerPage={meta.limit}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}
        </section>
    )
}
