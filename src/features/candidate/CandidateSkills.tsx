
import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import ErrorState from '../../components/feedback/ErrorState'
import LoadingState from '../../components/feedback/LoadingState'
import { useTranslation } from '../../i18n/useTranslation'
import { ApiError } from '../../services/api/apiError'
import type {
    CandidateSkill,
    CandidateSkillInput,
    CandidateSkillUpdateInput,
    Skill,
} from '../../types/candidate'
import {
    createCandidateSkill,
    deleteCandidateSkill,
    getCandidateSkills,
    getSkills,
    updateCandidateSkill,
} from './candidate.api'

interface CandidateSkillsProps {
    onSuccess?: (message: string) => void
}

function CandidateSkills({ onSuccess }: CandidateSkillsProps) {
    const { t } = useTranslation()
    const headingId = useId()

    const [candidateSkills, setCandidateSkills] = useState<CandidateSkill[]>([])
    const [skills, setSkills] = useState<Skill[]>([])

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    const [selectedSkillId, setSelectedSkillId] = useState('')
    const [proficiencyLevel, setProficiencyLevel] = useState(1)
    const [yearsOfExperience, setYearsOfExperience] = useState(0)

    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function loadSkills() {
            setLoading(true)
            setError(null)

            try {
                const [candidateSkillsResult, skillsResult] = await Promise.all([
                    getCandidateSkills(),
                    getSkills(),
                ])

                if (!cancelled) {
                    setCandidateSkills(candidateSkillsResult)
                    setSkills(skillsResult)
                }
            } catch {
                if (!cancelled) {
                    setError(t('candidateSkills.loadError'))
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadSkills()

        return () => {
            cancelled = true
        }
    }, [retryCount, t])

    function resetForm() {
        setSelectedSkillId('')
        setProficiencyLevel(1)
        setYearsOfExperience(0)
        setEditingId(null)
    }

    function showSuccess(message: string) {
        setSuccess(message)
        setError(null)
        onSuccess?.(message)
    }

    async function handleAdd(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!selectedSkillId) {
            setError(t('candidateSkills.selectRequired'))
            return
        }

        setSubmitting(true)
        setError(null)
        setSuccess(null)

        const input: CandidateSkillInput = {
            skillId: selectedSkillId,
            proficiencyLevel,
            yearsOfExperience,
        }

        try {
            const created = await createCandidateSkill(input)

            setCandidateSkills((current) => [created, ...current])
            resetForm()
            showSuccess(t('candidateSkills.added'))
        } catch (caught) {
            if (caught instanceof ApiError && caught.status === 409) {
                setError(t('candidateSkills.duplicate'))
            } else if (caught instanceof ApiError && caught.status === 404) {
                setError(t('candidateSkills.notFound'))
            } else {
                setError(t('candidateSkills.addError'))
            }
        } finally {
            setSubmitting(false)
        }
    }

    function startEditing(skill: CandidateSkill) {
        setEditingId(skill.id)
        setProficiencyLevel(skill.proficiencyLevel)
        setYearsOfExperience(skill.yearsOfExperience)
        setError(null)
        setSuccess(null)
    }

    async function handleUpdate(
        event: FormEvent<HTMLFormElement>,
        id: string,
    ) {
        event.preventDefault()

        setSubmitting(true)
        setError(null)
        setSuccess(null)

        const input: CandidateSkillUpdateInput = {
            proficiencyLevel,
            yearsOfExperience,
        }

        try {
            const updated = await updateCandidateSkill(id, input)

            setCandidateSkills((current) =>
                current.map((skill) => (skill.id === id ? updated : skill)),
            )

            resetForm()
            showSuccess(t('candidateSkills.updated'))
        } catch {
            setError(t('candidateSkills.updateError'))
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm(t('candidateSkills.deleteConfirmation'))) {
            return
        }

        setSubmitting(true)
        setError(null)
        setSuccess(null)

        try {
            await deleteCandidateSkill(id)

            setCandidateSkills((current) =>
                current.filter((skill) => skill.id !== id),
            )

            showSuccess(t('candidateSkills.removed'))
        } catch {
            setError(t('candidateSkills.removeError'))
        } finally {
            setSubmitting(false)
        }
    }

    const availableSkills = skills.filter(
        (skill) =>
            !candidateSkills.some(
                (candidateSkill) => candidateSkill.skillId === skill.id,
            ),
    )

    return (
        <section
            className="profile-section"
            aria-labelledby={headingId}
        >
            <div className="profile-section-header">
                <div>
                    <p className="profile-eyebrow">
                        {t('candidateSkills.eyebrow')}
                    </p>
                    <h2 id={headingId}>
                        {t('candidateSkills.title')}
                    </h2>
                </div>
            </div>

            {loading && (
                <LoadingState message={t('candidateSkills.loading')} />
            )}

            {!loading && error && (
                <ErrorState
                    title={t('candidateSkills.unavailable')}
                    message={error}
                    onRetry={() => {
                        setError(null)
                        setRetryCount((current) => current + 1)
                    }}
                />
            )}

            {!loading && success && (
                <p role="status">{success}</p>
            )}

            {!loading && !error && (
                <>
                    <form
                        className="profile-form"
                        onSubmit={(event) => void handleAdd(event)}
                    >
                        <label>
                            {t('candidateSkills.selectSkill')}
                            <select
                                value={selectedSkillId}
                                onChange={(event) =>
                                    setSelectedSkillId(event.target.value)
                                }
                                disabled={submitting}
                            >
                                <option value="">
                                    {t('candidateSkills.selectPlaceholder')}
                                </option>

                                {availableSkills.map((skill) => (
                                    <option key={skill.id} value={skill.id}>
                                        {skill.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            {t('candidateSkills.proficiency')}
                            <select
                                value={proficiencyLevel}
                                onChange={(event) =>
                                    setProficiencyLevel(Number(event.target.value))
                                }
                                disabled={submitting}
                            >
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            {t('candidateSkills.experience')}
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={yearsOfExperience}
                                onChange={(event) =>
                                    setYearsOfExperience(Number(event.target.value))
                                }
                                disabled={submitting}
                            />
                        </label>

                        <div className="profile-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || !selectedSkillId}
                            >
                                {submitting
                                    ? t('candidateSkills.saving')
                                    : t('candidateSkills.add')}
                            </button>
                        </div>
                    </form>

                    {candidateSkills.length === 0 ? (
                        <p>{t('candidateSkills.empty')}</p>
                    ) : (
                        <div className="profile-details">
                            {candidateSkills.map((candidateSkill) => (
                                <article key={candidateSkill.id}>
                                    {editingId === candidateSkill.id ? (
                                        <form
                                            className="profile-form"
                                            onSubmit={(event) =>
                                                void handleUpdate(event, candidateSkill.id)
                                            }
                                        >
                                            <h3>{candidateSkill.skill.name}</h3>

                                            <label>
                                                {t('candidateSkills.proficiency')}
                                                <select
                                                    value={proficiencyLevel}
                                                    onChange={(event) =>
                                                        setProficiencyLevel(
                                                            Number(event.target.value),
                                                        )
                                                    }
                                                    disabled={submitting}
                                                >
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <option key={level} value={level}>
                                                            {level}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>

                                            <label>
                                                {t('candidateSkills.experience')}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={yearsOfExperience}
                                                    onChange={(event) =>
                                                        setYearsOfExperience(
                                                            Number(event.target.value),
                                                        )
                                                    }
                                                    disabled={submitting}
                                                />
                                            </label>

                                            <div className="profile-actions">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={submitting}
                                                >
                                                    {t('candidateSkills.save')}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={resetForm}
                                                    disabled={submitting}
                                                >
                                                    {t('candidateSkills.cancel')}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="profile-skill">
                                            <div>
                                                <strong>
                                                    {candidateSkill.skill.name}
                                                </strong>

                                                <div>
                                                    {t('candidateSkills.proficiencyShort')}: {candidateSkill.proficiencyLevel}/5
                                                </div>

                                                <div>
                                                    {t('candidateSkills.experienceShort')}: {candidateSkill.yearsOfExperience} {t('candidateSkills.years')}
                                                </div>
                                            </div>

                                            <div className="profile-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() =>
                                                        startEditing(candidateSkill)
                                                    }
                                                    disabled={submitting}
                                                >
                                                    {t('candidateSkills.edit')}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() =>
                                                        void handleDelete(candidateSkill.id)
                                                    }
                                                    disabled={submitting}
                                                >
                                                    {t('candidateSkills.remove')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    )
}

export default CandidateSkills
