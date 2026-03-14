// API Types based on Postman collection

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role?: string;
  passwordLastChangedAt?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthResponse {
  accessToken?: string;
  user?: User;
  data?: {
    accessToken: string;
    user: User;
  };
}

export interface Author {
  _id: string;
  name: string;
  profileImage: string;
  role: string;
}

// Mail
export interface MailPayload {
  to: string;
  subject: string;
  message: string;
  files?: File[];
}

export interface MailLog {
  _id: string;
  to: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

// Blogs
export interface Blog {
  _id: string;
  title: string;
  writer: string;
  readingTime: string;
  details: string;
  tags: string[];
  image?: string; // URL or path
  categoryName?: string;
  slug?: string;
  status?: "published" | "draft";
  icon?: string;
  serviceId?: string;
  authorId?: string;
  isFeatured?: boolean;
  featuredOrder?: number | null;
  createTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogPayload {
  title: string;
  writer: string;
  readingTime: string;
  details: string;
  tags: string[];
  image?: File;
  imageUrl?: string;
  categoryName?: string;
  slug?: string;
  status?: "published" | "draft";
  icon?: string;
  serviceId?: string;
  authorId?: string;
  isFeatured?: boolean;
  featuredOrder?: number | null;
}

// Portfolio
export interface PortfolioItem {
  _id: string;
  title: string;
  client: string;
  category: string;
  details: string;
  technology: string[];
  activeUsers?: string;
  image: string;
  liveLink?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Case Studies
export interface CaseStudy {
  _id: string;
  title: string;
  client: string;
  category: string;
  challenge: string;
  solution: string;
  result: string;
  image: string;
  link: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCaseStudyPayload {
  title: string;
  client: string;
  category: string;
  challenge: string;
  solution: string;
  result: string;
  image: string;
  link: string;
}

// Products
export interface Product {
  _id: string;
  name: string;
  description: string;
  features: string[];
  pricing?: number;
  demoLink?: string;
  images?: string[];
  category: string;
  reviewRating?: number | null;
  userCount?: number | null;
  downloadsEnabled?: boolean;
  downloadCount?: number | null;
  isPinned?: boolean;
  pinOrder?: 1 | 2 | 3 | null;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Services
export interface Service {
  _id: string;
  title: string;
  description: string;
  icon?: string;
  features?: string[];
  images?: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Careers
export interface Career {
  _id: string;
  jobTitle: string;
  jobType: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salaryRange: string;
  deadline: string;
  applicationEmail: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCareerPayload {
  jobTitle: string;
  jobType: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salaryRange: string;
  deadline: string;
  applicationEmail: string;
}

// Reviews
export interface Review {
  _id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  review: string;
  project: string;
  budget: string;
  duration: string;
  summary: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewPayload {
  name: string;
  role: string;
  image: string;
  rating: number;
  review: string;
  project: string;
  budget: string;
  duration: string;
  summary: string;
  isActive?: boolean;
}

// Analytics
export interface AnalyticsOverview {
  totalVisits: number;
  conversions: number;
  bounceRate: number;
  avgDuration: number;
  totalLeads: number;
  pendingLeads: number;
  bookedLeads: number;
  conversionRate: number;
  realtimeUsers: number;
  newsletterSubs?: number;
  clickCounts: {
    gmail: number;
    whatsapp: number;
    fiverr: number;
    linkedin: number;
    facebook: number;
    emailOpens: number;
  };
  criticalInsights?: Array<{
    id: string;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  }>;
  notifications?: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    createdAt: string;
  }>;
}

export interface RealtimeAnalytics {
  activeUsers: number;
  deviceCounts: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  pageCounts: Record<string, number>;
  liveEvents: Array<{
    event: string;
    location: string;
    device: string;
    time: string;
    activity: string;
  }>;
}

export interface FunnelStage {
  stage: string;
  users: number;
  rate: number;
  dropoff?: number;
}

export interface TrafficDataPoint {
  name: string;
  visitors: number;
  conversions: number;
}

export interface TopPageData {
  path: string;
  visits: number;
  avgTime?: string | null;
  bounce?: number | null;
  conversions: number;
}

export interface CityDataPoint {
  name: string;
  country: string;
  visitors: number;
}

export interface CountryDataPoint {
  code: string;
  name: string;
  visitors: number;
  conversions: number;
  rate: number;
  trend: "up" | "down" | "neutral";
}

export interface DeviceData {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface TrafficSourceData {
  name: string;
  visitors: number;
  share: number;
  conversions: number;
  conversionRate: number;
  trend: number;
}

export interface AnalyticsEventRecord {
  _id: string;
  eventType: string;
  sessionId: string;
  pagePath?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  deviceType?: string;
  country?: string;
  city?: string;
  channel?: string;
  metadata?: Record<string, any>;
  eventAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceSeo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface ServiceCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  iconKey: string;
  heroImage?: string;
  bannerImage?: string;
  sortOrder?: number;
  isActive?: boolean;
  seo?: ServiceSeo;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceSubcategory {
  _id: string;
  categoryId:
    | string
    | {
        _id: string;
        name?: string;
        slug?: string;
      };
  name: string;
  slug: string;
  shortDescription: string;
  longDescription?: string;
  coverImage?: string;
  gallery?: string[];
  keyFeatures?: string[];
  techStack?: string[];
  processSteps?: string[];
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignPerformanceData {
  name: string;
  status: "Active" | "Paused" | "Ended";
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cost: number;
  roi: number;
  lastEventAt: string;
}

export interface PlatformPerformanceData {
  id: string;
  name: string;
  status: "connected" | "disconnected";
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  lastSync: string | null;
}

export interface DashboardSettings {
  _id?: string;
  notificationRecipients: string[];
  alerts: {
    newLead: boolean;
    meetingBooked: boolean;
    contactMessages: boolean;
    newsletter: boolean;
    jobApplications: boolean;
  };
  account: {
    fullName: string;
    email: string;
    twoFactorEnabled: boolean;
    passwordLastChangedAt?: string;
  };
}

export interface AboutMetric {
  label: string;
  value: number;
  suffix: string;
}

export interface AboutPhilosophy {
  heading: string;
  description: string;
  image?: string;
}

export interface AboutContactInfo {
  whatsapp: string;
  fiverr: string;
  linkedin: string;
  email: string;
  behance: string;
  facebook: string;
  phone: string;
  address: string;
}

export interface AboutContent {
  _id?: string;
  metrics: AboutMetric[];
  philosophy: AboutPhilosophy;
  contactInfo: AboutContactInfo;
  clients: { name: string; logo: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMemberSocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  image?: string;
  socialLinks?: TeamMemberSocialLinks;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PageMetricIconKey = "users" | "download" | "star" | "trending-up";

export interface PageMetric {
  label: string;
  value: number;
  suffix: string;
  iconKey?: PageMetricIconKey;
}

export interface PageMetricsContent {
  _id?: string;
  homeHeroMetrics: [PageMetric, PageMetric];
  servicesPageMetrics: [PageMetric, PageMetric, PageMetric, PageMetric];
  productsPageMetrics: [PageMetric, PageMetric, PageMetric, PageMetric];
  createdAt?: string;
  updatedAt?: string;
}

export interface LegalSection {
  title: string;
  content: string;
}

export interface LegalContent {
  privacyPolicy: LegalSection[];
  termsConditions: LegalSection[];
}

export interface LegalContentResponse {
  _id?: string;
  privacyPolicy: LegalSection[];
  termsConditions: LegalSection[];
  createdAt?: string;
  updatedAt?: string;
}

// Page Content CMS
export interface PageSection {
  sectionKey: string;
  head?: string;
  subHead?: string;
  caption?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  video?: string;
}

export interface PageContent {
  _id?: string;
  pageKey: string;
  title: string;
  sections: PageSection[];
  createdAt?: string;
  updatedAt?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: any;
}
