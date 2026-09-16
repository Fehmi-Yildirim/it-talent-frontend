import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import AdminRoute from './AdminRoute'
import CandidateRoute from './CandidateRoute'
import ProtectedRoute from './ProtectedRoute'
import RecruiterRoute from './RecruiterRoute'
import LazyPage from './LazyPage'
import {
  AdminSkillsPage,
  AdminUsersPage,
  CandidateApplicationDetailsPage,
  CandidateApplicationsPage,
  CandidateJobDetailsPage,
  CandidateJobsPage,
  CompanyManagement,
  DashboardPage,
  ProfilePage,
  RecruiterApplicationDetailsPage,
  RecruiterApplicationsPage,
  RecruiterJobDetailsPage,
  RecruiterJobFormPage,
  RecruiterJobsPage,
  RecruiterProfile,
  RegisterPage,
} from './lazyPages'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: (
          <LazyPage>
            <RegisterPage />
          </LazyPage>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <CandidateRoute />,
            children: [
              {
                path: 'jobs',
                element: (
                  <LazyPage>
                    <CandidateJobsPage />
                  </LazyPage>
                ),
              },
              {
                path: 'jobs/:jobId',
                element: (
                  <LazyPage>
                    <CandidateJobDetailsPage />
                  </LazyPage>
                ),
              },
              {
                path: 'applications',
                element: (
                  <LazyPage>
                    <CandidateApplicationsPage />
                  </LazyPage>
                ),
              },
              {
                path: 'applications/:applicationId',
                element: (
                  <LazyPage>
                    <CandidateApplicationDetailsPage />
                  </LazyPage>
                ),
              },
            ],
          },
          {
            path: 'dashboard',
            element: (
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            ),
          },
          {
            path: 'profile',
            element: (
              <LazyPage>
                <ProfilePage />
              </LazyPage>
            ),
          },
          {
            path: 'recruiter/profile',
            element: (
              <LazyPage>
                <RecruiterProfile />
              </LazyPage>
            ),
          },
          {
            path: 'recruiter/company',
            element: (
              <LazyPage>
                <CompanyManagement />
              </LazyPage>
            ),
          },
          {
            path: 'recruiter/jobs',
            element: (
              <LazyPage>
                <RecruiterJobsPage />
              </LazyPage>
            ),
          },
          {
            path: 'recruiter/jobs/new',
            element: (
              <LazyPage>
                <RecruiterJobFormPage />
              </LazyPage>
            ),
          },
          {
            path: 'recruiter/jobs/:jobId/edit',
            element: (
              <LazyPage>
                <RecruiterJobFormPage />
              </LazyPage>
            ),
          },
          {
            path: 'recruiter/jobs/:jobId',
            element: (
              <LazyPage>
                <RecruiterJobDetailsPage />
              </LazyPage>
            ),
          },
          {
            element: <RecruiterRoute />,
            children: [
              {
                path: 'recruiter/applications',
                element: (
                  <LazyPage>
                    <RecruiterApplicationsPage />
                  </LazyPage>
                ),
              },
              {
                path: 'recruiter/applications/:applicationId',
                element: (
                  <LazyPage>
                    <RecruiterApplicationDetailsPage />
                  </LazyPage>
                ),
              },
            ],
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: 'admin/users',
                element: (
                  <LazyPage>
                    <AdminUsersPage />
                  </LazyPage>
                ),
              },
              {
                path: 'admin/skills',
                element: (
                  <LazyPage>
                    <AdminSkillsPage />
                  </LazyPage>
                ),
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
