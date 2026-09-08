import type { ApplicationStatus } from './application'
import type { UserStatus } from './user'

export interface DashboardCompany {
    id: string
    name: string
    slug: string
}

export interface DashboardApplication {
    id: string
    status: ApplicationStatus
    createdAt: string
    job: {
        id: string
        title: string
        company: {
            id: string
            name: string
        }
    }
}

export interface DashboardJob {
    id: string
    title: string
    location: string | null
    employmentType: string
    workMode: string
    publishedAt: string | null
    company: {
        id: string
        name: string
    }
}

export interface DashboardSkill {
    proficiencyLevel: number
    yearsOfExperience: string | null
    skill: {
        id: string
        name: string
        category: string
    }
}

export interface CandidateDashboard {
    profile: {
        status: UserStatus
        completionPercentage: number
        headline: string | null
        summary: string | null
        location: string | null
        salaryMin: string | null
        salaryMax: string | null
        currency: string | null
        availabilityDate: string | null
        remotePreference: string | null
    }
    applications: {
        total: number
        byStatus: Record<ApplicationStatus, number>
        recent: DashboardApplication[]
    }
    jobs: {
        recommendedCount: number
        availableCount: number
        recent: DashboardJob[]
    }
    skills: {
        total: number
        items: DashboardSkill[]
    }
}

export interface RecruiterDashboardJob {
    id: string
    title: string
    status: string
    publishedAt: string | null
    createdAt: string
}

export interface RecruiterDashboardApplication {
    id: string
    status: ApplicationStatus
    createdAt: string
    job: {
        id: string
        title: string
    }
    candidate: {
        id: string
        headline: string | null
        location: string | null
    }
}

export interface RecruiterDashboard {
    profile: {
        status: UserStatus
        jobTitle: string | null
        company: DashboardCompany | null
    }
    jobs: {
        total: number
        published: number
        draft: number
        closed: number
        recent: RecruiterDashboardJob[]
    }
    applications: {
        total: number
        byStatus: Record<ApplicationStatus, number>
        recent: RecruiterDashboardApplication[]
    }
}