import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { api } from '../../api/client';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const email = localStorage.getItem('school_portal_email') || '';

  const navItems = [
    { id: 'overview', label: 'Student Overview', icon: '📊' },
    { id: 'subjects', label: 'My Subjects', icon: '📚' },
    { id: 'results', label: 'My Results', icon: '📝' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  useEffect(() => {
    loadStudentData();
  }, []);

  async function loadStudentData() {
    setLoading(true);
    setError('');

    try {
      // Load the student's own results.
      const resultsResponse = await api.getMyResults();

      if (resultsResponse.ok) {
        setResults(
          Array.isArray(resultsResponse.data)
            ? resultsResponse.data
            : []
        );
      } else {
        setResults([]);

        const backendError =
          resultsResponse.error ||
          resultsResponse.data?.error ||
          '';

        if (backendError.toLowerCase().includes('student profile')) {
          setError(
            'Your account is not linked to a student profile yet. Please contact your school administrator.'
          );
        } else {
          setError(
            backendError || 'Unable to load your academic results.'
          );
        }
      }

      // Load available subjects.
      // We will verify the backend permissions and response structure
      // before treating these as the student's assigned subjects.
      const subjectsResponse = await api.getSubjects();

      if (subjectsResponse.ok) {
        setSubjects(
          Array.isArray(subjectsResponse.data)
            ? subjectsResponse.data
            : []
        );
      }
    } catch (err) {
      setError(
        'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  const averageScore =
    results.length > 0
      ? (
          results.reduce(
            (total, result) => total + Number(result.score || 0),
            0
          ) / results.length
        ).toFixed(1)
      : '—';

  function getGradeVariant(grade) {
    if (grade === 'A') return 'gold';
    if (grade === 'B') return 'navy';
    if (grade === 'F') return 'danger';

    return 'sky';
  }

  return (
    <DashboardLayout
      title="Student Academic Portal"
      roleLabel="Student"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ERROR MESSAGE */}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            border: '1px solid rgba(185,28,28,0.2)',
          }}
        >
          {error}
        </div>
      )}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex-col gap-6">
          <div>
            <h2
              className="heading-sm"
              style={{ marginBottom: '0.5rem' }}
            >
              Welcome to Your Academic Portal
            </h2>

            <p
              className="text-muted"
              style={{ fontSize: '0.875rem' }}
            >
              View your subjects, monitor your academic performance,
              and keep track of your results.
            </p>
          </div>

          <div className="grid grid-3 gap-4">
            <Card className="flex-col gap-1">
              <span
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Available Subjects
              </span>

              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-navy-900)',
                }}
              >
                {loading ? '...' : subjects.length}
              </span>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Subjects returned by the server
              </span>
            </Card>

            <Card className="flex-col gap-1">
              <span
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Recorded Results
              </span>

              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-navy-900)',
                }}
              >
                {loading ? '...' : results.length}
              </span>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Your available grade records
              </span>
            </Card>

            <Card className="flex-col gap-1">
              <span
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Average Score
              </span>

              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--color-navy-900)',
                }}
              >
                {loading ? '...' : averageScore}
              </span>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                Based on available results
              </span>
            </Card>
          </div>

          <Card featured className="flex-col gap-3">
            <h3 className="heading-sm">
              Your Academic Workspace
            </h3>

            <p
              className="text-muted"
              style={{ fontSize: '0.875rem' }}
            >
              Your academic portal gives you access to your
              available subjects and recorded results. Contact
              your school administrator if your academic
              information is missing.
            </p>

            <div className="flex gap-3">
              <Button
                variant="gold"
                size="sm"
                onClick={() => setActiveTab('results')}
              >
                View My Results
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={loadStudentData}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : '↻ Refresh Data'}
              </Button>
            </div>
          </Card>

          <Card className="flex-col gap-3">
            <h3 className="heading-sm">
              Recent Results
            </h3>

            {results.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject ID</th>
                      <th>Academic Session</th>
                      <th>Score</th>
                      <th>Grade</th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.slice(0, 5).map((result) => (
                      <tr key={result.id}>
                        <td>#{result.subject_id}</td>

                        <td>
                          {result.academic_session_id
                            ? `Session #${result.academic_session_id}`
                            : '—'}
                        </td>

                        <td>
                          <strong>{result.score}</strong>/100
                        </td>

                        <td>
                          <Badge
                            variant={getGradeVariant(result.grade)}
                          >
                            Grade {result.grade || '—'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p
                className="text-muted"
                style={{ fontSize: '0.875rem' }}
              >
                {loading
                  ? 'Loading your results...'
                  : 'No results are currently available.'}
              </p>
            )}
          </Card>
        </div>
      )}

      {/* MY SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="flex-col gap-6">
          <div>
            <h2 className="heading-sm">
              My Subjects
            </h2>

            <p
              className="text-muted"
              style={{
                fontSize: '0.875rem',
                marginTop: '0.5rem',
              }}
            >
              View the subjects available through your academic portal.
            </p>
          </div>

          {loading ? (
            <Card>
              <p className="text-muted">
                Loading subjects...
              </p>
            </Card>
          ) : subjects.length > 0 ? (
            <div className="grid grid-3 gap-4">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="flex-col gap-3"
                >
                  <div
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-cream)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}
                  >
                    📚
                  </div>

                  <div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--color-navy-900)',
                      }}
                    >
                      {subject.name}
                    </h3>

                    <p
                      className="text-muted"
                      style={{ fontSize: '0.8125rem' }}
                    >
                      Subject ID: #{subject.id}
                    </p>
                  </div>

                  <Badge variant="gold">
                    Academic Subject
                  </Badge>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-muted">
                No subjects are currently available.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* MY RESULTS */}
      {activeTab === 'results' && (
        <div className="flex-col gap-6">
          <div>
            <h2 className="heading-sm">
              My Academic Results
            </h2>

            <p
              className="text-muted"
              style={{
                fontSize: '0.875rem',
                marginTop: '0.5rem',
              }}
            >
              Review your recorded scores and grades.
            </p>
          </div>

          <div className="grid grid-3 gap-4">
            <Card className="flex-col gap-1">
              <span className="text-muted">
                Total Results
              </span>

              <strong
                style={{
                  fontSize: '1.75rem',
                  color: 'var(--color-navy-900)',
                }}
              >
                {results.length}
              </strong>
            </Card>

            <Card className="flex-col gap-1">
              <span className="text-muted">
                Average Score
              </span>

              <strong
                style={{
                  fontSize: '1.75rem',
                  color: 'var(--color-navy-900)',
                }}
              >
                {averageScore}
              </strong>
            </Card>

            <Card className="flex-col gap-1">
              <span className="text-muted">
                Highest Score
              </span>

              <strong
                style={{
                  fontSize: '1.75rem',
                  color: 'var(--color-navy-900)',
                }}
              >
                {results.length > 0
                  ? Math.max(
                      ...results.map((result) =>
                        Number(result.score || 0)
                      )
                    )
                  : '—'}
              </strong>
            </Card>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Result ID</th>
                  <th>Subject ID</th>
                  <th>Academic Session</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>

              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>#{result.id}</td>

                    <td>
                      Subject #{result.subject_id}
                    </td>

                    <td>
                      {result.academic_session_id
                        ? `Session #${result.academic_session_id}`
                        : '—'}
                    </td>

                    <td>
                      <strong>{result.score}</strong>/100
                    </td>

                    <td>
                      <Badge
                        variant={getGradeVariant(result.grade)}
                      >
                        Grade {result.grade || '—'}
                      </Badge>
                    </td>
                  </tr>
                ))}

                {results.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: 'center',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {loading
                        ? 'Loading results...'
                        : 'You do not have any recorded results yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MY PROFILE */}
      {activeTab === 'profile' && (
        <div className="flex-col gap-6">
          <div>
            <h2 className="heading-sm">
              My Profile
            </h2>

            <p
              className="text-muted"
              style={{
                fontSize: '0.875rem',
                marginTop: '0.5rem',
              }}
            >
              Your account information.
            </p>
          </div>

          <Card featured className="flex-col gap-4">
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-cream)',
                color: 'var(--color-navy-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
              }}
            >
              {email ? email.charAt(0).toUpperCase() : 'S'}
            </div>

            <div>
              <span
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Account Email
              </span>

              <p
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                  color: 'var(--color-navy-900)',
                  overflowWrap: 'anywhere',
                }}
              >
                {email || 'Email unavailable'}
              </p>
            </div>

            <div>
              <span
                className="text-muted"
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Account Role
              </span>

              <div style={{ marginTop: '0.5rem' }}>
                <Badge variant="gold">
                  Student
                </Badge>
              </div>
            </div>

            <p
              className="text-muted"
              style={{ fontSize: '0.8125rem' }}
            >
              For changes to your student profile, contact
              your school administrator.
            </p>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}