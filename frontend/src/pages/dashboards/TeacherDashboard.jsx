import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { api } from '../../api/client';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Result entry form
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [score, setScore] = useState('');

  const navItems = [
    { id: 'overview', label: 'Teacher Overview', icon: '📊' },
    { id: 'subjects', label: 'Assigned Subjects', icon: '📚' },
    { id: 'results', label: 'Class Gradebook & Results', icon: '📝' },
    { id: 'entry', label: 'Enter Student Grades', icon: '✏️' },
  ];

  useEffect(() => {
    loadTeacherData();
  }, []);

  async function loadTeacherData() {
    setLoading(true);
    setError('');
    try {
      const [subRes, rRes] = await Promise.all([
        api.getSubjects(),
        api.getResults(),
      ]);

      if (subRes.ok) setSubjects(subRes.data || []);
      if (rRes.ok) setResults(rRes.data || []);
    } catch (err) {
      setError('Error loading teacher assignments.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecordGrade(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    const res = await api.createResult({
      student_id: parseInt(studentId),
      subject_id: parseInt(subjectId),
      academic_session_id: parseInt(sessionId),
      score: parseFloat(score),
    });

    if (res.ok) {
      setMessage('Student grade recorded successfully.');
      setScore('');
      const refresh = await api.getResults();
      if (refresh.ok) setResults(refresh.data);
    } else {
      setError(res.error || 'Failed to submit grade. Ensure you are assigned to this student and subject.');
    }
  }

  return (
    <DashboardLayout
      title="Teacher Academic Portal"
      roleLabel="Instructor"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {message && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid rgba(21,128,61,0.2)' }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid rgba(185,28,28,0.2)' }}>
          {error}
        </div>
      )}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex-col gap-6">
          <div className="grid grid-3 gap-4">
            <Card className="flex-col gap-1">
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Teaching Assignments
              </span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                {subjects.length}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Assigned Subject Modules
              </span>
            </Card>

            <Card className="flex-col gap-1">
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Graded Records
              </span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                {results.length}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Recorded Student Results
              </span>
            </Card>

            <Card className="flex-col gap-1">
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Server Status
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>
                Active & Synced
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Backend Gradebook Online
              </span>
            </Card>
          </div>

          <Card featured className="flex-col gap-3">
            <h3 className="heading-sm">Teacher Workspace Guidelines</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              You have access to enter, edit, and review academic results for classes and subjects
              assigned to you by school administration. When scores are submitted, letter grades (A, B, C, D, E, F)
              are computed automatically according to standard educational benchmarks.
            </p>
            <div className="flex gap-3">
              <Button variant="gold" size="sm" onClick={() => setActiveTab('entry')}>
                Enter New Student Grade
              </Button>
              <Button variant="outline" size="sm" onClick={loadTeacherData}>
                {loading ? 'Refreshing...' : '↻ Refresh Data'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ASSIGNED SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="flex-col gap-6">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Assigned Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td><strong>{s.name}</strong></td>
                    <td>
                      <Badge variant="gold">Active Assignment</Badge>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No subjects currently assigned by administration.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRADEBOOK / RESULTS */}
      {activeTab === 'results' && (
        <div className="flex-col gap-6">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Result ID</th>
                  <th>Student ID</th>
                  <th>Subject ID</th>
                  <th>Session ID</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>Student #{r.student_id}</td>
                    <td>Subject #{r.subject_id}</td>
                    <td>Session #{r.academic_session_id}</td>
                    <td><strong>{r.score}</strong>/100</td>
                    <td>
                      <Badge variant={r.grade === 'A' ? 'gold' : r.grade === 'B' ? 'navy' : r.grade === 'F' ? 'danger' : 'sky'}>
                        Grade {r.grade}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No grades recorded in your assigned subjects yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRADE ENTRY FORM */}
      {activeTab === 'entry' && (
        <div className="flex-col gap-6">
          <Card featured className="p-8">
            <h3 className="heading-sm" style={{ marginBottom: 'var(--space-2)' }}>
              Enter Academic Continuous Assessment / Exam Score
            </h3>
            <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: 'var(--space-4)' }}>
              Submit numerical score (0 to 100). The Flask backend verifies your teaching assignment
              and assigns the letter grade automatically.
            </p>

            <form onSubmit={handleRecordGrade} className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="entry-student">
                  Student Profile ID
                </label>
                <input
                  id="entry-student"
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  className="form-control"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Enter the student profile record ID
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="entry-subject">
                  Assigned Subject
                </label>
                <select
                  id="entry-subject"
                  className="form-control"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                >
                  <option value="">Select an Assigned Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="entry-session">
                  Academic Session ID
                </label>
                <input
                  id="entry-session"
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  className="form-control"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Session database ID (configured by Admin)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="entry-score">
                  Total Score (0 – 100)
                </label>
                <input
                  id="entry-score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 84"
                  className="form-control"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Button variant="gold" size="lg" type="submit">
                  Save & Compute Grade
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
