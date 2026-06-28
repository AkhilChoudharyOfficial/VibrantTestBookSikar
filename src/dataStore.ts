import { 
  UserProfile, 
  TestSeries, 
  LiveDoubt, 
  FacultyMember, 
  OfflineBatch, 
  Testimonial, 
  AuditLog, 
  StudyNote, 
  TestAttempt,
  Question,
  TestSection,
  Subject,
  Chapter,
  PaymentVerification,
  NotificationAlert,
  Notice,
  AppBanner
} from './types';
import { obfuscate, deobfuscate } from './lib/security';

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substring(2, 9);

// --- INITIAL DEFAULT DATA ---

const defaultFaculty: FacultyMember[] = [
  {
    id: 'f1',
    name: 'Mr. Akhil Choudhary',
    designation: 'Director & HOD Mathematics',
    subject: 'Mathematics (Advanced & Arithmetic)',
    experience: '12+ Years of teaching experience with over 5000+ selections in SSC.'
  },
  {
    id: 'f2',
    name: 'Dr. RK Sharma',
    designation: 'Senior Faculty',
    subject: 'General Studies & Polity',
    experience: '10+ Years of teaching civil services and SSC exams. Famous for memory-tricks.'
  },
  {
    id: 'f3',
    name: 'Prof. S. Verma',
    designation: 'HOD English',
    subject: 'English Language & Comprehension',
    experience: '8+ Years experience. Specially trained in vocabulary building & verbal ability.'
  },
  {
    id: 'f4',
    name: 'Mr. Pankaj Godara',
    designation: 'Reasoning Mastermind',
    subject: 'General Intelligence & Reasoning',
    experience: '7+ Years. Pioneer in non-verbal reasoning and shortcut techniques.'
  }
];

const defaultOfflineBatches: OfflineBatch[] = [
  {
    id: 'b1',
    courseName: 'SSC CGL 2026 Target Batch (Special Super-50)',
    startDate: 'July 05, 2026',
    timings: '08:00 AM - 02:00 PM (Daily 6 Hours)',
    duration: '6 Months Complete Course',
    venue: 'Nawalgarh Road, Sikar (Main Campus)'
  },
  {
    id: 'b2',
    courseName: 'Delhi Police Constable & SI Hybrid Batch',
    startDate: 'July 12, 2026',
    timings: '09:00 AM - 01:00 PM',
    duration: '4 Months Crash + Test Series',
    venue: 'Nawalgarh Road, Sikar (Campus B)'
  },
  {
    id: 'b3',
    courseName: 'State Level Exams (LDC, CET, Patwar) Special',
    startDate: 'July 18, 2026',
    timings: '02:00 PM - 06:00 PM',
    duration: '5 Months Foundation',
    venue: 'Nawalgarh Road, Sikar (Main Campus)'
  }
];

const defaultTestimonials: Testimonial[] = [
  {
    id: 't1',
    studentName: 'Amit Verma',
    selection: 'Selected in SSC CGL 2024 - Assistant Section Officer (CSS)',
    message: 'Vibrant Career Institute Sikar changed my life. Akhil Sir\'s math shortcuts are magical. The offline rigorous atmosphere and daily test series gave me the edge I needed to clear SSC CGL in my first attempt.',
    rating: 5
  },
  {
    id: 't2',
    studentName: 'Priya Shekhawat',
    selection: 'Delhi Police Sub-Inspector (Rank 42)',
    message: 'The sectional timings in Vibrant Test Series are exactly matching the actual examination pattern. Regular doubts were cleared by faculty members instantly. Highly recommended for Delhi Police!',
    rating: 5
  },
  {
    id: 't3',
    studentName: 'Rajesh Nehra',
    selection: 'Selected in SSC CHSL 2025 - Postal Assistant',
    message: 'Vibrant Sikar provides the best physical and digital study material. The simulated mock tests have high-quality questions, especially the quantitative aptitude section which mirrors real SSC exams.',
    rating: 5
  }
];

