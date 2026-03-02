import axios, { AxiosInstance } from "axios";
import type {
  Product,
  Service,
  Career,
  PortfolioItem,
  Blog,
  CaseStudy,
  MailLog,
  MailPayload,
  CreateBlogPayload,
  AuthResponse,
  Review,
  AnalyticsOverview,
  RealtimeAnalytics,
  FunnelStage,
  TrafficDataPoint,
  TopPageData,
  CityDataPoint,
  CountryDataPoint,
  DeviceData,
  TrafficSourceData,
  AnalyticsEventRecord,
  CampaignPerformanceData,
  PlatformPerformanceData,
  DashboardSettings,
  ServiceCategory,
  ServiceSubcategory,
} from "../types/types";

// Base URL from environment (fallback to production API)
const BASE_URL = import.meta.env.VITE_API_BASE_URL; //|| 'https://api.phixels.agency/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("dashboard_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Helper to extract data from response
const getData = <T>(response: any): T => {
  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    return response.data.data;
  }
  return response.data;
};

// Auth API
export const authApi = {
  signup: async (data: any) => {
    const response = await apiClient.post("/auth/signup", data);
    return getData<AuthResponse>(response);
  },
  login: async (data: any) => {
    const response = await apiClient.post("/auth/login", data);
    return getData<AuthResponse>(response);
  },
  verifyEmail: async (data: { email: string; verificationCode: string }) => {
    const response = await apiClient.post("/auth/verify", {
      email: data.email,
      code: data.verificationCode,
    });
    return getData(response);
  },
  forgotPassword: async (data: { email: string }) => {
    const response = await apiClient.post("/auth/forgot-password", data);
    return getData(response);
  },
  resetPassword: async (data: {
    email: string;
    code: string;
    newPassword: string;
  }) => {
    const response = await apiClient.post("/auth/reset-password", data);
    return getData(response);
  },
  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return getData(response);
  },
};

// Mail API
export const mailApi = {
  send: async (data: MailPayload) => {
    if (data.files && data.files.length > 0) {
      const formData = new FormData();
      formData.append("to", data.to);
      formData.append("subject", data.subject);
      formData.append("message", data.message);
      data.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await apiClient.post("/mail/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return getData(response);
    } else {
      const response = await apiClient.post("/mail/send", data);
      return getData(response);
    }
  },
  getLogs: async (): Promise<MailLog[]> => {
    const response = await apiClient.get("/mail/logs");
    return getData<MailLog[]>(response);
  },
};

// Reviews API
export const reviewsApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post("/reviews/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const payload = getData<{ image: string }>(response);
    return payload.image;
  },
  create: async (data: Omit<Review, "_id">, imageFile?: File) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("role", data.role);
      formData.append("rating", String(data.rating));
      formData.append("review", data.review);
      formData.append("project", data.project);
      formData.append("budget", data.budget);
      formData.append("duration", data.duration);
      formData.append("summary", data.summary);
      formData.append("image", imageFile);
      const response = await apiClient.post("/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return getData<Review>(response);
    }
    const response = await apiClient.post("/reviews", data);
    return getData<Review>(response);
  },
  getAll: async (): Promise<Review[]> => {
    const response = await apiClient.get("/reviews");
    return getData<Review[]>(response);
  },
  getOne: async (id: string): Promise<Review> => {
    const response = await apiClient.get(`/reviews/${id}`);
    return getData<Review>(response);
  },
  update: async (id: string, data: Partial<Review>, imageFile?: File) => {
    if (imageFile) {
      const formData = new FormData();
      if (data.name !== undefined) formData.append("name", data.name);
      if (data.role !== undefined) formData.append("role", data.role);
      if (data.rating !== undefined) formData.append("rating", String(data.rating));
      if (data.review !== undefined) formData.append("review", data.review);
      if (data.project !== undefined) formData.append("project", data.project);
      if (data.budget !== undefined) formData.append("budget", data.budget);
      if (data.duration !== undefined) formData.append("duration", data.duration);
      if (data.summary !== undefined) formData.append("summary", data.summary);
      formData.append("image", imageFile);
      const response = await apiClient.patch(`/reviews/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return getData<Review>(response);
    }
    const response = await apiClient.patch(`/reviews/${id}`, data);
    return getData<Review>(response);
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/reviews/${id}`);
    return getData(response);
  },
};

