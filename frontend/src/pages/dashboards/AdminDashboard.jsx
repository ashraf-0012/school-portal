import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { api } from '../../api/client';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [results, setResults] = useState([]);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [newClass, setNewClass] = useState({ name: '' });
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [newStudent, setNewStudent] = useState({ user_id: '', admission_number: '', class_id: '' });
  const [newTeacher, setNewTeacher] = useState({ user_id: '' });
  const [newAssignment, setNewAssignment] = useState({ teacher_id: '', class_id: '', subject_id: '' });
  const [newSession, setNewSession] = useState({ session: '', term: '' });
  const [newResult, setNewResult] = useState({ student_id: '', subject_id: '', academic_session_id: '', score: '' });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'User Accounts', icon: '👥' },
    { id: 'students', label: 'Student Profiles', icon: '🎓' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'teachers', label: 'Teacher Profiles', icon: '👨‍🏫' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'assignments', label: 'Teaching Assignments', icon: '📋' },
    { id: 'sessions', label: 'Academic Sessions', icon: '🗓️' },
    { id: 'results', label: 'Student Results', icon: '📝' },
  ];

  // Resolve internal relationship IDs to readable labels for the interface.
  // Database IDs are still used internally for API requests and React keys.
  const getUser = (userId) => users.find((user) => Number(user.id) === Number(userId));
  const getUserName = (userId) => getUser(userId)?.name || 'Unknown user';
  const getClassName = (classId) => classes.find((item) => Number(item.id) === Number(classId))?.name || 'Unassigned class';
  const getSubjectName = (subjectId) => subjects.find((item) => Number(item.id) === Number(subjectId))?.name || 'Unknown subject';
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((item) => Number(item.id) === Number(teacherId));
    return teacher ? getUserName(teacher.user_id) : 'Unknown teacher';
  };
  const getStudentName = (studentId) => {
    const student = students.find((item) => Number(item.id) === Number(studentId));
    return student ? getUserName(student.user_id) : 'Unknown student';
  };
  const getSessionName = (sessionId) => {
    const session = sessions.find((item) => Number(item.id) === Number(sessionId));
    return session ? `${session.session} · ${session.term}` : 'Unknown session';
  };

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    setError('');
    try {
      const [uRes, stRes, cRes, tRes, subRes, aRes, sesRes, rRes] = await Promise.all([
        api.getUsers(),
        api.getStudents(),
        api.getClasses(),
        api.getTeachers(),
        api.getSubjects(),
        api.getTeachingAssignments(),
        api.getAcademicSessions(),
        api.getResults(),
      ]);

      if (uRes.ok) setUsers(uRes.data || []);
      if (stRes.ok) setStudents(stRes.data || []);
      if (cRes.ok) setClasses(cRes.data || []);
      if (tRes.ok) setTeachers(tRes.data || []);
      if (subRes.ok) setSubjects(subRes.data || []);
      if (aRes.ok) setAssignments(aRes.data || []);
      if (sesRes.ok) setSessions(sesRes.data || []);
      if (rRes.ok) setResults(rRes.data || []);
    } catch (err) {
      setError('Error loading administrative data.');
    } finally {
      setLoading(false);
    }
  }

  // Action handlers
  async function handleCreateUser(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const res = await api.createUser(newUser);
    if (res.ok) {
      setMessage('User created successfully.');
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      const refresh = await api.getUsers();
      if (refresh.ok) setUsers(refresh.data);
    } else {
      setError(res.error || 'Failed to create user.');
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm('Delete this user?')) return;
    const res = await api.deleteUser(id);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setMessage('User deleted.');
    } else {
      setError(res.error || 'Failed to delete user.');
    }
  }

  async function handleCreateClass(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const res = await api.createClass({ name: newClass.name.trim() });
    if (res.ok) {
      setMessage('Class created successfully.');
      setNewClass({ name: '' });
      const refresh = await api.getClasses();
      if (refresh.ok) setClasses(refresh.data);
    } else {
      setError(res.error || 'Failed to create class.');
    }
  }

  async function handleDeleteClass(id) {
    if (!window.confirm('Delete this class?')) return;
    const res = await api.deleteClass(id);
    if (res.ok) {
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setMessage('Class deleted.');
    } else {
      setError(res.error || 'Failed to delete class.');
    }
  }

  async function handleCreateSubject(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const res = await api.createSubject({ name: newSubject.name.trim() });
    if (res.ok) {
      setMessage('Subject created successfully.');
      setNewSubject({ name: '' });
      const refresh = await api.getSubjects();
      if (refresh.ok) setSubjects(refresh.data);
    } else {
      setError(res.error || 'Failed to create subject.');
    }
  }

  async function handleDeleteSubject(id) {
    if (!window.confirm('Delete this subject?')) return;
    const res = await api.deleteSubject(id);
    if (res.ok) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setMessage('Subject deleted.');
    } else {
      setError(res.error || 'Failed to delete subject.');
    }
  }

  async function handleCreateStudent(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const res = await api.createStudent({
      user_id: parseInt(newStudent.user_id),
      admission_number: newStudent.admission_number,
      class_id: parseInt(newStudent.class_id),
    });
    if (res.ok) {
      setMessage('Student profile created successfully.');
      setNewStudent({ user_id: '', admission_number: '', class_id: '' });
      const refresh = await api.getStudents();
      if (refresh.ok) setStudents(refresh.data);
    } else {
      setError(res.error || 'Failed to create student profile.');
    }
  }

  async function handleDeleteStudent(id) {
    if (!window.confirm('Delete this student profile?')) return;
    const res = await api.deleteStudent(id);
    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setMessage('Student deleted.');
    } else {
      setError(res.error || 'Failed to delete student.');
    }
  }

  async function handleCreateTeacher(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const res = await api.createTeacher({ user_id: parseInt(newTeacher.user_id, 10) });
    if (res.ok) {
      setMessage('Teacher profile created.');
      setNewTeacher({ user_id: '' });
      const refresh = await api.getTeachers();
      if (refresh.ok) setTeachers(refresh.data);
    } else {
      setError(res.error || 'Failed to create teacher.');
    }
  }

  async function handleDeleteTeacher(id) {
    if (!window.confirm('Delete this teacher profile?')) return;
    const res = await api.deleteTeacher(id);
    if (res.ok) {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setMessage('Teacher profile deleted.');
    } else {
      setError(res.error || 'Failed to delete teacher.');
    }
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const res = await api.createTeachingAssignment({
      teacher_id: parseInt(newAssignment.teacher_id),
      class_id: parseInt(newAssignment.class_id),
      subject_id: parseInt(newAssignment.subject_id),
    });
    if (res.ok) {
      setMessage('Teaching assignment created.');
      setNewAssignment({ teacher_id: '', class_id: '', subject_id: '' });
      const refresh = await api.getTeachingAssignments();
      if (refresh.ok) setAssignments(refresh.data);
    } else {
      setError(res.error || 'Failed to create assignment.');
    }
  }

  async function handleDeleteAssignment(id) {
    if (!window.confirm('Delete this teaching assignment?')) return;
    const res = await api.deleteTeachingAssignment(id);
    if (res.ok) {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      setMessage('Assignment deleted.');
    } else {
      setError(res.error || 'Failed to delete assignment.');
    }
  }

  async function handleCreateSession(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const res = await api.createAcademicSession(newSession);
    if (res.ok) {
      setMessage('Academic session created.');
      setNewSession({ session: '', term: '' });
      const refresh = await api.getAcademicSessions();
      if (refresh.ok) setSessions(refresh.data);
    } else {
      setError(res.error || 'Failed to create session.');
    }
  }

  async function handleDeleteSession(id) {
    if (!window.confirm('Delete this session?')) return;
    const res = await api.deleteAcademicSession(id);
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setMessage('Session deleted.');
    } else {
      setError(res.error || 'Failed to delete session.');
    }
  }

  async function handleCreateResult(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const res = await api.createResult({
      student_id: parseInt(newResult.student_id),
      subject_id: parseInt(newResult.subject_id),
      academic_session_id: parseInt(newResult.academic_session_id),
      score: parseFloat(newResult.score),
    });
    if (res.ok) {
      setMessage('Result recorded successfully.');
      setNewResult({ student_id: '', subject_id: '', academic_session_id: '', score: '' });
      const refresh = await api.getResults();
      if (refresh.ok) setResults(refresh.data);
    } else {
      setError(res.error || 'Failed to create result.');
    }
  }

  async function handleDeleteResult(id) {
    if (!window.confirm('Delete this result?')) return;
    const res = await api.deleteResult(id);
    if (res.ok) {
      setResults((prev) => prev.filter((r) => r.id !== id));
      setMessage('Result deleted.');
    } else {
      setError(res.error || 'Failed to delete result.');
    }
  }

  return (
    <DashboardLayout
      title="Administrator Control Center"
      roleLabel="Administrator"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Alert Notices */}
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

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="flex-col gap-6">
          <div className="grid grid-4 gap-4">
            <Card className="flex-col gap-1">
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Users</span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>{users.length}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Registered accounts</span>
            </Card>

            <Card className="flex-col gap-1">
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Students</span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>{students.length}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Enrolled student profiles</span>
            </Card>

            <Card className="flex-col gap-1">
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Classes</span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>{classes.length}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>JSS & SSS arms</span>
            </Card>

            <Card className="flex-col gap-1">
              <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Results</span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>{results.length}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Computed academic grades</span>
            </Card>
          </div>

          <Card featured className="flex-col gap-3">
            <h3 className="heading-sm">Portal Administration Quick Actions</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              Use the sidebar tabs to manage student admissions, assign subjects to teachers,
              configure academic terms, and review grading computed by the Flask backend.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="primary" size="sm" onClick={() => setActiveTab('students')}>
                Add Student Profile
              </Button>
              <Button variant="gold" size="sm" onClick={() => setActiveTab('classes')}>
                Create New Class
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('sessions')}>
                Configure Academic Term
              </Button>
              <Button variant="outline" size="sm" onClick={loadAllData}>
                {loading ? 'Refreshing...' : '↻ Refresh Backend Data'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="flex-col gap-6">
          <Card featured>
            <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Create User Account (Student or Teacher)</h3>
            <form onSubmit={handleCreateUser} className="grid grid-4 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                className="form-control"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                className="form-control"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Temporary Password"
                className="form-control"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <select
                  className="form-control"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <Button variant="gold" size="md" type="submit">Add</Button>
              </div>
            </form>
          </Card>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <Badge variant={u.role === 'admin' ? 'navy' : u.role === 'teacher' ? 'gold' : 'sky'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="flex-col gap-6">
          <Card featured>
            <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Assign Student Academic Profile</h3>
            <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
              Select a user account with the student role, assign an admission number, and allocate to a class.
            </p>
            <form onSubmit={handleCreateStudent} className="grid grid-3 gap-4">
              <select
                className="form-control"
                value={newStudent.user_id}
                onChange={(e) => setNewStudent({ ...newStudent, user_id: e.target.value })}
                required
              >
                <option value="">Select Student User Account</option>
                {users.filter((u) => u.role === 'student').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Admission No. (e.g. STU/2026/001)"
                className="form-control"
                value={newStudent.admission_number}
                onChange={(e) => setNewStudent({ ...newStudent, admission_number: e.target.value })}
                required
              />

              <div className="flex gap-2">
                <select
                  className="form-control"
                  value={newStudent.class_id}
                  onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                  required
                >
                  <option value="">Select Enrolled Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Button variant="gold" size="md" type="submit">Create</Button>
              </div>
            </form>
          </Card>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Admission Number</th>
                  <th>Class</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td><strong>{getUserName(st.user_id)}</strong></td>
                    <td>{st.admission_number || '—'}</td>
                    <td>{getClassName(st.class_id)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(st.id)}
                        style={{ color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No student profiles enrolled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLASSES TAB */}
      {activeTab === 'classes' && (
        <div className="flex-col gap-6">
          <Card featured>
            <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Create Class (JSS 1 – SSS 3)</h3>
            <form onSubmit={handleCreateClass} className="flex gap-4">
              <input
                type="text"
                placeholder="Class Name (e.g. JSS 1 Gold, SSS 2 Science)"
                className="form-control"
                value={newClass.name}
                onChange={(e) => setNewClass({ name: e.target.value })}
                required
              />
              <Button variant="gold" size="md" type="submit">Add Class</Button>
            </form>
          </Card>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(c.id)}
                        style={{ color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEACHERS TAB */}
      {activeTab === 'teachers' && (
        <div className="flex-col gap-6">
          <Card featured>
            <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Create Teacher Profile</h3>
            <form onSubmit={handleCreateTeacher} className="flex gap-4">
              <select
                className="form-control"
                value={newTeacher.user_id}
                onChange={(e) => setNewTeacher({ user_id: e.target.value })}
                required
              >
                <option value="">Select Teacher User Account</option>
                {users.filter((u) => u.role === 'teacher').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <Button variant="gold" size="md" type="submit">Create Profile</Button>
            </form>
          </Card>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{getUserName(t.user_id)}</strong></td>
                    <td>{getUser(t.user_id)?.email || '—'}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeacher(t.id)}
                        style={{ color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className="flex-col gap-6">
          <Card featured>
            <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Create Subject</h3>
            <form onSubmit={handleCreateSubject} className="flex gap-4">
              <input
                type="text"
                placeholder="Subject Name (e.g. Mathematics, English Language, Physics)"
                className="form-control"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ name: e.target.value })}
                required
              />
              <Button variant="gold" size="md" type="submit">Add Subject</Button>
            </form>
          </Card>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubject(s.id)}
                        style={{ color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEACHING ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="flex-col gap-6">
          <Card featured>
            <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Assign Teacher to Class & Subject</h3>
            <form onSubmit={handleCreateAssignment} className="grid grid-3 gap-4">
              <select
                className="form-control"
                value={newAssignment.teacher_id}
                onChange={(e) => setNewAssignment({ ...newAssignment, teacher_id: e.target.value })}
                required
              >
                <option value="">Select Teacher Profile</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{getUserName(t.user_id)}</option>
                ))}
              </select>

              <select
                className="form-control"
                value={newAssignment.class_id}
                onChange={(e) => setNewAssignment({ ...newAssignment, class_id: e.target.value })}
                required
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <select
                  className="form-control"
                  value={newAssignment.subject_id}
                  onChange={(e) => setNewAssignment({ ...newAssignment, subject_id: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <Button variant="gold" size="md" type="submit">Assign</Button>
              </div>
            </form>
          </Card>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{getTeacherName(a.teacher_id)}</strong></td>
                    <td>{getClassName(a.class_id)}</td>
                    <td>{getSubjectName(a.subject_id)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteAssignment(a.id)}
                        style={{ color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SESSIONS TAB */}
      {activeTab === 'sessions' && (
        <div className="flex-col gap-6">
          <Card featured>
            <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Create Academic Session & Term</h3>
            <form onSubmit={handleCreateSession} className="grid grid-2 gap-4">
              <input
                type="text"
                placeholder="Academic Session (e.g. 2024/2025)"
                className="form-control"
                value={newSession.session}
                onChange={(e) => setNewSession({ ...newSession, session: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Term (e.g. First Term, Second Term)"
                  className="form-control"
                  value={newSession.term}
                  onChange={(e) => setNewSession({ ...newSession, term: e.target.value })}
                  required
                />
                <Button variant="gold" size="md" type="submit">Add</Button>
              </div>
            </form>
          </Card>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Academic Session</th>
                  <th>Term</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.session}</strong></td>
                    <td>{s.term}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(s.id)}
                        style={{ color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="flex-col gap-6">
          <Card featured>
            <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Record Academic Result</h3>
            <form onSubmit={handleCreateResult} className="grid grid-4 gap-4">
              <select
                className="form-control"
                value={newResult.student_id}
                onChange={(e) => setNewResult({ ...newResult, student_id: e.target.value })}
                required
              >
                <option value="">Select Student Profile</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {getUserName(st.user_id)} · {st.admission_number || 'No admission number'}
                  </option>
                ))}
              </select>

              <select
                className="form-control"
                value={newResult.subject_id}
                onChange={(e) => setNewResult({ ...newResult, subject_id: e.target.value })}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                className="form-control"
                value={newResult.academic_session_id}
                onChange={(e) => setNewResult({ ...newResult, academic_session_id: e.target.value })}
                required
              >
                <option value="">Select Term / Session</option>
                {sessions.map((ses) => (
                  <option key={ses.id} value={ses.id}>
                    {ses.session} - {ses.term}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  inputMode="numeric"
                  placeholder="Score (0-100)"
                  className="form-control"
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    color: '#111827',
                    WebkitTextFillColor: '#111827',
                    backgroundColor: '#ffffff',
                    caretColor: '#111827',
                    appearance: 'auto',
                    WebkitAppearance: 'auto',
                  }}
                  value={newResult.score}
                  onChange={(e) => setNewResult({ ...newResult, score: e.target.value })}
                  required
                />
                <Button variant="gold" size="md" type="submit">Submit</Button>
              </div>
            </form>
          </Card>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Academic Session</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{getStudentName(r.student_id)}</strong></td>
                    <td>{getSubjectName(r.subject_id)}</td>
                    <td>{getSessionName(r.academic_session_id)}</td>
                    <td><strong>{r.score}</strong>/100</td>
                    <td>
                      <Badge variant={r.grade === 'A' ? 'gold' : r.grade === 'B' ? 'navy' : r.grade === 'F' ? 'danger' : 'sky'}>
                        Grade {r.grade}
                      </Badge>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteResult(r.id)}
                        style={{ color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