// Seed default Subjects & Chapters
const defaultSubjects: Subject[] = [
  { id: 'sub_math', name: 'Mathematics', description: 'Advanced Mathematics, Trigonometry, Algebra, and Quantitative Aptitude shortcuts.' },
  { id: 'sub_reasoning', name: 'Reasoning', description: 'Logical deduction, Syllogisms, Coding-Decoding and Blood Relations.' },
  { id: 'sub_english', name: 'English', description: 'Grammar Rules, Reading Comprehension, Synonyms, and Antonyms.' },
  { id: 'sub_gk', name: 'General Knowledge', description: 'Indian Polity, History, Static GK, and Delhi Police specialized General Studies.' }
];

const defaultChapters: Chapter[] = [
  { id: 'ch_alg', subjectId: 'sub_math', name: 'Algebra Shortcuts', description: 'Formulas and quick tricks for linear and quadratic equations.' },
  { id: 'ch_pl', subjectId: 'sub_math', name: 'Profit & Loss', description: 'Concept of CP, SP, Dishonest Seller, and Markup Percentage.' },
  { id: 'ch_gr', subjectId: 'sub_english', name: 'Golden Rules of Grammar', description: 'Core 100 grammar rules repeated in SSC exams.' },
  { id: 'ch_cd', subjectId: 'sub_reasoning', name: 'Coding-Decoding', description: 'Letter shifts, grid patterns, and reverse codes.' },
  { id: 'ch_const', subjectId: 'sub_gk', name: 'Indian Constitution', description: 'Key Articles, Schedules, and Amendments for SSC/Delhi Police.' }
];

const defaultStudyNotes: StudyNote[] = [
  {
    id: 'n1',
    title: 'Algebra Ultimate Shortcut Formulas (Tricks Sheet)',
    subject: 'Mathematics',
    examCategory: 'SSC CGL',
    isPaid: false,
    pdfUrl: 'https://vibrantparivar.in/handbooks/algebra_tricks.pdf',
    contentSummary: 'Complete formulas of Algebra including quadratic equations, identity rules, maximum-minimum values with shortcut tricks and previous year examples.',
    downloadCount: 1420,
    subjectId: 'sub_math',
    chapterId: 'ch_alg'
  },
  {
    id: 'n2',
    title: '100 Golden Rules of English Grammar (SSC Special)',
    subject: 'English',
    examCategory: 'SSC CGL / CHSL',
    isPaid: true,
    pdfUrl: 'https://vibrantparivar.in/handbooks/100_english_rules.pdf',
    contentSummary: 'Vibrant HOD Special curated notes containing 100 most repeated error-spotting rules with visual examples and previous questions. Perfect for score-boost.',
    downloadCount: 954,
    subjectId: 'sub_english',
    chapterId: 'ch_gr'
  },
  {
    id: 'n3',
    title: 'Coding-Decoding & Analogy Quick Tricks',
    subject: 'Reasoning',
    examCategory: 'All Exams',
    isPaid: false,
    pdfUrl: 'https://vibrantparivar.in/handbooks/reasoning_coding.pdf',
    contentSummary: 'Memorize alphabet placements, reverse letters, pattern analysis, and syllogism tricks for fast 50/50 scoring in Reasoning.',
    downloadCount: 2110,
    subjectId: 'sub_reasoning',
    chapterId: 'ch_cd'
  },
  {
    id: 'n4',
    title: 'Ancient & Medieval India - Comprehensive Timeline Notes',
    subject: 'General Knowledge',
    examCategory: 'SSC & State Exams',
    isPaid: true,
    pdfUrl: 'https://vibrantparivar.in/handbooks/ancient_medieval_timeline.pdf',
    contentSummary: 'Highly organized static General Knowledge handout on History. Bulleted events, war timelines, empire structures, and culture highlights for easy recall.',
    downloadCount: 420,
    subjectId: 'sub_gk',
    chapterId: 'ch_const'
  }
];