// Blogs API
export const blogsApi = {
  create: async (data: CreateBlogPayload) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("writer", data.writer);
    formData.append("readingTime", data.readingTime);
    formData.append("details", data.details);
    formData.append("tags", JSON.stringify(data.tags));
    if (data.categoryName) formData.append("categoryName", data.categoryName);
    if (data.slug) formData.append("slug", data.slug);
    if (data.status) formData.append("status", data.status);
    if (data.serviceId) formData.append("serviceId", data.serviceId);
    if (data.isFeatured !== undefined) formData.append("isFeatured", String(data.isFeatured));
    if (data.featuredOrder !== undefined && data.featuredOrder !== null) {
      formData.append("featuredOrder", String(data.featuredOrder));
    }
    if (data.image) {
      formData.append("image", data.image);
    } else if (data.imageUrl) {
      formData.append("image", data.imageUrl);
    }

    const response = await apiClient.post("/blogs/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return getData<Blog>(response);
  },
  getAll: async (): Promise<Blog[]> => {
    const response = await apiClient.get("/blogs");
    return getData<Blog[]>(response);
  },
  getOne: async (id: string): Promise<Blog> => {
    const response = await apiClient.get(`/blogs/${id}`);
    return getData<Blog>(response);
  },
  update: async (id: string, data: Partial<CreateBlogPayload>) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.writer) formData.append("writer", data.writer);
    if (data.readingTime) formData.append("readingTime", data.readingTime);
    if (data.details) formData.append("details", data.details);
    if (data.tags) formData.append("tags", JSON.stringify(data.tags));
    if (data.categoryName !== undefined) formData.append("categoryName", data.categoryName);
    if (data.slug !== undefined) formData.append("slug", data.slug);
    if (data.status !== undefined) formData.append("status", data.status);
    if (data.serviceId !== undefined) formData.append("serviceId", data.serviceId);
    if (data.isFeatured !== undefined) formData.append("isFeatured", String(data.isFeatured));
    if (data.featuredOrder !== undefined && data.featuredOrder !== null) {
      formData.append("featuredOrder", String(data.featuredOrder));
    }
    if (data.image) {
      formData.append("image", data.image);
    } else if (data.imageUrl !== undefined) {
      formData.append("image", data.imageUrl);
    }

    const response = await apiClient.patch(`/blogs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return getData<Blog>(response);
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/blogs/${id}`);
    return getData(response);
  },
};

// Portfolio API
export const portfolioApi = {
  create: async (data: Omit<PortfolioItem, "_id">) => {
    const response = await apiClient.post("/portfolio", data);
    return getData<PortfolioItem>(response);
  },
  getAll: async (): Promise<PortfolioItem[]> => {
    const response = await apiClient.get("/portfolio");
    return getData<PortfolioItem[]>(response);
  },
  getOne: async (id: string): Promise<PortfolioItem> => {
    const response = await apiClient.get(`/portfolio/${id}`);
    return getData<PortfolioItem>(response);
  },
  update: async (id: string, data: Partial<PortfolioItem>) => {
    const response = await apiClient.patch(`/portfolio/${id}`, data);
    return getData<PortfolioItem>(response);
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/portfolio/${id}`);
    return getData(response);
  },
};

// Case Studies API
export const caseStudiesApi = {
  create: async (data: Omit<CaseStudy, "_id">) => {
    const response = await apiClient.post("/case-studies", data);
    return getData<CaseStudy>(response);
  },
  getAll: async (): Promise<CaseStudy[]> => {
    const response = await apiClient.get("/case-studies");
    return getData<CaseStudy[]>(response);
  },
  getOne: async (id: string): Promise<CaseStudy> => {
    const response = await apiClient.get(`/case-studies/${id}`);
    return getData<CaseStudy>(response);
  },
  update: async (id: string, data: Partial<CaseStudy>) => {
    const response = await apiClient.patch(`/case-studies/${id}`, data);
    return getData<CaseStudy>(response);
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/case-studies/${id}`);
    return getData(response);
  },
};

