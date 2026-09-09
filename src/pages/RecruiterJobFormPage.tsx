import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    Link,
    useNavigate,
    useParams,
} from 'react-router-dom'

import {
    createJob,
    createJobRequirement,
    getJobById,
    getJobRequirements,
    removeJobRequirement,
    updateJob,
    updateJobRequirement,
} from '../features/jobs/jobs.api'

import { getSkills } from '../features/skills/skills.api'

import type {
    CreateJobRequest,
    EmploymentType,
    JobRequirement,
    Skill,
    UpdateJobRequest,
    WorkMode,
} from '../types/job'

import { useTranslation } from '../i18n/context'

import './RecruiterJobFormPage.css'

const employmentTypes: EmploymentType[] = [
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'FREELANCE',
    'INTERNSHIP',
]

const workModes: WorkMode[] = [
    'ONSITE',
    'HYBRID',
    'REMOTE',
    'FLEXIBLE',
]

interface PendingRequirement {
    skillId: string
    required: boolean
    minimumLevel: number
}

interface RequirementUpdate {
    required?: boolean
    minimumLevel?: number
}

function getInitialDate(): string {
    const date = new Date()

    date.setDate(date.getDate() + 30)

    return date.toISOString().slice(0, 10)
}

function getTodayString(): string {
    return new Date().toISOString().slice(0, 10)
}

function isValidUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
    )
}

interface RequirementRowProps {
    requirement: JobRequirement
    saving: boolean
    onUpdate: (
        requirementId: string,
        data: RequirementUpdate,
    ) => void
    onDelete: (skillId: string) => void
}

function RequirementRow({
    requirement,
    saving,
    onUpdate,
    onDelete,
}: RequirementRowProps) {
    const { t } = useTranslation()

    return (
        <div className="requirement-row">
            <div className="requirement-row__info">
                <strong>
                    {requirement.skill?.name ??
                        requirement.skillId}
                </strong>

                <span>
                    {requirement.required
                        ? t('recruiterJobForm.required')
                        : t('recruiterJobForm.preferred')}
                </span>
            </div>

            <div className="requirement-row__actions">
                <label className="requirement-control">
                    <span>
                        {t('recruiterJobForm.type')}
                    </span>

                    <select
                        value={
                            requirement.required
                                ? 'required'
                                : 'preferred'
                        }
                        disabled={saving}
                        onChange={(event) => {
                            void onUpdate(
                                requirement.id,
                                {
                                    required:
                                        event.target
                                            .value ===
                                        'required',
                                },
                            )
                        }}
                    >
                        <option value="required">
                            {t('recruiterJobForm.required')}
                        </option>

                        <option value="preferred">
                            {t('recruiterJobForm.preferred')}
                        </option>
                    </select>
                </label>

                <label className="requirement-control">
                    <span>
                        {t(
                            'recruiterJobForm.minimumLevel',
                        )}
                    </span>

                    <input
                        type="number"
                        min={1}
                        max={5}
                        value={
                            requirement.minimumLevel
                        }
                        disabled={saving}
                        onChange={(event) => {
                            const value = Number(
                                event.target.value,
                            )

                            if (
                                Number.isInteger(
                                    value,
                                ) &&
                                value >= 1 &&
                                value <= 5
                            ) {
                                void onUpdate(
                                    requirement.id,
                                    {
                                        minimumLevel:
                                            value,
                                    },
                                )
                            }
                        }}
                    />
                </label>

                <button
                    type="button"
                    className="button button--danger"
                    disabled={saving}
                    onClick={() =>
                        void onDelete(
                            requirement.skillId,
                        )
                    }
                >
                    {t('recruiterJobs.delete')}
                </button>
            </div>
        </div>
    )
}

interface PendingRequirementRowProps {
    requirement: PendingRequirement
    skillName: string
    onUpdate: (
        data: Partial<PendingRequirement>,
    ) => void
    onDelete: () => void
}