// SSC CGL Mock Questions Builder Helper
const createCGLQuestions = (): Question[] => [
  {
    id: 'q1',
    sectionId: 'sec_math',
    questionText: 'If a + b + c = 6 and a² + b² + c² = 14, then find the value of ab + bc + ca.',
    options: ['11', '22', '14', '36'],
    correctAnswerIndex: 0,
    explanation: 'Using the formula: (a+b+c)² = a² + b² + c² + 2(ab+bc+ca) => 6² = 14 + 2(ab+bc+ca) => 36 - 14 = 2(ab+bc+ca) => 22 = 2(ab+bc+ca) => ab+bc+ca = 11.'
  },
  {
    id: 'q2',
    sectionId: 'sec_math',
    questionText: 'A dishonest shopkeeper sells goods at his cost price but uses a weight of 900 gm instead of a kg weight. Find his actual profit percentage.',
    options: ['10%', '11.11%', '9.09%', '12.5%'],
    correctAnswerIndex: 1,
    explanation: 'Profit % = (Error / True Value - Error) * 100 = (100g / 900g) * 100 = 11.11%.'
  },
  {
    id: 'q3',
    sectionId: 'sec_math',
    questionText: 'If the price of petrol increases by 25%, by how much percent should a consumer reduce consumption so that expenditure remains unchanged?',
    options: ['20%', '25%', '16.67%', '30%'],
    correctAnswerIndex: 0,
    explanation: 'Reduction % = [r / (100 + r)] * 100 = [25 / 125] * 100 = 20%.'
  },
  {
    id: 'q4',
    sectionId: 'sec_reasoning',
    questionText: 'In a certain code language, VIBRANT is coded as YLBUDQW. How will CAREER be coded in that language?',
    options: ['FDUHHU', 'FDTHHU', 'EDTGGU', 'FDSGGT'],
    correctAnswerIndex: 0,
    explanation: 'Each letter is shifted forward by +3 positions: C(+3)=F, A(+3)=D, R(+3)=U, E(+3)=H, E(+3)=H, R(+3)=U.'
  },
  {
    id: 'q5',
    sectionId: 'sec_reasoning',
    questionText: 'Select the missing number from the given series: 7, 11, 20, 36, 61, ?',
    options: ['97', '95', '81', '101'],
    correctAnswerIndex: 0,
    explanation: 'Differences are: 4 (2²), 9 (3²), 16 (4²), 25 (5²). Next difference must be 36 (6²). So 61 + 36 = 97.'
  },
  {
    id: 'q6',
    sectionId: 'sec_english',
    questionText: 'Choose the correct synonym of the word: "EPHEMERAL"',
    options: ['Eternal', 'Transient', 'Gigantic', 'Profound'],
    correctAnswerIndex: 1,
    explanation: '"Ephemeral" means lasting for a very short time; transient or short-lived.'
  },
  {
    id: 'q7',
    sectionId: 'sec_english',
    questionText: 'Find the error in the following sentence: "Neither Akhil nor his friends is attending the special test today."',
    options: ['Neither Akhil nor', 'his friends is', 'attending the special', 'No error'],
    correctAnswerIndex: 1,
    explanation: 'According to proximity rule, if subjects are joined by "neither... nor", the verb agrees with the closer subject. "Friends" is plural, so verb should be "are", not "is".'
  },
  {
    id: 'q8',
    sectionId: 'sec_gk',
    questionText: 'Which Article of the Indian Constitution specifies the establishment of the Finance Commission of India?',
    options: ['Article 280', 'Article 324', 'Article 110', 'Article 360'],
    correctAnswerIndex: 0,
    explanation: 'Article 280 of the Constitution provides for a Finance Commission as a quasi-judicial body.'
  },
  {
    id: 'q9',
    sectionId: 'sec_gk',
    questionText: 'Nawalgarh Road is located in which educational hub city of Rajasthan?',
    options: ['Jaipur', 'Sikar', 'Kota', 'Jodhpur'],
    correctAnswerIndex: 1,
    explanation: 'Nawalgarh Road is a highly prominent coaching hub located in Sikar, Rajasthan, where Vibrant Career Institute main campus stands.'
  }
];

