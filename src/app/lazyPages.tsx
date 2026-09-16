import { lazy } from 'react'

export const RegisterPage = lazy(() => import('../pages/RegisterPage'))

export const CandidateJobsPage = lazy(
    () => import('../pages/CandidateJobsPage'),
)

export const CandidateJobDetailsPage = lazy(
    () => import('../pages/CandidateJobDetailsPage'),
)

export const CandidateApplicationsPage = lazy(
    () => import('../pages/CandidateApplicationsPage'),
)

export const CandidateApplicationDetailsPage = lazy(
    () => import('../pages/CandidateApplicationDetailsPage'),
)

export const DashboardPage = lazy(
    () => import('../pages/DashboardPage'),
)

export const ProfilePage = lazy(
    () => import('../pages/ProfilePage'),
)

export const RecruiterProfile = lazy(
    () => import('../features/recruiter/RecruiterProfile'),
)

export const CompanyManagement = lazy(
    () => import('../features/recruiter/CompanyManagement'),
)

export const RecruiterJobsPage = lazy(
    () => import('../pages/RecruiterJobsPage'),
)

export const RecruiterJobFormPage = lazy(
    () => import('../pages/RecruiterJobFormPage'),
)

export const RecruiterJobDetailsPage = lazy(
    () => import('../pages/RecruiterJobDetailsPage'),
)

export const RecruiterApplicationsPage = lazy(
    () => import('../pages/RecruiterApplicationsPage'),
)

export const RecruiterApplicationDetailsPage = lazy(
    () => import('../pages/RecruiterApplicationDetailsPage'),
)

export const AdminUsersPage = lazy(
    () => import('../pages/AdminUsersPage'),
)

export const AdminSkillsPage = lazy(
    () => import('../pages/AdminSkillsPage'),
)
