import { useEffect, useState } from 'react'
import {
    createCandidateSkill,
    deleteCandidateSkill,
    getCandidateSkills,
    getSkills,
    updateCandidateSkill,
} from './candidate.api'
import { ApiError } from '../../services/api/apiError'
import type {
    CandidateSkill,
    CandidateSkillInput,
    CandidateSkillUpdateInput,
    Skill,
} from '../../types/candidate'

interface CandidateSkillsProps {
    onSuccess?: (message: string) => void
}

function CandidateSkills({ onSuccess }: CandidateSkillsProps) {
    const [candidateSkills, setCandidateSkills] = useState<CandidateSkill[]>([])
    const [skills, setSkills] = useState<Skill[]>([])

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

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
                    setError('Unable to load your skills.')
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
    }, [])

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

    async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!selectedSkillId) {
            setError('Please select a skill.')
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
            showSuccess('Skill added successfully.')
        } catch (caught) {
            if (caught instanceof ApiError && caught.status === 409) {
                setError('You already added this skill.')
            } else if (caught instanceof ApiError && caught.status === 404) {
                setError('The selected skill could not be found.')
            } else {
                setError('Unable to add this skill.')
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
        event: React.FormEvent<HTMLFormElement>,
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
            showSuccess('Skill updated successfully.')
        } catch {
            setError('Unable to update this skill.')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Are you sure you want to remove this skill?')) {
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

            showSuccess('Skill removed successfully.')
        } catch {
            setError('Unable to remove this skill.')
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
            aria-labelledby="skills-heading"
        >
            <div className="profile-section-header">
                <div>
                    <p className="profile-eyebrow">Skills</p>
                    <h2 id="skills-heading">My skills</h2>
                </div>
            </div>

            {loading && (
                <p role="status" aria-live="polite">
                    Loading skills...
                </p>
            )}

            {!loading && error && <p role="alert">{error}</p>}

            {!loading && success && <p role="status">{success}</p>}

            {!loading && (
                <>
                    <form className="profile-form" onSubmit={(event) => void handleAdd(event)}>
                        <label>
                            Skill
                            <select
                                value={selectedSkillId}
                                onChange={(event) => setSelectedSkillId(event.target.value)}
                                disabled={submitting}
                            >
                                <option value="">Select a skill</option>

                                {availableSkills.map((skill) => (
                                    <option key={skill.id} value={skill.id}>
                                        {skill.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Proficiency level
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
                            Years of experience
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
                            <button type="submit" disabled={submitting || !selectedSkillId}>
                                {submitting ? 'Saving...' : 'Add skill'}
                            </button>
                        </div>
                    </form>

                    {candidateSkills.length === 0 ? (
                        <p>No skills added yet.</p>
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
                                                Proficiency level
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
                                                Years of experience
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
                                                <button type="submit" disabled={submitting}>
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={resetForm}
                                                    disabled={submitting}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="profile-skill">
                                            <div>
                                                <strong>{candidateSkill.skill.name}</strong>
                                                <div>
                                                    Proficiency: {candidateSkill.proficiencyLevel}/5
                                                </div>
                                                <div>
                                                    Experience: {candidateSkill.yearsOfExperience} years
                                                </div>
                                            </div>

                                            <div className="profile-actions">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(candidateSkill)}
                                                    disabled={submitting}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => void handleDelete(candidateSkill.id)}
                                                    disabled={submitting}
                                                >
                                                    Remove
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