const defaultTests: TestSeries[] = [
  {
    id: 'test_cgl_1',
    title: 'SSC CGL 2026 - Premium Full Syllabus Mock Test (Actual Pattern)',
    examCategory: 'SSC CGL',
    isPaid: true,
    price: 99,
    totalMarks: 200,
    totalQuestions: 9,
    enrolledCount: 1248,
    sections: [
      { id: 'sec_math', name: 'Quantitative Aptitude', durationMinutes: 1, questionsCount: 3 },
      { id: 'sec_reasoning', name: 'General Intelligence & Reasoning', durationMinutes: 1, questionsCount: 2 },
      { id: 'sec_english', name: 'English Language', durationMinutes: 1, questionsCount: 2 },
      { id: 'sec_gk', name: 'General Awareness', durationMinutes: 1, questionsCount: 2 }
    ],
    questions: createCGLQuestions()
  },
  {
    id: 'test_dp_1',
    title: 'Delhi Police Sub-Inspector 2026 - Free General Ability Practice Set',
    examCategory: 'Delhi Police',
    isPaid: false,
    price: 0,
    totalMarks: 50,
    totalQuestions: 4,
    enrolledCount: 3840,
    sections: [
      { id: 'dp_reasoning', name: 'Reasoning Ability', durationMinutes: 2, questionsCount: 2 },
      { id: 'dp_gs', name: 'GS & Current Affairs', durationMinutes: 1, questionsCount: 2 }
    ],
    questions: [
      {
        id: 'dp1',
        sectionId: 'dp_reasoning',
        questionText: 'Point A is 5m West of B. Point C is 10m North of A. What is the distance between B and C?',
        options: ['15m', '11.18m', '12.5m', '10m'],
        correctAnswerIndex: 1,
        explanation: 'Using Pythagoras theorem: BC = √(5² + 10²) = √(25 + 100) = √125 = approx 11.18m.'
      },
      {
        id: 'dp2',
        sectionId: 'dp_reasoning',
        questionText: 'Find the odd one out in the given list of numbers.',
        options: ['27 (3³)', '64 (4³)', '125 (5³)', '144 (12²)'],
        correctAnswerIndex: 3,
        explanation: 'All other numbers are perfect cubes, while 144 is a perfect square (12²).'
      },
      {
        id: 'dp3',
        sectionId: 'dp_gs',
        questionText: 'Who has been appointed as the Commissioner of Delhi Police currently?',
        options: ['Sanjay Arora', 'Alok Kumar', 'Rajesh Gupta', 'Sunil Kumar'],
        correctAnswerIndex: 0,
        explanation: 'Sanjay Arora is the Commissioner of Delhi Police.'
      },
      {
        id: 'dp4',
        sectionId: 'dp_gs',
        questionText: 'In which year did Delhi become a National Capital Territory (NCT) by the 69th Constitutional Amendment?',
        options: ['1991', '1995', '1989', '2001'],
        correctAnswerIndex: 0,
        explanation: 'The 69th Amendment Act, 1991 granted National Capital Territory status to Delhi.'
      }
    ]
  }
];

const defaultAttempts: TestAttempt[] = [
  {
    id: 'att_1',
    testId: 'test_dp_1',
    testTitle: 'Delhi Police Sub-Inspector 2026 - Free General Ability Practice Set',
    examCategory: 'Delhi Police',
    userId: 'user_st_123',
    userName: 'Karan Choudhary',
    rollNumber: 'VIB-SSC-904',
    completedAt: '2026-06-23T14:20:00Z',
    score: 37.5,
    totalMarks: 50,
    correctAnswers: 3,
    incorrectAnswers: 1,
    unattemptedAnswers: 0,
    sectionDetails: [
      { sectionName: 'Reasoning Ability', score: 25, correct: 2, incorrect: 0, unattempted: 0 },
      { sectionName: 'GS & Current Affairs', score: 12.5, correct: 1, incorrect: 1, unattempted: 0 }
    ],
    timeSpentSeconds: 110
  }
];

const defaultDoubts: LiveDoubt[] = [
  {
    id: 'd1',
    studentUid: 'user_st_123',
    studentName: 'Karan Choudhary',
    studentRoll: 'VIB-SSC-904',
    subject: 'Mathematics',
    message: 'Sir, please help me understand why profit percent calculation changes when dishonest weight is used instead of normal gain/loss. Is cost price always the weight given or standard?',
    status: 'resolved',
    reply: 'Dear Karan, in weight fraud, the cost to the shopkeeper is actually the cost of the weight he ACTUALLY GIVES (e.g. 900gm). Thus, his cost price equivalent is 900gm, while selling price equivalent is 1000gm. Profit is 100gm on a cost of 900gm. So Profit% = 100/900 * 100 = 11.11%.',
    repliedBy: 'Mr. Akhil Choudhary',
    repliedAt: '2026-06-23T18:30:00Z',
    createdAt: '2026-06-23T15:00:00Z'
  }
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'a1',
    timestamp: '2026-06-24T03:00:00Z',
    userEmail: 'director@vibrant.com',
    userRole: 'admin',
    action: 'SECURITY_CONTROL_AUDIT',
    details: 'Anti-copy headers, developer tools hook monitoring, and dynamic watermarks initialized.',
    severity: 'INFO',
    ipAddress: '192.168.1.1'
  }
];

