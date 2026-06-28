export type UserRole = 'admin' | 'instructor' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  rollNumber: string; // Mandatory for premium
  centreName: string; // Mandatory
  batchNumber: string; // Mandatory
  role: UserRole;
  isPremium: boolean;
  enrolledCourses: string[]; // List of Course/Test ID keys
  registeredAt: string;
  
  // Subscription management
  subscriptionPlan?: 'free' | 'silver' | 'gold' | 'platinum';
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
  subscriptionStatus?: 'active' | 'expired' | 'pending_verification';
  sessionToken?: string | null;
  lastActiveTime?: string;
}

export interface TestSection {
  id: string;
  name: string;
  durationMinutes: number; // Sectional timing
  questionsCount: number;
}

export interface Question {
  id: string;
  sectionId: string; // Section reference
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface TestSeries {
  id: string;
  title: string;
  examCategory: 'SSC CGL' | 'SSC CHSL' | 'SSC MTS' | 'Delhi Police' | 'State Exams';
  isPaid: boolean;
  price: number;
  sections: TestSection[];
  totalMarks: number;
  totalQuestions: number;
  questions: Question[];
  enrolledCount: number;
}

export interface SectionScore {
  sectionName: string;
  score: number;
  correct: number;
  incorrect: number;
  unattempted: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  examCategory: string;
  userId: string;
  userName: string;
  rollNumber: string;
  completedAt: string;
  score: number;
  totalMarks: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedAnswers: number;
  sectionDetails: SectionScore[];
  timeSpentSeconds: number;
}

export interface LiveDoubt {
  id: string;
  studentUid: string;
  studentName: string;
  studentRoll: string;
  subject: string;
  message: string;
  reply?: string;
  repliedBy?: string;
  repliedAt?: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  subject: string;
  experience: string;
  imageUrl?: string;
}

export interface OfflineBatch {
  id: string;
  courseName: string;
  startDate: string;
  timings: string;
  duration: string;
  venue: string; // Center Name
}

export interface Testimonial {
  id: string;
  studentName: string;
  selection: string; // e.g. "Selected in SSC CGL 2024 - Inspector"
  message: string;
  rating: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: string;
  action: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  ipAddress: string;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: 'Mathematics' | 'Reasoning' | 'English' | 'General Knowledge';
  examCategory: string;
  isPaid: boolean;
  pdfUrl?: string;
  contentSummary: string;
  downloadCount: number;
  chapterId?: string;
  subjectId?: string;
}

// Subject and Chapter management
export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
}

// Payment Verification System
export interface PaymentVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'silver' | 'gold' | 'platinum';
  amount: number;
  validityDays: number;
  transactionId: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

// Notification Alert System
export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'reminder' | 'expiry';
  read: boolean;
  createdAt: string;
}

// Notice Board
export interface Notice {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  date: string;
  author: string;
}

// Banner Carousels
export interface AppBanner {
  id: string;
  imageUrl: string;
  title: string;
  link?: string;
  active: boolean;
}
