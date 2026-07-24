const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  let token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  return response;
}

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },
  getProfile: async () => {
    const res = await fetchWithAuth('/auth/profile/');
    return res.json();
  },
  changePassword: async (data: any) => {
    const res = await fetchWithAuth('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getLogs: async () => {
    const res = await fetchWithAuth('/auth/logs/');
    return res.json();
  },

  // Analytics & Dashboard
  getDashboard: async () => {
    const res = await fetchWithAuth('/analytics/dashboard/');
    return res.json();
  },
  getRankings: async () => {
    const res = await fetchWithAuth('/analytics/rankings/');
    return res.json();
  },
  getAnalyticsDetails: async () => {
    const res = await fetchWithAuth('/analytics/details/');
    return res.json();
  },
  getPredictions: async () => {
    const res = await fetchWithAuth('/analytics/predictions/');
    return res.json();
  },
  getAIInsights: async () => {
    const res = await fetchWithAuth('/analytics/insights/');
    return res.json();
  },
  askAIChatbot: async (message: string) => {
    const res = await fetchWithAuth('/analytics/chat/', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  // Students
  getStudents: async (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetchWithAuth(`/students/${queryString}`);
    return res.json();
  },
  getDepartments: async () => {
    const res = await fetchWithAuth('/students/departments/');
    return res.json();
  },
  getStudentDetail: async (id: string | number) => {
    const res = await fetchWithAuth(`/students/${id}/`);
    return res.json();
  },
  createStudent: async (data: any) => {
    const res = await fetchWithAuth('/students/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateStudent: async (id: string | number, data: any) => {
    const res = await fetchWithAuth(`/students/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteStudent: async (id: string | number) => {
    const res = await fetchWithAuth(`/students/${id}/`, {
      method: 'DELETE',
    });
    return res.json();
  },
  importStudents: async (formData: FormData) => {
    const res = await fetchWithAuth('/students/import/', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  // Assessments
  getAssessments: async () => {
    const res = await fetchWithAuth('/assessments/');
    return res.json();
  },
  createAssessment: async (data: any) => {
    const res = await fetchWithAuth('/assessments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteAssessment: async (id: number) => {
    const res = await fetchWithAuth(`/assessments/${id}/`, {
      method: 'DELETE',
    });
    return res.json();
  },
  uploadScores: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const res = await fetchWithAuth('/assessments/scores/upload/', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
    return res.json();
  },

  // Company Eligibility
  getCompanies: async () => {
    const res = await fetchWithAuth('/company-eligibility/');
    return res.json();
  },
  createCompany: async (data: any) => {
    const res = await fetchWithAuth('/company-eligibility/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateCompany: async (id: number, data: any) => {
    const res = await fetchWithAuth(`/company-eligibility/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteCompany: async (id: number) => {
    const res = await fetchWithAuth(`/company-eligibility/${id}/`, {
      method: 'DELETE',
    });
    return res.json();
  },
  generateCompanyEligibility: async (companyId: number) => {
    const res = await fetchWithAuth(`/company-eligibility/${companyId}/generate/`, {
      method: 'POST',
    });
    return res.json();
  },

  // Reports
  getReports: async () => {
    const res = await fetchWithAuth('/reports/');
    return res.json();
  },
  generateReport: async (data: any) => {
    const res = await fetchWithAuth('/reports/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