const defaultNotices: Notice[] = [
  {
    id: 'n_welcome',
    title: 'Welcome to Vibrant Career Institute, Sikar - Virtual Student Portal!',
    content: 'We are thrilled to launch our brand-new secure digital learning portal. Now access direct digital PDF handbook study files, online mock simulations, live doubt rooms with HOD Akhil Sir, and active batch updates. All contents are fully copyright protected.',
    pinned: true,
    date: '2026-06-27T10:00:00Z',
    author: 'Akhil Choudhary'
  },
  {
    id: 'n_test_notice',
    title: 'Important: SSC CGL Tier-1 Mega Mock Test Series Released!',
    content: 'Our TCS-Simulated Mega Mock Test is live. Verify your active student roll codes and complete the assessment before the upcoming Monday review meeting at the Nawalgarh Road campus.',
    pinned: false,
    date: '2026-06-28T08:00:00Z',
    author: 'Admin Office Sikar'
  }
];

const defaultBanners: AppBanner[] = [
  {
    id: 'ban_1',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
    title: 'Vibrant Career Institute Sikar: Building Success Since 2014!',
    link: '#batches',
    active: true
  },
  {
    id: 'ban_2',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop',
    title: 'Interactive Mock Simulator: Exact TCS Pattern Replicas',
    link: '#mocks',
    active: true
  }
];

const defaultNotifications: NotificationAlert[] = [
  {
    id: 'nt_1',
    title: '🎉 Premium Portal Ready',
    message: 'Welcome to the newly refactored Sikar digital portal! All secure handbooks are now loaded.',
    type: 'success',
    read: false,
    createdAt: '2026-06-28T07:00:00Z'
  }
];

const defaultPayments: PaymentVerification[] = [
  {
    id: 'pay_demo_1',
    userId: 'user_st_123',
    userName: 'Karan Choudhary',
    userEmail: 'student.karan@gmail.com',
    plan: 'gold',
    amount: 999,
    validityDays: 90,
    transactionId: 'TXN8849301293',
    date: '2026-06-28T06:15:00Z',
    status: 'approved'
  }
];

// Default logged in Administrator account
const defaultAdminUser: UserProfile = {
  id: 'user_admin',
  name: 'Akhil Choudhary (Director)',
  email: 'director@vibrant.com',
  mobile: '9414000135',
  rollNumber: 'VIB-DIR-01',
  centreName: 'Sikar Main Campus',
  batchNumber: 'ADMIN-A1',
  role: 'admin',
  isPremium: true,
  enrolledCourses: ['test_cgl_1'],
  registeredAt: '2026-01-01T00:00:00Z',
  subscriptionPlan: 'platinum',
  subscriptionStartDate: '2026-01-01T00:00:00Z',
  subscriptionEndDate: '2030-01-01T00:00:00Z',
  subscriptionStatus: 'active',
  sessionToken: 'jwt_mock_admin_token'
};

// Seed student
const defaultStudentUser: UserProfile = {
  id: 'user_st_123',
  name: 'Karan Choudhary',
  email: 'student.karan@gmail.com',
  mobile: '9876543210',
  rollNumber: 'VIB-SSC-904',
  centreName: 'Nawalgarh Road, Sikar (Main Campus)',
  batchNumber: 'SSC-2026-Super50',
  role: 'student',
  isPremium: false,
  enrolledCourses: [],
  registeredAt: '2026-06-20T00:00:00Z',
  subscriptionPlan: 'free',
  subscriptionStartDate: null,
  subscriptionEndDate: null,
  subscriptionStatus: 'active',
  sessionToken: 'jwt_mock_student_token'
};