function PendingRequirementRow({
    requirement,
    skillName,
    onUpdate,
    onDelete,
}: PendingRequirementRowProps) {
    const { t } = useTranslation()

    return (
        <div className="requirement-row">
            <div className="requirement-row__info">
                <strong>{skillName}</strong>

                <span>
                    {requirement.required
                        ? t('recruiterJobForm.required')
                        : t('recruiterJobForm.preferred')}
                </span>
            </div>

            <div className="requirement-row__actions">
                <label className="requirement-control">
                    <span>
                        {t('recruiterJobForm.type')}
                    </span>

                    <select
                        value={
                            requirement.required
                                ? 'required'
                                : 'preferred'
                        }
                        onChange={(event) =>
                            onUpdate({
                                required:
                                    event.target
                                        .value ===
                                    'required',
                            })
                        }
                    >
                        <option value="required">
                            {t('recruiterJobForm.required')}
                        </option>

                        <option value="preferred">
                            {t('recruiterJobForm.preferred')}
                        </option>
                    </select>
                </label>

                <label className="requirement-control">
                    <span>
                        {t(
                            'recruiterJobForm.minimumLevel',
                        )}
                    </span>

                    <input
                        type="number"
                        min={1}
                        max={5}
                        value={
                            requirement.minimumLevel
                        }
                        onChange={(event) => {
                            const value = Number(
                                event.target.value,
                            )

                            if (
                                Number.isInteger(
                                    value,
                                ) &&
                                value >= 1 &&
                                value <= 5
                            ) {
                                onUpdate({
                                    minimumLevel:
                                        value,
                                })
                            }
                        }}
                    />
                </label>

                <button
                    type="button"
                    className="button button--danger"
                    onClick={onDelete}
                >
                    {t('recruiterJobs.delete')}
                </button>
            </div>
        </div>
    )
}

