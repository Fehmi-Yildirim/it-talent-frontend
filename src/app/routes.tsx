import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import AdminRoute from './AdminRoute'
import ProtectedRoute from './ProtectedRoute'

import DashboardPage from '../pages/DashboardPage'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProfilePage from '../pages/ProfilePage'
import RegisterPage from '../pages/RegisterPage'
import AdminUsersPage from '../pages/AdminUsersPage'
import RecruiterJobsPage from '../pages/RecruiterJobsPage'
import RecruiterJobFormPage from '../pages/RecruiterJobFormPage'
import RecruiterProfile from '../features/recruiter/RecruiterProfile'
import CompanyManagement from '../features/recruiter/CompanyManagement'
import RecruiterJobDetailsPage from '../pages/RecruiterJobDetailsPage'

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
        element: <RegisterPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },

          {
            path: 'recruiter/profile',
            element: <RecruiterProfile />,
          },
          {
            path: 'recruiter/company',
            element: <CompanyManagement />,
          },
          {
            path: 'recruiter/jobs',
            element: <RecruiterJobsPage />,
          },
          {
            path: 'recruiter/jobs/new',
            element: <RecruiterJobFormPage />,
          },
          {
            path: 'recruiter/jobs/:jobId/edit',
            element: <RecruiterJobFormPage />,
          }, {
            path: 'recruiter/jobs/:jobId',
            element: <RecruiterJobDetailsPage />,
          },

          {
            element: <AdminRoute />,
            children: [
              {
                path: 'admin/users',
                element: <AdminUsersPage />,
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