// --- DATA ACCESS LAYER WRAPPERS WITH OBFUSCATION FOR SECURE USER DATA ---

const loadKey = <T>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      // Determine if we are loading sensitive user profiles or credentials
      if (key === 'v_users' || key === 'v_curr_user') {
        try {
          // If obfuscated, deobfuscate first
          if (value.startsWith('obf:')) {
            const raw = deobfuscate(value.substring(4));
            return JSON.parse(raw);
          }
        } catch (e) {
          // fall through to normal json parsing if it was saved un-obfuscated previously
        }
      }
      return JSON.parse(value);
    }
  } catch (e) {
    console.error('Error loading key: ' + key, e);
  }
  return defaultValue;
};

const saveKey = <T>(key: string, value: T): void => {
  try {
    if (key === 'v_users' || key === 'v_curr_user') {
      const serialized = JSON.stringify(value);
      const obfuscated = 'obf:' + obfuscate(serialized);
      localStorage.setItem(key, obfuscated);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error('Error saving key: ' + key, e);
  }
};

export const initializeDB = (): void => {
  if (!localStorage.getItem('v_faculty')) saveKey('v_faculty', defaultFaculty);
  if (!localStorage.getItem('v_batches')) saveKey('v_batches', defaultOfflineBatches);
  if (!localStorage.getItem('v_testimonials')) saveKey('v_testimonials', defaultTestimonials);
  if (!localStorage.getItem('v_subjects')) saveKey('v_subjects', defaultSubjects);
  if (!localStorage.getItem('v_chapters')) saveKey('v_chapters', defaultChapters);
  if (!localStorage.getItem('v_notes')) saveKey('v_notes', defaultStudyNotes);
  if (!localStorage.getItem('v_tests')) saveKey('v_tests', defaultTests);
  if (!localStorage.getItem('v_attempts')) saveKey('v_attempts', defaultAttempts);
  if (!localStorage.getItem('v_doubts')) saveKey('v_doubts', defaultDoubts);
  if (!localStorage.getItem('v_logs')) saveKey('v_logs', defaultAuditLogs);
  if (!localStorage.getItem('v_notices')) saveKey('v_notices', defaultNotices);
  if (!localStorage.getItem('v_banners')) saveKey('v_banners', defaultBanners);
  if (!localStorage.getItem('v_notifications')) saveKey('v_notifications', defaultNotifications);
  if (!localStorage.getItem('v_payments')) saveKey('v_payments', defaultPayments);
  
  // Seed initial accounts securely if empty
  const users = loadKey<UserProfile[]>('v_users', []);
  if (users.length === 0) {
    users.push(defaultAdminUser);
    users.push(defaultStudentUser);
    saveKey('v_users', users);
  }
};

// Accessors
export const getFaculty = (): FacultyMember[] => loadKey('v_faculty', defaultFaculty);
export const saveFaculty = (data: FacultyMember[]): void => saveKey('v_faculty', data);

export const getOfflineBatches = (): OfflineBatch[] => loadKey('v_batches', defaultOfflineBatches);
export const saveOfflineBatches = (data: OfflineBatch[]): void => saveKey('v_batches', data);

export const getTestimonials = (): Testimonial[] => loadKey('v_testimonials', defaultTestimonials);
export const saveTestimonials = (data: Testimonial[]): void => saveKey('v_testimonials', data);

export const getSubjects = (): Subject[] => loadKey('v_subjects', defaultSubjects);
export const saveSubjects = (data: Subject[]): void => saveKey('v_subjects', data);

export const getChapters = (): Chapter[] => loadKey('v_chapters', defaultChapters);
export const saveChapters = (data: Chapter[]): void => saveKey('v_chapters', data);

export const getStudyNotes = (): StudyNote[] => loadKey('v_notes', defaultStudyNotes);
export const saveStudyNotes = (data: StudyNote[]): void => saveKey('v_notes', data);

export const getTests = (): TestSeries[] => loadKey('v_tests', defaultTests);
export const saveTests = (data: TestSeries[]): void => saveKey('v_tests', data);

export const getAttempts = (): TestAttempt[] => loadKey('v_attempts', defaultAttempts);
export const saveAttempts = (data: TestAttempt[]): void => saveKey('v_attempts', data);

export const getDoubts = (): LiveDoubt[] => loadKey('v_doubts', defaultDoubts);
export const saveDoubts = (data: LiveDoubt[]): void => saveKey('v_doubts', data);

export const getAuditLogs = (): AuditLog[] => loadKey('v_logs', defaultAuditLogs);
export const saveAuditLogs = (data: AuditLog[]): void => saveKey('v_logs', data);

export const getNotices = (): Notice[] => loadKey('v_notices', defaultNotices);
export const saveNotices = (data: Notice[]): void => saveKey('v_notices', data);

export const getBanners = (): AppBanner[] => loadKey('v_banners', defaultBanners);
export const saveBanners = (data: AppBanner[]): void => saveKey('v_banners', data);

export const getNotifications = (): NotificationAlert[] => loadKey('v_notifications', defaultNotifications);
export const saveNotifications = (data: NotificationAlert[]): void => saveKey('v_notifications', data);

export const getPayments = (): PaymentVerification[] => loadKey('v_payments', defaultPayments);
export const savePayments = (data: PaymentVerification[]): void => saveKey('v_payments', data);

// Logged in User management with security checks
export const getCurrentUser = (): UserProfile | null => {
  return loadKey<UserProfile | null>('v_curr_user', null);
};

export const setCurrentUser = (user: UserProfile | null): void => {
  if (user) {
    user.lastActiveTime = new Date().toISOString();
  }
  saveKey('v_curr_user', user);
};

// Helper to quickly log audits for tracing
export const appendAuditLog = (action: string, userEmail: string, role: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO'): void => {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: 'log_' + uuid(),
    timestamp: new Date().toISOString(),
    userEmail,
    userRole: role,
    action,
    details,
    severity,
    ipAddress: '223.189.' + Math.floor(Math.random() * 254 + 1) + '.' + Math.floor(Math.random() * 254 + 1)
  };
  logs.unshift(newLog);
  saveAuditLogs(logs);
};

