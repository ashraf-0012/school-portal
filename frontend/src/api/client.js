const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('school_portal_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data?.error || data?.message || 'Request failed',
        data,
      };
    }

    return {
      ok: true,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);

    return {
      ok: false,
      status: 0,
      error:
        'Unable to connect to the server. Make sure the Flask backend is running.',
      data: null,
    };
  }
}

export const api = {
  // Authentication
  register(userData) {
    return request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login(email, password) {
    return request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser() {
    return request('/me', {
      method: 'GET',
    });
  },

  getProtected() {
    return request('/protected', {
      method: 'GET',
    });
  },

  checkAdminOnly() {
    return request('/admin-only', {
      method: 'GET',
    });
  },

  getMyResults() {
    return request('/my-results', {
      method: 'GET',
    });
  },

  // Users
  getUsers() {
    return request('/users', {
      method: 'GET',
    });
  },

  createUser(userData) {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  deleteUser(id) {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Students
  getStudents() {
    return request('/students', {
      method: 'GET',
    });
  },

  createStudent(studentData) {
    return request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  deleteStudent(id) {
    return request(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Classes
  getClasses() {
    return request('/classes', {
      method: 'GET',
    });
  },

  createClass(classData) {
    return request('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  },

  deleteClass(id) {
    return request(`/classes/${id}`, {
      method: 'DELETE',
    });
  },

  // Teachers
  getTeachers() {
    return request('/teachers', {
      method: 'GET',
    });
  },

  createTeacher(teacherData) {
    return request('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  },

  deleteTeacher(id) {
    return request(`/teachers/${id}`, {
      method: 'DELETE',
    });
  },

  // Subjects
  getSubjects() {
    return request('/subjects', {
      method: 'GET',
    });
  },

  createSubject(subjectData) {
    return request('/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  },

  deleteSubject(id) {
    return request(`/subjects/${id}`, {
      method: 'DELETE',
    });
  },

  // Teaching assignments
  getTeachingAssignments() {
    return request('/teaching-assignments', {
      method: 'GET',
    });
  },

  createTeachingAssignment(assignmentData) {
    return request('/teaching-assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  deleteTeachingAssignment(id) {
    return request(`/teaching-assignments/${id}`, {
      method: 'DELETE',
    });
  },

  // Academic sessions
  getAcademicSessions() {
    return request('/academic-sessions', {
      method: 'GET',
    });
  },

  createAcademicSession(sessionData) {
    return request('/academic-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  deleteAcademicSession(id) {
    return request(`/academic-sessions/${id}`, {
      method: 'DELETE',
    });
  },

  // Results
  getResults() {
    return request('/results', {
      method: 'GET',
    });
  },

  createResult(resultData) {
    return request('/results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
  },

  deleteResult(id) {
    return request(`/results/${id}`, {
      method: 'DELETE',
    });
  },
};