import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import BoardJobs from './pages/BoardJobs'
import CandidatesList from './pages/CandidatesList'
import KanbanBoard from './pages/KanbanBoard'
import CandidateProfile from './pages/CandidateProfile'
import AssessmentBuilder from './pages/AssessmentBuilder'
import AssessmentRuntime from './pages/AssessmentRuntime'
import AssessmentsList from './pages/AssessmentsList'
import CandidateJobApplication from './pages/CandidateJobApplication'
import TestPage from './pages/TestPage'
import Profile from './pages/Profile'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Navigate to="/jobs" replace />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path='/profile' element={
        <ProtectedRoute>
          <Layout>
            <Profile/>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/jobs" element={
        <ProtectedRoute>
          <Layout>
            <BoardJobs />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/jobs/:jobId" element={
        <ProtectedRoute>
          <Layout>
            <BoardJobs />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/candidates" element={
        <ProtectedRoute>
          <Layout>
            <CandidatesList />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/candidates/:id" element={
        <ProtectedRoute>
          <Layout>
            <CandidateProfile />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/kanban" element={
        <ProtectedRoute requiredUserType="admin">
          <Layout>
            <KanbanBoard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/assessments" element={
        <ProtectedRoute requiredUserType="admin">
          <Layout>
            <AssessmentsList />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/assessments/:jobId" element={
        <ProtectedRoute requiredUserType="admin">
          <Layout>
            <AssessmentBuilder />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/assessments/:jobId/take" element={
        <ProtectedRoute>
          <Layout>
            <AssessmentRuntime />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/jobs/:jobId/apply" element={
        <ProtectedRoute>
          <Layout>
            <CandidateJobApplication />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/test" element={<TestPage />} />
    </Routes>
  )
}

export default App