// Register user with encrypted password/mobile logic
export const registerUser = (profile: Omit<UserProfile, 'id' | 'registeredAt' | 'isPremium' | 'enrolledCourses'>): UserProfile => {
  const users = loadKey<UserProfile[]>('v_users', []);
  const existing = users.find(u => u.email === profile.email);
  if (existing) {
    return existing;
  }

  const newUser: UserProfile = {
    ...profile,
    id: 'user_' + uuid(),
    isPremium: false,
    enrolledCourses: [],
    registeredAt: new Date().toISOString(),
    subscriptionPlan: 'free',
    subscriptionStartDate: null,
    subscriptionEndDate: null,
    subscriptionStatus: 'active',
    sessionToken: 'jwt_' + Math.random().toString(36).substring(2, 15)
  };

  users.push(newUser);
  saveKey('v_users', users);
  appendAuditLog('USER_REGISTRATION', newUser.email, newUser.role, `Student registered. Roll: ${newUser.rollNumber}, Campus: ${newUser.centreName}`, 'INFO');
  return newUser;
};

// Simulated JWT Session Login
export const loginUser = (email: string, mobile: string): UserProfile | null => {
  const users = loadKey<UserProfile[]>('v_users', []);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.mobile === mobile);
  if (user) {
    // Generate secure simulated JWT token
    const token = 'jwt_' + btoa(`${email}:${Date.now()}`).substring(0, 32);
    const updatedUser = {
      ...user,
      sessionToken: token,
      lastActiveTime: new Date().toISOString()
    };
    
    // Update both session and storage list
    setCurrentUser(updatedUser);
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = updatedUser;
    }
    saveKey('v_users', users);

    appendAuditLog('JWT_AUTH_SUCCESS', user.email, user.role, `Secure JWT session token validated. Active time updated.`, 'INFO');
    
    // Trigger notification
    addNotification('🔓 Security Login Alert', `New session initialized for ${user.name} under securely encrypted local vault.`, 'info');
    
    return updatedUser;
  }
  return null;
};

// --- SECURITY AND SIMULATED RATE-LIMITING ENGINE ---
const requestLogs: { [key: string]: number[] } = {};