// Products API
export const productsApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post("/products/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const payload = getData<{ image: string }>(response);
    return payload.image;
  },
  create: async (data: Omit<Product, "_id">) => {
    const response = await apiClient.post("/products", data);
    return getData<Product>(response);
  },
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get("/products");
    return getData<Product[]>(response);
  },
  getOne: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return getData<Product>(response);
  },
  update: async (id: string, data: Partial<Product>) => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return getData<Product>(response);
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return getData(response);
  },
  getPinned: async (): Promise<Product[]> => {
    const response = await apiClient.get("/products/pinned");
    return getData<Product[]>(response);
  },
  updatePin: async (
    id: string,
    data: { isPinned: boolean; pinOrder?: 1 | 2 | 3 | null },
  ) => {
    const response = await apiClient.patch(`/products/${id}/pin`, data);
    return getData<Product>(response);
  },
};

// Services API
export const servicesApi = {
  uploadCategoryImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post("/services/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const payload = getData<{ image: string }>(response);
    return payload.image;
  },
  create: async (data: Omit<Service, "_id">) => {
    const response = await apiClient.post("/services", data);
    return getData<Service>(response);
  },
  getAll: async (): Promise<Service[]> => {
    const response = await apiClient.get("/services");
    return getData<Service[]>(response);
  },
  getOne: async (id: string): Promise<Service> => {
    const response = await apiClient.get(`/services/${id}`);
    return getData<Service>(response);
  },
  update: async (id: string, data: Partial<Service>) => {
    const response = await apiClient.patch(`/services/${id}`, data);
    return getData<Service>(response);
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/services/${id}`);
    return getData(response);
  },
  createCategory: async (data: Omit<ServiceCategory, "_id">) => {
    const response = await apiClient.post("/services/categories", data);
    return getData<ServiceCategory>(response);
  },
  getCategories: async (): Promise<ServiceCategory[]> => {
    const response = await apiClient.get("/services/categories");
    return getData<ServiceCategory[]>(response);
  },
  updateCategory: async (id: string, data: Partial<ServiceCategory>) => {
    const response = await apiClient.patch(`/services/categories/${id}`, data);
    return getData<ServiceCategory>(response);
  },
  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/services/categories/${id}`);
    return getData(response);
  },
  reorderCategories: async (orderedIds: string[]) => {
    const response = await apiClient.patch("/services/categories/reorder", {
      orderedIds,
    });
    return getData<ServiceCategory[]>(response);
  },
  createSubcategory: async (data: Omit<ServiceSubcategory, "_id">) => {
    const response = await apiClient.post("/services/subcategories", data);
    return getData<ServiceSubcategory>(response);
  },
  getSubcategories: async (): Promise<ServiceSubcategory[]> => {
    const response = await apiClient.get("/services/subcategories");
    return getData<ServiceSubcategory[]>(response);
  },
  updateSubcategory: async (id: string, data: Partial<ServiceSubcategory>) => {
    const response = await apiClient.patch(`/services/subcategories/${id}`, data);
    return getData<ServiceSubcategory>(response);
  },
  deleteSubcategory: async (id: string) => {
    const response = await apiClient.delete(`/services/subcategories/${id}`);
    return getData(response);
  },
  reorderSubcategories: async (categoryId: string, orderedIds: string[]) => {
    const response = await apiClient.patch("/services/subcategories/reorder", {
      categoryId,
      orderedIds,
    });
    return getData<ServiceSubcategory[]>(response);
  },
};