export default function RecruiterJobFormPage() {
    const { t } = useTranslation()

    const navigate = useNavigate()

    const { jobId } =
        useParams<{ jobId: string }>()

    const isEditMode = Boolean(jobId)

    const [skills, setSkills] =
        useState<Skill[]>([])

    const [title, setTitle] = useState('')

    const [description, setDescription] =
        useState('')

    const [location, setLocation] =
        useState('')

    const [employmentType, setEmploymentType] =
        useState<EmploymentType>('FULL_TIME')

    const [workMode, setWorkMode] =
        useState<WorkMode>('ONSITE')

    const [salaryMin, setSalaryMin] =
        useState('')

    const [salaryMax, setSalaryMax] =
        useState('')

    const [currency, setCurrency] =
        useState('EUR')

    const [expiresAt, setExpiresAt] =
        useState(getInitialDate())

    const [requirements, setRequirements] =
        useState<JobRequirement[]>([])

    const [
        pendingRequirements,
        setPendingRequirements,
    ] = useState<PendingRequirement[]>([])

    const [selectedSkillId, setSelectedSkillId] =
        useState('')

    const [selectedRequired, setSelectedRequired] =
        useState(true)

    const [
        selectedMinimumLevel,
        setSelectedMinimumLevel,
    ] = useState(1)

    const [loading, setLoading] =
        useState(isEditMode)

    const [skillsLoading, setSkillsLoading] =
        useState(true)

    const [
        requirementsLoading,
        setRequirementsLoading,
    ] = useState(false)

    const [saving, setSaving] =
        useState(false)

    const [
        requirementSaving,
        setRequirementSaving,
    ] = useState(false)

    const [error, setError] =
        useState<string | null>(null)

    const [
        validationError,
        setValidationError,
    ] = useState<string | null>(null)

    function getEmploymentTypeLabel(
        type: EmploymentType,
    ): string {
        switch (type) {
            case 'FULL_TIME':
                return t('candidateJobs.fullTime')

            case 'PART_TIME':
                return t('candidateJobs.partTime')

            case 'CONTRACT':
                return t('candidateJobs.contract')

            case 'FREELANCE':
                return t('candidateJobs.freelance')

            case 'INTERNSHIP':
                return t('candidateJobs.internship')
        }
    }

    function getWorkModeLabel(
        mode: WorkMode,
    ): string {
        switch (mode) {
            case 'ONSITE':
                return t('candidateJobs.onsite')

            case 'HYBRID':
                return t('candidateJobs.hybrid')

            case 'REMOTE':
                return t('candidateJobs.remote')

            case 'FLEXIBLE':
                return t('candidateJobs.flexible')
        }
    }

    function getSkillName(
        skillId: string,
    ): string {
        return (
            skills.find(
                (skill) => skill.id === skillId,
            )?.name ??
            t('recruiterJobForm.unknownSkill')
        )
    }

    useEffect(() => {
        let active = true

        async function loadSkills() {
            setSkillsLoading(true)

            try {
                const response = await getSkills()

                if (active) {
                    setSkills(response)
                }
            } catch {
                if (active) {
                    setError(
                        t(
                            'recruiterJobForm.unableToLoadSkills',
                        ),
                    )
                }
            } finally {
                if (active) {
                    setSkillsLoading(false)
                }
            }
        }

        void loadSkills()

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        if (!jobId) {
            setLoading(false)
            return
        }

        const currentJobId = jobId
        let active = true

        async function loadJob() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getJobById(currentJobId)

                if (!active) {
                    return
                }

                setTitle(response.title)

                setDescription(
                    response.description,
                )

                setLocation(
                    response.location ?? '',
                )

                setEmploymentType(
                    response.employmentType,
                )

                setWorkMode(response.workMode)

                setSalaryMin(
                    response.salaryMin !== null
                        ? String(response.salaryMin)
                        : '',
                )

                setSalaryMax(
                    response.salaryMax !== null
                        ? String(response.salaryMax)
                        : '',
                )

                setCurrency(
                    response.currency ?? 'EUR',
                )

                setExpiresAt(
                    response.expiresAt
                        ? response.expiresAt.slice(
                            0,
                            10,
                        )
                        : '',
                )
            } catch {
                if (active) {
                    setError(
                        t(
                            'recruiterJobForm.unableToLoadJob',
                        ),
                    )
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        void loadJob()

        return () => {
            active = false
        }
    }, [jobId])

    useEffect(() => {
        if (!jobId) {
            return
        }

        const currentJobId = jobId
        let active = true

        async function loadRequirements() {
            setRequirementsLoading(true)

            try {
                const response =
                    await getJobRequirements(
                        currentJobId,
                    )

                if (!active) {
                    return
                }

                setRequirements(response)
            } catch {
                if (active) {
                    setError(
                        t(
                            'recruiterJobForm.unableToLoadRequirements',
                        ),
                    )
                }
            } finally {
                if (active) {
                    setRequirementsLoading(false)
                }
            }
        }

        void loadRequirements()

        return () => {
            active = false
        }
    }, [jobId])

    function addPendingRequirement() {
        setError(null)
        setValidationError(null)

        if (!selectedSkillId) {
            setError(
                t(
                    'recruiterJobForm.selectSkillError',
                ),
            )
            return
        }

        if (!isValidUuid(selectedSkillId)) {
            setError(
                t(
                    'recruiterJobForm.invalidSkillError',
                ),
            )
            return
        }

        if (
            selectedMinimumLevel < 1 ||
            selectedMinimumLevel > 5 ||
            !Number.isInteger(
                selectedMinimumLevel,
            )
        ) {
            setError(
                t(
                    'recruiterJobForm.minimumLevelError',
                ),
            )
            return
        }

        const alreadyExists =
            pendingRequirements.some(
                (requirement) =>
                    requirement.skillId ===
                    selectedSkillId,
            )

        if (alreadyExists) {
            setError(
                t(
                    'recruiterJobForm.duplicateSkillError',
                ),
            )
            return
        }

        setPendingRequirements((current) => [
            ...current,
            {
                skillId: selectedSkillId,
                required: selectedRequired,
                minimumLevel:
                    selectedMinimumLevel,
            },
        ])

        setSelectedSkillId('')
        setSelectedRequired(true)
        setSelectedMinimumLevel(1)
    }

    function updatePendingRequirement(
        index: number,
        data: Partial<PendingRequirement>,
    ) {
        setPendingRequirements((current) =>
            current.map(
                (requirement, currentIndex) =>
                    currentIndex === index
                        ? {
                            ...requirement,
                            ...data,
                        }
                        : requirement,
            ),
        )
    }

    function deletePendingRequirement(
        index: number,
    ) {
        setPendingRequirements((current) =>
            current.filter(
                (_, currentIndex) =>
                    currentIndex !== index,
            ),
        )
    }

    async function handleAddRequirement() {
        if (!jobId) {
            addPendingRequirement()
            return
        }

        if (!selectedSkillId) {
            setError(
                t(
                    'recruiterJobForm.selectSkillError',
                ),
            )
            return
        }

        if (!isValidUuid(selectedSkillId)) {
            setError(
                t(
                    'recruiterJobForm.invalidSkillError',
                ),
            )
            return
        }

        if (
            selectedMinimumLevel < 1 ||
            selectedMinimumLevel > 5 ||
            !Number.isInteger(
                selectedMinimumLevel,
            )
        ) {
            setError(
                t(
                    'recruiterJobForm.minimumLevelError',
                ),
            )
            return
        }

        if (
            requirements.some(
                (requirement) =>
                    requirement.skillId ===
                    selectedSkillId,
            )
        ) {
            setError(
                t(
                    'recruiterJobForm.duplicateSkillError',
                ),
            )
            return
        }

        setRequirementSaving(true)
        setError(null)
        setValidationError(null)

        try {
            const response =
                await createJobRequirement(
                    jobId,
                    {
                        skillId: selectedSkillId,
                        required:
                            selectedRequired,
                        minimumLevel:
                            selectedMinimumLevel,
                    },
                )

            setRequirements((current) => [
                ...current,
                response,
            ])

            setSelectedSkillId('')
            setSelectedRequired(true)
            setSelectedMinimumLevel(1)
        } catch {
            setError(
                t(
                    'recruiterJobForm.unableToAddRequirement',
                ),
            )
        } finally {
            setRequirementSaving(false)
        }
    }

    async function handleUpdateRequirement(
        requirementId: string,
        data: RequirementUpdate,
    ) {
        if (!jobId) {
            return
        }

        if (
            data.minimumLevel !== undefined &&
            (data.minimumLevel < 1 ||
                data.minimumLevel > 5 ||
                !Number.isInteger(
                    data.minimumLevel,
                ))
        ) {
            setError(
                t(
                    'recruiterJobForm.minimumLevelError',
                ),
            )
            return
        }

        setRequirementSaving(true)
        setError(null)

        try {
            const response =
                await updateJobRequirement(
                    jobId,
                    requirementId,
                    data,
                )

            setRequirements((current) =>
                current.map((requirement) =>
                    requirement.id ===
                        requirementId
                        ? response
                        : requirement,
                ),
            )
        } catch {
            setError(
                t(
                    'recruiterJobForm.unableToUpdateRequirement',
                ),
            )
        } finally {
            setRequirementSaving(false)
        }
    }

    async function handleDeleteRequirement(
        skillId: string,
    ) {
        if (!jobId) {
            return
        }

        setRequirementSaving(true)
        setError(null)

        try {
            await removeJobRequirement(
                jobId,
                skillId,
            )

            setRequirements((current) =>
                current.filter(
                    (requirement) =>
                        requirement.skillId !==
                        skillId,
                ),
            )
        } catch {
            setError(
                t(
                    'recruiterJobForm.unableToDeleteRequirement',
                ),
            )
        } finally {
            setRequirementSaving(false)
        }
    }

    function validate(): string | null {
        if (!title.trim()) {
            return t(
                'recruiterJobForm.titleRequired',
            )
        }

        if (!description.trim()) {
            return t(
                'recruiterJobForm.descriptionRequired',
            )
        }

        if (
            !employmentTypes.includes(
                employmentType,
            )
        ) {
            return t(
                'recruiterJobForm.invalidEmploymentType',
            )
        }

        if (!workModes.includes(workMode)) {
            return t(
                'recruiterJobForm.invalidWorkMode',
            )
        }

        if (
            salaryMin !== '' &&
            (!Number.isFinite(
                Number(salaryMin),
            ) ||
                Number(salaryMin) < 0)
        ) {
            return t(
                'recruiterJobForm.minimumSalaryNegative',
            )
        }

        if (
            salaryMax !== '' &&
            (!Number.isFinite(
                Number(salaryMax),
            ) ||
                Number(salaryMax) < 0)
        ) {
            return t(
                'recruiterJobForm.maximumSalaryNegative',
            )
        }

        if (
            salaryMin !== '' &&
            salaryMax !== '' &&
            Number(salaryMin) >
            Number(salaryMax)
        ) {
            return t(
                'recruiterJobForm.minimumSalaryGreater',
            )
        }

        if (
            expiresAt &&
            expiresAt < getTodayString()
        ) {
            return t(
                'recruiterJobForm.expirationPast',
            )
        }

        if (
            pendingRequirements.some(
                (requirement) =>
                    !isValidUuid(
                        requirement.skillId,
                    ),
            )
        ) {
            return t(
                'recruiterJobForm.invalidSkillIds',
            )
        }

        if (
            pendingRequirements.some(
                (requirement) =>
                    requirement.minimumLevel <
                    1 ||
                    requirement.minimumLevel >
                    5 ||
                    !Number.isInteger(
                        requirement.minimumLevel,
                    ),
            )
        ) {
            return t(
                'recruiterJobForm.minimumSkillLevel',
            )
        }

        return null
    }

    async function createPendingRequirements(
        newJobId: string,
    ) {
        for (const requirement of pendingRequirements) {
            await createJobRequirement(
                newJobId,
                {
                    skillId:
                        requirement.skillId,
                    required:
                        requirement.required,
                    minimumLevel:
                        requirement.minimumLevel,
                },
            )
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        setValidationError(null)
        setError(null)

        const validationMessage = validate()

        if (validationMessage) {
            setValidationError(
                validationMessage,
            )
            return
        }

        setSaving(true)

        try {
            if (jobId) {
                const data: UpdateJobRequest = {
                    title: title.trim(),
                    description:
                        description.trim(),
                    location:
                        location.trim() ||
                        undefined,
                    employmentType,
                    workMode,
                    salaryMin:
                        salaryMin !== ''
                            ? Number(salaryMin)
                            : undefined,
                    salaryMax:
                        salaryMax !== ''
                            ? Number(salaryMax)
                            : undefined,
                    currency:
                        currency || undefined,
                    expiresAt:
                        expiresAt || undefined,
                }

                await updateJob(jobId, data)

                navigate('/recruiter/jobs')
                return
            }

            const data: CreateJobRequest = {
                title: title.trim(),
                description:
                    description.trim(),
                location:
                    location.trim() ||
                    undefined,
                employmentType,
                workMode,
                salaryMin:
                    salaryMin !== ''
                        ? Number(salaryMin)
                        : undefined,
                salaryMax:
                    salaryMax !== ''
                        ? Number(salaryMax)
                        : undefined,
                currency:
                    currency || undefined,
                expiresAt:
                    expiresAt || undefined,
            }

            const createdJob =
                await createJob(data)

            if (
                pendingRequirements.length > 0
            ) {
                try {
                    await createPendingRequirements(
                        createdJob.id,
                    )
                } catch {
                    setError(
                        t(
                            'recruiterJobForm.jobCreatedRequirementsFailed',
                        ),
                    )
                    return
                }
            }

            navigate('/recruiter/jobs')
        } catch {
            setError(
                jobId
                    ? t(
                        'recruiterJobForm.unableToUpdateJob',
                    )
                    : t(
                        'recruiterJobForm.unableToCreateJob',
                    ),
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <main className="recruiter-job-form-page">
                <div className="form-state">
                    {t(
                        'recruiterJobForm.loading',
                    )}
                </div>
            </main>
        )
    }

    return (
        <main className="recruiter-job-form-page">
            <header className="page-header">
                <Link
                    to="/recruiter/jobs"
                    className="back-link"
                >
                    ←{' '}
                    {t(
                        'recruiterJobForm.backToJobs',
                    )}
                </Link>

                <h1>
                    {isEditMode
                        ? t(
                            'recruiterJobForm.editTitle',
                        )
                        : t(
                            'recruiterJobForm.createTitle',
                        )}
                </h1>

                <p>
                    {isEditMode
                        ? t(
                            'recruiterJobForm.editDescription',
                        )
                        : t(
                            'recruiterJobForm.createDescription',
                        )}
                </p>
            </header>

            {error && (
                <div
                    className="alert alert--error"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {validationError && (
                <div
                    className="alert alert--error"
                    role="alert"
                >
                    {validationError}
                </div>
            )}

            <form
                className="job-form"
                noValidate
                onSubmit={handleSubmit}
            >
                <section className="form-card">
                    <div className="form-card__header">
                        <h2>
                            {t(
                                'recruiterJobForm.jobDetails',
                            )}
                        </h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-field form-field--full">
                            <label htmlFor="title">
                                {t(
                                    'recruiterJobForm.jobTitle',
                                )}
                            </label>

                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder={t(
                                    'recruiterJobForm.jobTitlePlaceholder',
                                )}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="employmentType">
                                {t(
                                    'recruiterJobForm.employmentType',
                                )}
                            </label>

                            <select
                                id="employmentType"
                                value={
                                    employmentType
                                }
                                onChange={(event) =>
                                    setEmploymentType(
                                        event.target
                                            .value as EmploymentType,
                                    )
                                }
                            >
                                {employmentTypes.map(
                                    (type) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {getEmploymentTypeLabel(
                                                type,
                                            )}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="workMode">
                                {t(
                                    'recruiterJobForm.workMode',
                                )}
                            </label>

                            <select
                                id="workMode"
                                value={workMode}
                                onChange={(event) =>
                                    setWorkMode(
                                        event.target
                                            .value as WorkMode,
                                    )
                                }
                            >
                                {workModes.map(
                                    (mode) => (
                                        <option
                                            key={mode}
                                            value={mode}
                                        >
                                            {getWorkModeLabel(
                                                mode,
                                            )}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>

                        <div className="form-field form-field--full">
                            <label htmlFor="location">
                                {t(
                                    'recruiterJobForm.location',
                                )}
                            </label>

                            <input
                                id="location"
                                type="text"
                                value={location}
                                onChange={(event) =>
                                    setLocation(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder={t(
                                    'recruiterJobForm.locationPlaceholder',
                                )}
                            />
                        </div>

                        <div className="form-field form-field--full">
                            <label htmlFor="description">
                                {t(
                                    'recruiterJobForm.description',
                                )}
                            </label>

                            <textarea
                                id="description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder={t(
                                    'recruiterJobForm.descriptionPlaceholder',
                                )}
                                rows={8}
                                required
                            />
                        </div>
                    </div>
                </section>

                <section className="form-card">
                    <div className="form-card__header">
                        <h2>
                            {t(
                                'recruiterJobForm.salaryAndExpiration',
                            )}
                        </h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="salaryMin">
                                {t(
                                    'recruiterJobForm.minimumSalary',
                                )}
                            </label>

                            <input
                                id="salaryMin"
                                type="number"
                                min="0"
                                value={salaryMin}
                                onChange={(event) =>
                                    setSalaryMin(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="40000"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="salaryMax">
                                {t(
                                    'recruiterJobForm.maximumSalary',
                                )}
                            </label>

                            <input
                                id="salaryMax"
                                type="number"
                                min="0"
                                value={salaryMax}
                                onChange={(event) =>
                                    setSalaryMax(
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="60000"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="currency">
                                {t(
                                    'recruiterJobForm.currency',
                                )}
                            </label>

                            <select
                                id="currency"
                                value={currency}
                                onChange={(event) =>
                                    setCurrency(
                                        event.target
                                            .value,
                                    )
                                }
                            >
                                <option value="EUR">
                                    EUR
                                </option>

                                <option value="USD">
                                    USD
                                </option>

                                <option value="GBP">
                                    GBP
                                </option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="expiresAt">
                                {t(
                                    'recruiterJobForm.expirationDate',
                                )}
                            </label>

                            <input
                                id="expiresAt"
                                type="date"
                                value={expiresAt}
                                onChange={(event) =>
                                    setExpiresAt(
                                        event.target
                                            .value,
                                    )
                                }
                            />
                        </div>
                    </div>
                </section>

                <section className="form-card">
                    <div className="form-card__header">
                        <div>
                            <h2>
                                {t(
                                    'recruiterJobForm.jobRequirements',
                                )}
                            </h2>

                            <p>
                                {t(
                                    'recruiterJobForm.requirementsDescription',
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="requirement-create">
                        <div className="form-field">
                            <label htmlFor="skill">
                                {t(
                                    'recruiterJobForm.skill',
                                )}
                            </label>

                            <select
                                id="skill"
                                value={
                                    selectedSkillId
                                }
                                disabled={
                                    skillsLoading ||
                                    requirementSaving
                                }
                                onChange={(event) =>
                                    setSelectedSkillId(
                                        event.target
                                            .value,
                                    )
                                }
                            >
                                <option value="">
                                    {t(
                                        'recruiterJobForm.selectSkill',
                                    )}
                                </option>

                                {skills.map((skill) => (
                                    <option
                                        key={skill.id}
                                        value={skill.id}
                                    >
                                        {skill.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="requirementType">
                                {t(
                                    'recruiterJobForm.type',
                                )}
                            </label>

                            <select
                                id="requirementType"
                                value={
                                    selectedRequired
                                        ? 'required'
                                        : 'preferred'
                                }
                                disabled={
                                    requirementSaving
                                }
                                onChange={(event) =>
                                    setSelectedRequired(
                                        event.target
                                            .value ===
                                        'required',
                                    )
                                }
                            >
                                <option value="required">
                                    {t(
                                        'recruiterJobForm.required',
                                    )}
                                </option>

                                <option value="preferred">
                                    {t(
                                        'recruiterJobForm.preferred',
                                    )}
                                </option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="minimumLevel">
                                {t(
                                    'recruiterJobForm.minimumLevel',
                                )}
                            </label>

                            <input
                                id="minimumLevel"
                                type="number"
                                min="1"
                                max="5"
                                value={
                                    selectedMinimumLevel
                                }
                                disabled={
                                    requirementSaving
                                }
                                onChange={(event) =>
                                    setSelectedMinimumLevel(
                                        Number(
                                            event.target
                                                .value,
                                        ),
                                    )
                                }
                            />
                        </div>

                        <button
                            type="button"
                            className="button button--secondary"
                            disabled={
                                requirementSaving ||
                                skillsLoading ||
                                !selectedSkillId
                            }
                            onClick={() =>
                                void handleAddRequirement()
                            }
                        >
                            {t(
                                'recruiterJobForm.addRequirement',
                            )}
                        </button>
                    </div>

                    {isEditMode &&
                        requirementsLoading && (
                            <div className="requirements-state">
                                {t(
                                    'recruiterJobForm.loadingRequirements',
                                )}
                            </div>
                        )}

                    {!isEditMode &&
                        pendingRequirements.length ===
                        0 && (
                            <div className="requirements-state">
                                {t(
                                    'recruiterJobForm.noRequirementsYet',
                                )}
                            </div>
                        )}

                    {isEditMode &&
                        !requirementsLoading &&
                        requirements.length ===
                        0 && (
                            <div className="requirements-state">
                                {t(
                                    'recruiterJobForm.noRequirementsAdded',
                                )}
                            </div>
                        )}

                    {!isEditMode &&
                        pendingRequirements.length >
                        0 && (
                            <div className="requirements-list">
                                {pendingRequirements.map(
                                    (
                                        requirement,
                                        index,
                                    ) => (
                                        <PendingRequirementRow
                                            key={`${requirement.skillId}-${index}`}
                                            requirement={
                                                requirement
                                            }
                                            skillName={getSkillName(
                                                requirement.skillId,
                                            )}
                                            onUpdate={(
                                                data,
                                            ) =>
                                                updatePendingRequirement(
                                                    index,
                                                    data,
                                                )
                                            }
                                            onDelete={() =>
                                                deletePendingRequirement(
                                                    index,
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        )}

                    {isEditMode &&
                        !requirementsLoading &&
                        requirements.length >
                        0 && (
                            <div className="requirements-list">
                                {requirements.map(
                                    (
                                        requirement,
                                    ) => (
                                        <RequirementRow
                                            key={
                                                requirement.id
                                            }
                                            requirement={
                                                requirement
                                            }
                                            saving={
                                                requirementSaving
                                            }
                                            onUpdate={
                                                handleUpdateRequirement
                                            }
                                            onDelete={
                                                handleDeleteRequirement
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        )}

                    {!isEditMode &&
                        pendingRequirements.length >
                        0 && (
                            <p className="form-help">
                                {t(
                                    'recruiterJobForm.requirementsWillBeCreated',
                                )}
                            </p>
                        )}
                </section>

                <div className="form-actions">
                    <Link
                        to="/recruiter/jobs"
                        className="button button--secondary"
                    >
                        {t(
                            'recruiterJobForm.cancel',
                        )}
                    </Link>

                    <button
                        type="submit"
                        className="button button--primary"
                        disabled={saving}
                    >
                        {saving
                            ? t(
                                'recruiterJobForm.saving',
                            )
                            : isEditMode
                                ? t(
                                    'recruiterJobForm.saveChanges',
                                )
                                : t(
                                    'recruiterJobForm.createJob',
                                )}
                    </button>
                </div>
            </form>
        </main>
    )
}