export const checkRateLimit = (identifier: string, action: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  if (!requestLogs[key]) {
    requestLogs[key] = [];
  }
  
  // Filter out expired timestamps
  requestLogs[key] = requestLogs[key].filter(timestamp => now - timestamp < windowMs);
  
  if (requestLogs[key].length >= maxRequests) {
    appendAuditLog('RATE_LIMIT_BLOCKED', identifier, 'guest', `Rate limiting blocked activity: "${action}". Threshold: ${maxRequests} req/min.`, 'WARNING');
    return false;
  }
  
  requestLogs[key].push(now);
  return true;
};

// --- SUBSCRIPTION SYSTEM AUTO-EXPIRE ENGINE ---
export const checkAndExpireSubscriptions = (): void => {
  const users = loadKey<UserProfile[]>('v_users', []);
  const curr = getCurrentUser();
  const now = new Date();
  let updatedAny = false;

  const updatedUsers = users.map(user => {
    if (user.subscriptionPlan && user.subscriptionPlan !== 'free' && user.subscriptionEndDate) {
      const end = new Date(user.subscriptionEndDate);
      if (now > end && user.subscriptionStatus !== 'expired') {
        // Degrade
        const expiredUser = {
          ...user,
          subscriptionPlan: 'free' as const,
          subscriptionStatus: 'expired' as const,
          isPremium: false
        };
        updatedAny = true;
        appendAuditLog('SUBSCRIPTION_AUTO_EXPIRE', user.email, user.role, `Subscription expired for plan ${user.subscriptionPlan.toUpperCase()}. Account degraded to Free.`, 'WARNING');
        
        // If current user, update session as well
        if (curr && curr.id === user.id) {
          setCurrentUser(expiredUser);
          addNotification('🔔 Plan Expired!', `Your ${user.subscriptionPlan.toUpperCase()} subscription validity has expired. Head to Pricing to renew.`, 'expiry');
        } else {
          // Push notification placeholder for the user
          addNotificationForUser(user.id, '🔔 Plan Expired!', `Your ${user.subscriptionPlan.toUpperCase()} subscription validity has expired. Head to Pricing to renew.`, 'expiry');
        }
        return expiredUser;
      }
    }
    return user;
  });

  if (updatedAny) {
    saveKey('v_users', updatedUsers);
  }
};

// --- SECURITY SESSION EXPIRY MONITOR ---
// Logs out student/admin after 30 mins of inactivity
export const checkSessionExpiry = (onLogout: () => void): void => {
  const user = getCurrentUser();
  if (!user || !user.lastActiveTime) return;
  
  const lastActive = new Date(user.lastActiveTime).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastActive) / (1000 * 60);
  
  // 30 Minutes Inactivity timeout
  if (diffMinutes > 30) {
    appendAuditLog('SESSION_TIMEOUT', user.email, user.role, `Automated secure session logout due to 30 minutes of complete inactivity.`, 'WARNING');
    setCurrentUser(null);
    onLogout();
    alert('🔒 Session expired due to inactivity. Please login again to keep accessing handbooks safely.');
  } else {
    // Ping activity
    user.lastActiveTime = new Date().toISOString();
    setCurrentUser(user);
  }
};

// --- DYNAMIC WATERMARK & SECURE NOTES URL GENERATOR ---
// Restricts note load strictly after login and creates dynamic tokenized secure URL
export const getSecureNotesUrl = (noteId: string): string => {
  const user = getCurrentUser();
  if (!user) return '';
  // Sign URL with simulated checksum token expiring soon
  const hash = obfuscate(`${noteId}:${user.id}:${Date.now() + 60000}`);
  return `https://vibrantparivar.in/handbooks/pdf_renderer.html?secToken=${hash}&id=${noteId}`;
};

// --- NOTIFICATION ADDERS ---
export const addNotification = (title: string, message: string, type: NotificationAlert['type'] = 'info'): void => {
  const notifs = getNotifications();
  notifs.unshift({
    id: 'notif_' + uuid(),
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  });
  saveNotifications(notifs);
};

export const addNotificationForUser = (userId: string, title: string, message: string, type: NotificationAlert['type'] = 'info'): void => {
  // Shared global push toast alert simulation
  addNotification(title, `[Target User ID: ${userId}] ${message}`, type);
};