// Careers API
export const careersApi = {
  create: async (data: Omit<Career, "_id">) => {
    const response = await apiClient.post("/careers", data);
    return getData<Career>(response);
  },
  getAll: async (): Promise<Career[]> => {
    const response = await apiClient.get("/careers");
    return getData<Career[]>(response);
  },
  getOne: async (id: string): Promise<Career> => {
    const response = await apiClient.get(`/careers/${id}`);
    return getData<Career>(response);
  },
  update: async (id: string, data: Partial<Career>) => {
    const response = await apiClient.patch(`/careers/${id}`, data);
    return getData<Career>(response);
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/careers/${id}`);
    return getData(response);
  },
};

// Analytics API
export const analyticsApi = {
  getOverview: async (range: string = "all"): Promise<AnalyticsOverview> => {
    const response = await apiClient.get(`/analytics/overview?range=${range}`);
    return getData<AnalyticsOverview>(response);
  },
  getRealtime: async (): Promise<RealtimeAnalytics> => {
    const response = await apiClient.get("/analytics/realtime");
    return getData<RealtimeAnalytics>(response);
  },
  getFunnel: async (range = "all", source?: string): Promise<FunnelStage[]> => {
    const sourceQuery = source ? `&source=${encodeURIComponent(source)}` : "";
    const response = await apiClient.get(
      `/analytics/funnel?range=${range}${sourceQuery}`,
    );
    return getData<FunnelStage[]>(response);
  },
  getTrafficSeries: async (
    range: string = "7d",
  ): Promise<TrafficDataPoint[]> => {
    const response = await apiClient.get(`/analytics/traffic?range=${range}`);
    return getData<TrafficDataPoint[]>(response);
  },
  getTopPages: async (range: string = "7d"): Promise<TopPageData[]> => {
    const response = await apiClient.get(`/analytics/top-pages?range=${range}`);
    return getData<TopPageData[]>(response);
  },
  getTopCities: async (range: string = "7d"): Promise<CityDataPoint[]> => {
    const response = await apiClient.get(
      `/analytics/top-cities?range=${range}`,
    );
    return getData<CityDataPoint[]>(response);
  },
  getTopCountries: async (
    range: string = "7d",
  ): Promise<CountryDataPoint[]> => {
    const response = await apiClient.get(
      `/analytics/top-countries?range=${range}`,
    );
    return getData<CountryDataPoint[]>(response);
  },
  getDevices: async (range: string = "7d"): Promise<DeviceData> => {
    const response = await apiClient.get(`/analytics/devices?range=${range}`);
    return getData<DeviceData>(response);
  },
  getTrafficSources: async (
    range: string = "7d",
  ): Promise<TrafficSourceData[]> => {
    const response = await apiClient.get(
      `/analytics/traffic-sources?range=${range}`,
    );
    return getData<TrafficSourceData[]>(response);
  },
  getEvents: async (params?: {
    range?: string;
    eventType?: string;
    limit?: number;
    source?: string;
  }): Promise<AnalyticsEventRecord[]> => {
    const query = new URLSearchParams();
    if (params?.range) query.set("range", params.range);
    if (params?.eventType) query.set("eventType", params.eventType);
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.source) query.set("source", params.source);
    const q = query.toString();
    const response = await apiClient.get(
      `/analytics/events${q ? `?${q}` : ""}`,
    );
    return getData<AnalyticsEventRecord[]>(response);
  },
  getCampaignPerformance: async (
    range = "30d",
  ): Promise<CampaignPerformanceData[]> => {
    const response = await apiClient.get(`/analytics/campaigns?range=${range}`);
    return getData<CampaignPerformanceData[]>(response);
  },
  getPlatformPerformance: async (
    range = "30d",
  ): Promise<PlatformPerformanceData[]> => {
    const response = await apiClient.get(`/analytics/platforms?range=${range}`);
    return getData<PlatformPerformanceData[]>(response);
  },
};

export const settingsApi = {
  get: async (): Promise<DashboardSettings> => {
    const response = await apiClient.get("/settings");
    return getData<DashboardSettings>(response);
  },
  update: async (
    data: Partial<DashboardSettings>,
  ): Promise<DashboardSettings> => {
    const response = await apiClient.patch("/settings", data);
    return getData<DashboardSettings>(response);
  },
};

export default apiClient;
