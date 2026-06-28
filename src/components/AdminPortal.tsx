import React, { useState, useEffect } from 'react';
import { loadSecureKey, saveSecureKey } from '../lib/security';
import { 
  UserProfile, 
  TestSeries, 
  FacultyMember, 
  OfflineBatch, 
  Testimonial, 
  AuditLog,
  Question,
  TestSection,
  StudyNote,
  Subject,
  Chapter,
  PaymentVerification,
  Notice,
  AppBanner
} from '../types';
import { 
  ShieldCheck, 
  PlusCircle, 
  Terminal, 
  Users, 
  BookOpen, 
  FileText, 
  Grid, 
  Settings, 
  Sliders, 
  AlertOctagon, 
  Save, 
  Trash2,
  Upload,
  Download,
  HelpCircle,
  Edit2,
  CheckCircle,
  XCircle,
  Award,
  Bell,
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  Receipt
} from 'lucide-react';
import { 
  appendAuditLog, 
  getSubjects, 
  saveSubjects, 
  getChapters, 
  saveChapters, 
  getPayments, 
  savePayments,
  getNotices,
  saveNotices,
  getBanners,
  saveBanners,
  addNotification
} from '../dataStore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

interface AdminPortalProps {
  user: UserProfile | null;
  tests: TestSeries[];
  onAddTest: (newTest: TestSeries) => void;
  onUpdateTests: (data: TestSeries[]) => void;
  faculty: FacultyMember[];
  onUpdateFaculty: (data: FacultyMember[]) => void;
  batches: OfflineBatch[];
  onUpdateBatches: (data: OfflineBatch[]) => void;
  testimonials: Testimonial[];
  onUpdateTestimonials: (data: Testimonial[]) => void;
  auditLogs: AuditLog[];
  notes: StudyNote[];
  onUpdateNotes: (data: StudyNote[]) => void;
}

type AdminTab = 
  | 'analytics' 
  | 'payments' 
  | 'subjects' 
  | 'notes' 
  | 'users' 
  | 'notices' 
  | 'banners' 
  | 'logs'
  | 'tests'
  | 'batches'
  | 'faculty'
  | 'testimonials';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  user,
  tests,
  onAddTest,
  onUpdateTests,
  faculty,
  onUpdateFaculty,
  batches,
  onUpdateBatches,
  testimonials,
  onUpdateTestimonials,
  auditLogs,
  notes,
  onUpdateNotes
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  
  // Database state sync
  const [subjects, setLocalSubjects] = useState<Subject[]>([]);
  const [chapters, setLocalChapters] = useState<Chapter[]>([]);
  const [payments, setLocalPayments] = useState<PaymentVerification[]>([]);
  const [notices, setLocalNotices] = useState<Notice[]>([]);
  const [banners, setLocalBanners] = useState<AppBanner[]>([]);
  const [users, setLocalUsers] = useState<UserProfile[]>([]);

  // Load auxiliary database lists
  useEffect(() => {
    setLocalSubjects(getSubjects());
    setLocalChapters(getChapters());
    setLocalPayments(getPayments());
    setLocalNotices(getNotices());
    setLocalBanners(getBanners());
    
    // Load registered users list
    const allUsers = loadSecureKey<UserProfile[]>('v_users', []);
    setLocalUsers(allUsers);
  }, [activeTab]);

  // CMS: Subject Builder states
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');

  // CMS: Chapter Builder states
  const [chapterSubjectId, setChapterSubjectId] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [chapterDesc, setChapterDesc] = useState('');

  // CMS: Note Upload states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState<'Mathematics' | 'Reasoning' | 'English' | 'General Knowledge'>('Mathematics');
  const [noteExam, setNoteExam] = useState('SSC CGL');
  const [noteIsPaid, setNoteIsPaid] = useState(true);
  const [noteSummary, setNoteSummary] = useState('');
  const [notePdf, setNotePdf] = useState('');
  const [noteSubjectId, setNoteSubjectId] = useState('');
  const [noteChapterId, setNoteChapterId] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // User Manager state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [userRoleEdit, setUserRoleEdit] = useState<UserProfile['role']>('student');
  const [userPlanEdit, setUserPlanEdit] = useState<UserProfile['subscriptionPlan']>('free');
  const [userStatusEdit, setUserStatusEdit] = useState<UserProfile['subscriptionStatus']>('active');
  const [extendDays, setExtendDays] = useState<number>(30);

  // Payment Rejection reason input
  const [rejectionId, setRejectionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Notice board states
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePinned, setNoticePinned] = useState(false);

  // Banner Manager states
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerLink, setBannerLink] = useState('');

  // CMS: Test Series states
  const [testTitle, setTestTitle] = useState('');
  const [testCategory, setTestCategory] = useState<TestSeries['examCategory']>('SSC CGL');
  const [testIsPaid, setTestIsPaid] = useState(false);
  const [testPrice, setTestPrice] = useState(199);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  // Sub-CMS: Questions state
  const [selectedTestForQuestions, setSelectedTestForQuestions] = useState<TestSeries | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionOptA, setQuestionOptA] = useState('');
  const [questionOptB, setQuestionOptB] = useState('');
  const [questionOptC, setQuestionOptC] = useState('');
  const [questionOptD, setQuestionOptD] = useState('');
  const [questionCorrectIndex, setQuestionCorrectIndex] = useState<number>(0);
  const [questionExplanation, setQuestionExplanation] = useState('');
  const [selectedSectionName, setSelectedSectionName] = useState('General Intelligence');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // CMS: Offline Batches states
  const [batchCourseName, setBatchCourseName] = useState('');
  const [batchStartDate, setBatchStartDate] = useState('');
  const [batchTimings, setBatchTimings] = useState('');
  const [batchDuration, setBatchDuration] = useState('');
  const [batchVenue, setBatchVenue] = useState('Nawalgarh Road Sikar');
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  // CMS: Faculty Member states
  const [facName, setFacName] = useState('');
  const [facDesignation, setFacDesignation] = useState('');
  const [facSubject, setFacSubject] = useState('');
  const [facExperience, setFacExperience] = useState('');
  const [facImageUrl, setFacImageUrl] = useState('');
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);

  // CMS: Testimonials states
  const [testiStudentName, setTestiStudentName] = useState('');
  const [testiSelection, setTestiSelection] = useState('');
  const [testiMessage, setTestiMessage] = useState('');
  const [testiRating, setTestiRating] = useState<number>(5);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);

  // Sync users to localStorage helper
  const syncUsersList = (updatedList: UserProfile[]) => {
    setLocalUsers(updatedList);
    saveSecureKey('v_users', updatedList);
  };

  // 1. ADD SUBJECT
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    const newSub: Subject = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      name: subjectName.trim(),
      description: subjectDesc.trim()
    };
    const updated = [...subjects, newSub];
    setLocalSubjects(updated);
    saveSubjects(updated);
    setSubjectName('');
    setSubjectDesc('');
    appendAuditLog('CMS_SUBJECT_ADDED', user!.email, user!.role, `Added Subject category: "${newSub.name}"`, 'INFO');
    addNotification('📚 New Subject Added', `Subject "${newSub.name}" is now online under academic chapters grid.`, 'info');
  };

  // 2. ADD CHAPTER
  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterSubjectId || !chapterName.trim()) {
      alert('Please select a parent subject and enter a chapter name!');
      return;
    }
    const newChap: Chapter = {
      id: 'ch_' + Math.random().toString(36).substring(2, 9),
      subjectId: chapterSubjectId,
      name: chapterName.trim(),
      description: chapterDesc.trim()
    };
    const updated = [...chapters, newChap];
    setLocalChapters(updated);
    saveChapters(updated);
    setChapterName('');
    setChapterDesc('');
    appendAuditLog('CMS_CHAPTER_ADDED', user!.email, user!.role, `Added Chapter worksheet: "${newChap.name}"`, 'INFO');
  };

  // 3. UPLOAD/EDIT NOTES
  const handleUploadNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteSummary.trim()) {
      alert('Please fill out note title and description summary!');
      return;
    }

    const notePdfUrl = notePdf.trim() || 'https://vibrantparivar.in/handbooks/pdf_renderer.html?id=demo';

    if (editingNoteId) {
      // Edit mode
      const updatedNotes = notes.map(n => n.id === editingNoteId ? {
        ...n,
        title: noteTitle.trim(),
        subject: noteSubject,
        examCategory: noteExam,
        isPaid: noteIsPaid,
        contentSummary: noteSummary.trim(),
        pdfUrl: notePdfUrl,
        subjectId: noteSubjectId || undefined,
        chapterId: noteChapterId || undefined
      } : n);
      onUpdateNotes(updatedNotes);
      appendAuditLog('CMS_NOTE_EDITED', user!.email, user!.role, `Edited protected note profile: "${noteTitle}"`, 'INFO');
      setEditingNoteId(null);
      alert('Note profile updated successfully!');
    } else {
      // Add mode
      const newNote: StudyNote = {
        id: 'n_' + Math.random().toString(36).substring(2, 9),
        title: noteTitle.trim(),
        subject: noteSubject,
        examCategory: noteExam,
        isPaid: noteIsPaid,
        contentSummary: noteSummary.trim(),
        pdfUrl: notePdfUrl,
        downloadCount: 0,
        subjectId: noteSubjectId || undefined,
        chapterId: noteChapterId || undefined
      };
      onUpdateNotes([...notes, newNote]);
      appendAuditLog('CMS_NOTE_UPLOADED', user!.email, user!.role, `Uploaded new watermarked study booklet: "${noteTitle}"`, 'INFO');
      addNotification('📥 New Note Released!', `Drill Handbook: "${noteTitle}" is now active for certified premium students.`, 'info');
      alert('New study booklet online!');
    }

    // Reset notes forms
    setNoteTitle('');
    setNoteExam('SSC CGL');
    setNoteIsPaid(true);
    setNoteSummary('');
    setNotePdf('');
    setNoteSubjectId('');
    setNoteChapterId('');
  };

  const handleEditNoteInit = (n: StudyNote) => {
    setEditingNoteId(n.id);
    setNoteTitle(n.title);
    setNoteSubject(n.subject);
    setNoteExam(n.examCategory);
    setNoteIsPaid(n.isPaid);
    setNoteSummary(n.contentSummary);
    setNotePdf(n.pdfUrl || '');
    setNoteSubjectId(n.subjectId || '');
    setNoteChapterId(n.chapterId || '');
    // Scroll to form
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteNote = (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this study note from the portal?')) return;
    const filtered = notes.filter(n => n.id !== id);
    onUpdateNotes(filtered);
    appendAuditLog('CMS_NOTE_DELETED', user!.email, user!.role, `Removed study note id: ${id} from digital catalog.`, 'WARNING');
  };

  // 4. VERIFY MANUAL PAYMENTS
  const handleApprovePayment = (pay: PaymentVerification) => {
    // 1. Update Payment status to approved
    const updatedPayments = payments.map(p => p.id === pay.id ? { ...p, status: 'approved' as const } : p);
    setLocalPayments(updatedPayments);
    savePayments(updatedPayments);

    // 2. Grant Premium and compute expiry end date for User profile
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + pay.validityDays);

    const updatedUsers = users.map(u => {
      if (u.id === pay.userId) {
        return {
          ...u,
          role: 'student' as const, // ensure role stays correct
          isPremium: true,
          subscriptionPlan: pay.plan,
          subscriptionStartDate: now.toISOString(),
          subscriptionEndDate: expiry.toISOString(),
          subscriptionStatus: 'active' as const
        };
      }
      return u;
    });
    syncUsersList(updatedUsers);

    // 3. Append security trail audit
    appendAuditLog('PAYMENT_VERIFIED_APPROVED', user!.email, user!.role, `Approved Txn: "${pay.transactionId}" of ${pay.userName}. Granted ${pay.plan.toUpperCase()} for ${pay.validityDays} days.`, 'INFO');
    
    // 4. Send toast notification
    addNotification('⚡ Payment Verified', `Payment of ${pay.userName} (Txn: ${pay.transactionId}) verified by Director Akhil Sir. Premium Pass Unlocked.`, 'success');
    alert(`🎉 Success! Approved and granted ${pay.plan.toUpperCase()} Pass (Expires: ${expiry.toLocaleDateString()}) for student ${pay.userName}.`);
  };

  const handleRejectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionId || !rejectionReason.trim()) return;

    const pay = payments.find(p => p.id === rejectionId);
    if (!pay) return;

    // Update payment status to rejected
    const updatedPayments = payments.map(p => p.id === pay.id ? { ...p, status: 'rejected' as const, rejectionReason: rejectionReason.trim() } : p);
    setLocalPayments(updatedPayments);
    savePayments(updatedPayments);

    // Set user profile back to active free status (clearing pending status)
    const updatedUsers = users.map(u => {
      if (u.id === pay.userId) {
        return {
          ...u,
          subscriptionStatus: 'active' as const // set status normal
        };
      }
      return u;
    });
    syncUsersList(updatedUsers);

    appendAuditLog('PAYMENT_VERIFIED_REJECTED', user!.email, user!.role, `Rejected Txn ID: "${pay.transactionId}" of ${pay.userName}. Reason: "${rejectionReason}"`, 'WARNING');
    addNotification('❌ Payment Rejected', `Transaction Reference "${pay.transactionId}" was rejected. Reason: ${rejectionReason}`, 'warning');

    setRejectionId(null);
    setRejectionReason('');
    alert('Payment transaction marked as REJECTED successfully.');
  };

  // 5. DIRECT USER MANAGEMENT
  const handleOpenUserEdit = (u: UserProfile) => {
    setSelectedUserForEdit(u);
    setUserRoleEdit(u.role);
    setUserPlanEdit(u.subscriptionPlan || 'free');
    setUserStatusEdit(u.subscriptionStatus || 'active');
  };

  const handleSaveUserDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    // Compute validity if changed
    let start = selectedUserForEdit.subscriptionStartDate;
    let end = selectedUserForEdit.subscriptionEndDate;

    if (userPlanEdit !== selectedUserForEdit.subscriptionPlan) {
      if (userPlanEdit === 'free') {
        start = null;
        end = null;
      } else {
        const now = new Date();
        const expiry = new Date();
        expiry.setDate(now.getDate() + extendDays);
        start = now.toISOString();
        end = expiry.toISOString();
      }
    }

    const updatedUsers = users.map(u => {
      if (u.id === selectedUserForEdit.id) {
        return {
          ...u,
          role: userRoleEdit,
          subscriptionPlan: userPlanEdit,
          subscriptionStatus: userStatusEdit,
          isPremium: userPlanEdit !== 'free' && userStatusEdit === 'active',
          subscriptionStartDate: start,
          subscriptionEndDate: end
        };
      }
      return u;
    });

    syncUsersList(updatedUsers);
    appendAuditLog('USER_DIRECT_MODIFIED', user!.email, user!.role, `Direct administrative edits applied on: ${selectedUserForEdit.email}. Role: ${userRoleEdit.toUpperCase()}, Plan: ${userPlanEdit.toUpperCase()}`, 'INFO');
    setSelectedUserForEdit(null);
    alert('User parameters adjusted successfully in central database.');
  };

  // 6. NOTICE BOARD MANAGEMENT
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    const newNotice: Notice = {
      id: 'not_' + Math.random().toString(36).substring(2, 9),
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      pinned: noticePinned,
      date: new Date().toISOString(),
      author: user!.name
    };

    const updated = [newNotice, ...notices];
    setLocalNotices(updated);
    saveNotices(updated);

    setNoticeTitle('');
    setNoticeContent('');
    setNoticePinned(false);

    appendAuditLog('CMS_NOTICE_POSTED', user!.email, user!.role, `Notice board alert posted: "${newNotice.title}"`, 'INFO');
    addNotification('🔔 Announcement: ' + newNotice.title, 'A critical study center notice has been pinned onto your dashboard feed.', 'info');
    alert('New announcement posted to notice board!');
  };

  const handleDeleteNotice = (id: string) => {
    if (!confirm('Are you sure you want to remove this notice?')) return;
    const filtered = notices.filter(n => n.id !== id);
    setLocalNotices(filtered);
    saveNotices(filtered);
    appendAuditLog('CMS_NOTICE_DELETED', user!.email, user!.role, `Removed notice id: ${id}`, 'WARNING');
  };

  // 7. BANNER MANAGEMENT
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerUrl.trim()) return;

    const newBanner: AppBanner = {
      id: 'ban_' + Math.random().toString(36).substring(2, 9),
      title: bannerTitle.trim(),
      imageUrl: bannerUrl.trim(),
      link: bannerLink.trim() || '#',
      active: true
    };

    const updated = [...banners, newBanner];
    setLocalBanners(updated);
    saveBanners(updated);

    setBannerTitle('');
    setBannerUrl('');
    setBannerLink('');

    appendAuditLog('CMS_BANNER_ADDED', user!.email, user!.role, `Added dynamic page promotion banner: "${newBanner.title}"`, 'INFO');
    alert('Promotional carousel banner uploaded!');
  };

  const handleToggleBannerActive = (id: string) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    setLocalBanners(updated);
    saveBanners(updated);
    appendAuditLog('CMS_BANNER_TOGGLED', user!.email, user!.role, `Toggled active status of banner id: ${id}`, 'INFO');
  };

  const handleDeleteBanner = (id: string) => {
    if (!confirm('Delete banner illustration?')) return;
    const filtered = banners.filter(b => b.id !== id);
    setLocalBanners(filtered);
    saveBanners(filtered);
    appendAuditLog('CMS_BANNER_DELETED', user!.email, user!.role, `Removed promotion banner: ${id}`, 'WARNING');
  };

  // =========================================================================
  // 9. TEST SERIES & QUESTIONS BUILDER CRUD HANDLERS
  // =========================================================================
  const handleCreateOrUpdateTestSeries = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;

    if (editingTestId) {
      // Update existing test parameters
      const updated = tests.map(t => {
        if (t.id === editingTestId) {
          return {
            ...t,
            title: testTitle.trim(),
            examCategory: testCategory,
            isPaid: testIsPaid,
            price: testIsPaid ? testPrice : 0
          };
        }
        return t;
      });
      onUpdateTests(updated);
      setEditingTestId(null);
      appendAuditLog('CMS_TEST_UPDATED', user!.email, user!.role, `Updated test series parameters: "${testTitle}"`, 'INFO');
    } else {
      // Create new TestSeries
      const defaultSections: TestSection[] = [
        { id: 'sec_gi', name: 'General Intelligence', durationMinutes: 15, questionsCount: 0 },
        { id: 'sec_ga', name: 'General Awareness', durationMinutes: 15, questionsCount: 0 },
        { id: 'sec_qa', name: 'Quantitative Aptitude', durationMinutes: 15, questionsCount: 0 },
        { id: 'sec_en', name: 'English Comprehension', durationMinutes: 15, questionsCount: 0 },
      ];
      const newTest: TestSeries = {
        id: 'test_' + Math.random().toString(36).substring(2, 9),
        title: testTitle.trim(),
        examCategory: testCategory,
        isPaid: testIsPaid,
        price: testIsPaid ? testPrice : 0,
        sections: defaultSections,
        totalMarks: 0,
        totalQuestions: 0,
        questions: [],
        enrolledCount: Math.floor(Math.random() * 120) + 30
      };
      onUpdateTests([newTest, ...tests]);
      appendAuditLog('CMS_TEST_CREATED', user!.email, user!.role, `Created new test series structure: "${newTest.title}"`, 'INFO');
      addNotification('📝 New Mock Exam: ' + newTest.title, `A new exam category ${newTest.examCategory} mock exam is now online. Enlist today!`, 'info');
    }

    setTestTitle('');
    setTestIsPaid(false);
    setTestPrice(199);
  };

  const handleStartEditTest = (t: TestSeries) => {
    setEditingTestId(t.id);
    setTestTitle(t.title);
    setTestCategory(t.examCategory);
    setTestIsPaid(t.isPaid);
    setTestPrice(t.price);
  };

  const handleDeleteTest = (id: string) => {
    if (!confirm('Are you sure you want to delete this test series entirely? This action is irreversible.')) return;
    const filtered = tests.filter(t => t.id !== id);
    onUpdateTests(filtered);
    appendAuditLog('CMS_TEST_DELETED', user!.email, user!.role, `Deleted test series ID: ${id}`, 'CRITICAL');
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestForQuestions) return;
    if (!questionText.trim() || !questionOptA.trim() || !questionOptB.trim()) {
      alert('Please fill out the question text and at least options A and B.');
      return;
    }

    const options = [questionOptA.trim(), questionOptB.trim(), questionOptC.trim() || 'N/A', questionOptD.trim() || 'N/A'];
    
    // Check sectionId helper
    let sectionId = 'sec_gi';
    if (selectedSectionName === 'General Intelligence') sectionId = 'sec_gi';
    else if (selectedSectionName === 'General Awareness') sectionId = 'sec_ga';
    else if (selectedSectionName === 'Quantitative Aptitude') sectionId = 'sec_qa';
    else if (selectedSectionName === 'English Comprehension') sectionId = 'sec_en';

    const newQuestion: Question = {
      id: editingQuestionId || ('q_' + Math.random().toString(36).substring(2, 9)),
      sectionId,
      questionText: questionText.trim(),
      options,
      correctAnswerIndex: questionCorrectIndex,
      explanation: questionExplanation.trim()
    };

    const updatedTests = tests.map(t => {
      if (t.id === selectedTestForQuestions.id) {
        let updatedQuestions = [...t.questions];
        if (editingQuestionId) {
          updatedQuestions = updatedQuestions.map(q => q.id === editingQuestionId ? newQuestion : q);
        } else {
          updatedQuestions.push(newQuestion);
        }

        // Recompute section question counts
        const updatedSections = t.sections.map(sec => {
          const count = updatedQuestions.filter(q => q.sectionId === sec.id).length;
          return { ...sec, questionsCount: count };
        });

        return {
          ...t,
          questions: updatedQuestions,
          totalQuestions: updatedQuestions.length,
          totalMarks: updatedQuestions.length * 2,
          sections: updatedSections
        };
      }
      return t;
    });

    onUpdateTests(updatedTests);

    // Refresh active test series questions preview
    const refreshedTest = updatedTests.find(t => t.id === selectedTestForQuestions.id);
    if (refreshedTest) {
      setSelectedTestForQuestions(refreshedTest);
    }

    // Reset fields
    setQuestionText('');
    setQuestionOptA('');
    setQuestionOptB('');
    setQuestionOptC('');
    setQuestionOptD('');
    setQuestionCorrectIndex(0);
    setQuestionExplanation('');
    setEditingQuestionId(null);

    appendAuditLog(
      editingQuestionId ? 'CMS_QUESTION_UPDATED' : 'CMS_QUESTION_CREATED',
      user!.email,
      user!.role,
      `Saved question to test series: "${selectedTestForQuestions.title}"`,
      'INFO'
    );
  };

  const handleStartEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.questionText);
    setQuestionOptA(q.options[0] || '');
    setQuestionOptB(q.options[1] || '');
    setQuestionOptC(q.options[2] || '');
    setQuestionOptD(q.options[3] || '');
    setQuestionCorrectIndex(q.correctAnswerIndex);
    setQuestionExplanation(q.explanation || '');
    
    // Map section id to name
    if (q.sectionId === 'sec_gi') setSelectedSectionName('General Intelligence');
    else if (q.sectionId === 'sec_ga') setSelectedSectionName('General Awareness');
    else if (q.sectionId === 'sec_qa') setSelectedSectionName('Quantitative Aptitude');
    else if (q.sectionId === 'sec_en') setSelectedSectionName('English Comprehension');
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!selectedTestForQuestions) return;
    if (!confirm('Are you sure you want to delete this question?')) return;

    const updatedTests = tests.map(t => {
      if (t.id === selectedTestForQuestions.id) {
        const updatedQuestions = t.questions.filter(q => q.id !== qId);
        
        const updatedSections = t.sections.map(sec => {
          const count = updatedQuestions.filter(q => q.sectionId === sec.id).length;
          return { ...sec, questionsCount: count };
        });

        return {
          ...t,
          questions: updatedQuestions,
          totalQuestions: updatedQuestions.length,
          totalMarks: updatedQuestions.length * 2,
          sections: updatedSections
        };
      }
      return t;
    });

    onUpdateTests(updatedTests);

    const refreshedTest = updatedTests.find(t => t.id === selectedTestForQuestions.id);
    if (refreshedTest) {
      setSelectedTestForQuestions(refreshedTest);
    }

    appendAuditLog('CMS_QUESTION_DELETED', user!.email, user!.role, `Deleted question ID ${qId} from test series`, 'WARNING');
  };

  // =========================================================================
  // 10. OFFLINE BATCHES CMS CRUD HANDLERS
  // =========================================================================
  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCourseName.trim() || !batchStartDate.trim() || !batchTimings.trim()) return;

    if (editingBatchId) {
      const updated = batches.map(b => {
        if (b.id === editingBatchId) {
          return {
            ...b,
            courseName: batchCourseName.trim(),
            startDate: batchStartDate.trim(),
            timings: batchTimings.trim(),
            duration: batchDuration.trim() || '6 Months',
            venue: batchVenue.trim()
          };
        }
        return b;
      });
      onUpdateBatches(updated);
      setEditingBatchId(null);
      appendAuditLog('CMS_BATCH_UPDATED', user!.email, user!.role, `Updated offline batch: "${batchCourseName}"`, 'INFO');
    } else {
      const newBatch: OfflineBatch = {
        id: 'bat_' + Math.random().toString(36).substring(2, 9),
        courseName: batchCourseName.trim(),
        startDate: batchStartDate.trim(),
        timings: batchTimings.trim(),
        duration: batchDuration.trim() || '6 Months',
        venue: batchVenue.trim()
      };
      onUpdateBatches([newBatch, ...batches]);
      appendAuditLog('CMS_BATCH_CREATED', user!.email, user!.role, `Created new offline batch: "${newBatch.courseName}"`, 'INFO');
      addNotification('🏫 New Offline Batch Sikar: ' + newBatch.courseName, `Registrations are open for offline batch starting ${newBatch.startDate}. Venue: ${newBatch.venue}`, 'info');
    }

    setBatchCourseName('');
    setBatchStartDate('');
    setBatchTimings('');
    setBatchDuration('');
  };

  const handleStartEditBatch = (b: OfflineBatch) => {
    setEditingBatchId(b.id);
    setBatchCourseName(b.courseName);
    setBatchStartDate(b.startDate);
    setBatchTimings(b.timings);
    setBatchDuration(b.duration);
    setBatchVenue(b.venue);
  };

  const handleDeleteBatch = (id: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    const filtered = batches.filter(b => b.id !== id);
    onUpdateBatches(filtered);
    appendAuditLog('CMS_BATCH_DELETED', user!.email, user!.role, `Deleted batch ID: ${id}`, 'WARNING');
  };

  // =========================================================================
  // 11. FACULTY CMS CRUD HANDLERS
  // =========================================================================
  const handleSaveFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName.trim() || !facDesignation.trim() || !facSubject.trim()) return;

    const imgUrl = facImageUrl.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop';

    if (editingFacultyId) {
      const updated = faculty.map(f => {
        if (f.id === editingFacultyId) {
          return {
            ...f,
            name: facName.trim(),
            designation: facDesignation.trim(),
            subject: facSubject.trim(),
            experience: facExperience.trim() || '10+ Years',
            imageUrl: imgUrl
          };
        }
        return f;
      });
      onUpdateFaculty(updated);
      setEditingFacultyId(null);
      appendAuditLog('CMS_FACULTY_UPDATED', user!.email, user!.role, `Updated faculty profile: "${facName}"`, 'INFO');
    } else {
      const newFac: FacultyMember = {
        id: 'fac_' + Math.random().toString(36).substring(2, 9),
        name: facName.trim(),
        designation: facDesignation.trim(),
        subject: facSubject.trim(),
        experience: facExperience.trim() || '10+ Years',
        imageUrl: imgUrl
      };
      onUpdateFaculty([newFac, ...faculty]);
      appendAuditLog('CMS_FACULTY_CREATED', user!.email, user!.role, `Added faculty profile: "${newFac.name}"`, 'INFO');
    }

    setFacName('');
    setFacDesignation('');
    setFacSubject('');
    setFacExperience('');
    setFacImageUrl('');
  };

  const handleStartEditFaculty = (f: FacultyMember) => {
    setEditingFacultyId(f.id);
    setFacName(f.name);
    setFacDesignation(f.designation);
    setFacSubject(f.subject);
    setFacExperience(f.experience);
    setFacImageUrl(f.imageUrl || '');
  };

  const handleDeleteFaculty = (id: string) => {
    if (!confirm('Delete faculty member profile?')) return;
    const filtered = faculty.filter(f => f.id !== id);
    onUpdateFaculty(filtered);
    appendAuditLog('CMS_FACULTY_DELETED', user!.email, user!.role, `Deleted faculty profile ID: ${id}`, 'WARNING');
  };

  // =========================================================================
  // 12. TESTIMONIALS CMS CRUD HANDLERS
  // =========================================================================
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testiStudentName.trim() || !testiSelection.trim() || !testiMessage.trim()) return;

    if (editingTestimonialId) {
      const updated = testimonials.map(t => {
        if (t.id === editingTestimonialId) {
          return {
            ...t,
            studentName: testiStudentName.trim(),
            selection: testiSelection.trim(),
            message: testiMessage.trim(),
            rating: testiRating
          };
        }
        return t;
      });
      onUpdateTestimonials(updated);
      setEditingTestimonialId(null);
      appendAuditLog('CMS_TESTIMONIAL_UPDATED', user!.email, user!.role, `Updated testimonial: "${testiStudentName}"`, 'INFO');
    } else {
      const newTesti: Testimonial = {
        id: 'tst_' + Math.random().toString(36).substring(2, 9),
        studentName: testiStudentName.trim(),
        selection: testiSelection.trim(),
        message: testiMessage.trim(),
        rating: testiRating
      };
      onUpdateTestimonials([newTesti, ...testimonials]);
      appendAuditLog('CMS_TESTIMONIAL_CREATED', user!.email, user!.role, `Created success story: "${newTesti.studentName}"`, 'INFO');
    }

    setTestiStudentName('');
    setTestiSelection('');
    setTestiMessage('');
    setTestiRating(5);
  };

  const handleStartEditTestimonial = (t: Testimonial) => {
    setEditingTestimonialId(t.id);
    setTestiStudentName(t.studentName);
    setTestiSelection(t.selection);
    setTestiMessage(t.message);
    setTestiRating(t.rating);
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!confirm('Delete success story testimonial?')) return;
    const filtered = testimonials.filter(t => t.id !== id);
    onUpdateTestimonials(filtered);
    appendAuditLog('CMS_TESTIMONIAL_DELETED', user!.email, user!.role, `Deleted testimonial ID: ${id}`, 'WARNING');
  };

  // ANALYTICS SPLITS PRE-PROCESSING
  const totalStudentsCount = users.filter(u => u.role === 'student').length;
  const activeSubsCount = users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'free' && u.subscriptionStatus === 'active').length;
  const pendingPaysCount = payments.filter(p => p.status === 'pending').length;
  
  const planData = [
    { name: 'Platinum', value: users.filter(u => u.subscriptionPlan === 'platinum').length, fill: '#F59E0B' },
    { name: 'Gold', value: users.filter(u => u.subscriptionPlan === 'gold').length, fill: '#06B6D4' },
    { name: 'Silver', value: users.filter(u => u.subscriptionPlan === 'silver').length, fill: '#6B7280' },
    { name: 'Free Tier', value: users.filter(u => u.subscriptionPlan === 'free' || !u.subscriptionPlan).length, fill: '#4B5563' }
  ];

  const totalRevenues = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const mockPerformances = [
    { exam: 'SSC CGL', avgScore: 148, topScore: 196, students: 480 },
    { exam: 'Delhi Police SI', avgScore: 36, topScore: 48, students: 290 },
    { exam: 'CET State Special', avgScore: 34, topScore: 46, students: 150 }
  ];

  return (
    <div className="w-full min-h-screen py-6 px-6 bg-[#0B1220] text-xs text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Title bar */}
        <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#991B1B] text-white flex items-center justify-center font-bold shadow animate-pulse">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1 uppercase tracking-wider">
                Sikar Administration Desk
              </h3>
              <p className="text-[10px] text-[#06B6D4] font-mono">VIBRANT DIGITAL PORTAL CORE VM ENGINE</p>
            </div>
          </div>
          
          {/* Quick Stats overview */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#94A3B8]">
            <div className="bg-[#0B1220] border border-[rgba(255,255,255,0.04)] px-3 py-1 rounded-[12px]">
              <span>Verified Students: </span>
              <strong className="text-white">{totalStudentsCount}</strong>
            </div>
            <div className="bg-[#0B1220] border border-[rgba(255,255,255,0.04)] px-3 py-1 rounded-[12px]">
              <span>Active Premium: </span>
              <strong className="text-emerald-400">{activeSubsCount}</strong>
            </div>
            <div className="bg-[#0B1220] border border-[rgba(255,255,255,0.04)] px-3 py-1 rounded-[12px]">
              <span>Manual Revenue: </span>
              <strong className="text-cyan-400">₹{totalRevenues}</strong>
            </div>
          </div>
        </div>

        {/* Sub Navigation Admin Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-[#111827] border border-[rgba(255,255,255,0.08)] p-2 rounded-[20px] shadow-inner overflow-x-auto whitespace-nowrap">
          {[
            { id: 'analytics', label: 'Dashboard Stats', icon: LayoutDashboard },
            { id: 'payments', label: `Verifications (${pendingPaysCount})`, icon: Receipt },
            { id: 'tests', label: 'Mock Exams Builder', icon: BookOpen },
            { id: 'subjects', label: 'Subjects & Chapters', icon: Grid },
            { id: 'notes', label: 'Upload Notes', icon: FileText },
            { id: 'users', label: 'User Registry', icon: Users },
            { id: 'batches', label: 'Offline Batches', icon: Calendar },
            { id: 'faculty', label: 'Faculty CMS', icon: Users },
            { id: 'testimonials', label: 'Success Stories', icon: Award },
            { id: 'notices', label: 'Notice Board', icon: Bell },
            { id: 'banners', label: 'Banners Carousel', icon: ImageIcon },
            { id: 'logs', label: 'Compliance Audit Logs', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-[14px] text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shadow'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD STATS (RECHARTS INTEGRATION) */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Main Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-4.5 space-y-2 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Portal Registrations</span>
                <div className="text-xl font-black text-white">{users.length} Registered</div>
                <p className="text-[10px] text-[#94A3B8]">Includes Students, Instructors, and System Administrators.</p>
              </div>
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-4.5 space-y-2 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-[#A78BFA]">Active Licences</span>
                <div className="text-xl font-black text-[#A78BFA]">{activeSubsCount} Students</div>
                <p className="text-[10px] text-[#94A3B8]">Paid subscription validities actively unlocking premium files.</p>
              </div>
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-4.5 space-y-2 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-[#06B6D4]">Total Collections</span>
                <div className="text-xl font-black text-[#06B6D4]">₹{totalRevenues} INR</div>
                <p className="text-[10px] text-[#94A3B8]">Direct verified UPI & Bank Transfer receipts cleared by HOD desk.</p>
              </div>
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-4.5 space-y-2 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-amber-400">Security Health</span>
                <div className="text-xl font-black text-amber-400">DRM Active</div>
                <p className="text-[10px] text-[#94A3B8]">No print protocols, anti-screenshot blocks, watermark rendering active.</p>
              </div>
            </div>

            {/* Graphs Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Pie chart representing plans distribution */}
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wide text-white">Student Membership Splits</h4>
                
                <div className="h-56 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {planData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px', color: '#F8FAFC' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend list on the side */}
                  <div className="absolute right-4 bottom-4 text-[10px] space-y-1 bg-[#0B1220] p-2.5 rounded-[12px] border border-[rgba(255,255,255,0.04)]">
                    {planData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: d.fill }} />
                        <span className="text-zinc-400 font-bold">{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar charts for average test scores */}
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wide text-white">Average Exam Performance Trends (TCS Models)</h4>
                
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockPerformances}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="exam" stroke="#94A3B8" fontSize={10} />
                      <YAxis stroke="#94A3B8" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px' }}
                      />
                      <Bar dataKey="avgScore" name="Average Score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="topScore" name="Top score" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MANUAL TRANSACTION VERIFICATION SYSTEM */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-5">
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4.5 h-4.5 text-cyan-400" />
                Manual Payment Auditing Desk
              </h4>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                When a student registers transaction reference codes during UPI/Card scan pricing checks, their files queue here. 
                Verify with Sikar SBI or HDFC corporate ledgers first, then approve or reject with correct notes.
              </p>
            </div>

            {/* Verification Queue list */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B1220] border-b border-[rgba(255,255,255,0.08)] text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                      <th className="p-3">Student Name / Email</th>
                      <th className="p-3">Plan / Validity</th>
                      <th className="p-3">Pay Amount</th>
                      <th className="p-3">Txn Reference ID</th>
                      <th className="p-3">Submit Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Settlement Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#0B1220]/40 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-white text-xs">{p.userName}</div>
                          <div className="text-[10px] text-[#94A3B8]">{p.userEmail}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-[12px] bg-zinc-800 text-cyan-300 font-extrabold uppercase text-[9px]">
                            {p.plan.toUpperCase()} PASS
                          </span>
                          <span className="text-[10px] text-[#94A3B8] ml-2 font-mono">{p.validityDays} Days</span>
                        </td>
                        <td className="p-3 font-bold text-white font-mono">₹{p.amount}</td>
                        <td className="p-3 font-mono font-bold text-indigo-400 select-all">{p.transactionId}</td>
                        <td className="p-3 text-zinc-400 font-mono text-[10px]">{new Date(p.date).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            p.status === 'approved' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' :
                            p.status === 'rejected' ? 'bg-red-950/20 text-red-400 border border-red-900/30' :
                            'bg-amber-950/20 text-amber-400 border border-amber-900/30 animate-pulse'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {p.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApprovePayment(p)}
                                className="px-2.5 py-1 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1 transition-all"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => setRejectionId(p.id)}
                                className="px-2.5 py-1 rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1 transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-mono italic">
                              {p.status === 'approved' ? 'Settled ✔' : `Rejected ✖: "${p.rejectionReason}"`}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-zinc-500 italic">
                          No transaction submissions registered on Sikar Portal yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rejection Reason Form Dialog Overlay */}
            {rejectionId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <form 
                  onSubmit={handleRejectPayment}
                  className="bg-[#111827] border border-red-900/30 rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-2xl text-xs text-[#F8FAFC]"
                >
                  <h4 className="font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertOctagon className="w-4.5 h-4.5" />
                    Specify Rejection Reason
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    The student will be notified of this rejection message immediately on their dashboard.
                  </p>
                  
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g., Wrong transaction ID, UPI transfer of incorrect amount..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] outline-none text-[#F8FAFC] focus:border-red-500 placeholder-zinc-600 text-xs"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectionId(null);
                        setRejectionReason('');
                      }}
                      className="flex-1 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-zinc-400 hover:text-white rounded-[12px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-[12px] font-bold cursor-pointer"
                    >
                      Reject Txn Code
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SUBJECTS & CHAPTERS CMS */}
        {/* ========================================================================= */}
        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Subject Panel */}
            <div className="space-y-4">
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="w-4.5 h-4.5 text-cyan-400" />
                  Add Subject Category
                </h4>
                
                <form onSubmit={handleAddSubject} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Subject Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mathematics, Reasoning, English"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Short Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Advanced Mathematics and PYQs tricks"
                      value={subjectDesc}
                      onChange={(e) => setSubjectDesc(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:shadow-md text-white font-bold rounded-[12px] cursor-pointer uppercase tracking-wider text-[10px]"
                  >
                    Add New Subject Category
                  </button>
                </form>
              </div>

              {/* Subject List */}
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-xs uppercase text-white tracking-wider">Active Subjects List</h4>
                <div className="space-y-2">
                  {subjects.map(s => (
                    <div key={s.id} className="bg-[#0B1220] p-3 rounded-[12px] border border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                      <div>
                        <div className="font-extrabold text-white text-xs">{s.name}</div>
                        <div className="text-[10px] text-[#94A3B8]">{s.description || 'No description added.'}</div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-[#06B6D4] bg-[#111827] px-2 py-0.5 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                        ID: {s.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chapters Panel */}
            <div className="space-y-4">
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="w-4.5 h-4.5 text-purple-400" />
                  Add Chapter Worksheet
                </h4>
                
                <form onSubmit={handleAddChapter} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Parent Subject *</label>
                    <select
                      required
                      value={chapterSubjectId}
                      onChange={(e) => setChapterSubjectId(e.target.value)}
                      className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                    >
                      <option value="">-- Choose Subject Category --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Chapter Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Algebra tricks, Subject-Verb Agreement"
                      value={chapterName}
                      onChange={(e) => setChapterName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Description Summary</label>
                    <input
                      type="text"
                      placeholder="e.g., Short tricks, formulas, and 50 repetitive practice questions"
                      value={chapterDesc}
                      onChange={(e) => setChapterDesc(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-md text-white font-bold rounded-[12px] cursor-pointer uppercase tracking-wider text-[10px]"
                  >
                    Add Chapter Segment
                  </button>
                </form>
              </div>

              {/* Chapters List */}
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-xs uppercase text-white tracking-wider">Active Chapters List</h4>
                <div className="space-y-2 overflow-y-auto max-h-[350px]">
                  {chapters.map(c => {
                    const sub = subjects.find(s => s.id === c.subjectId);
                    return (
                      <div key={c.id} className="bg-[#0B1220] p-3 rounded-[12px] border border-[rgba(255,255,255,0.04)] flex justify-between items-center">
                        <div>
                          <div className="font-extrabold text-white text-xs">{c.name}</div>
                          <div className="text-[10px] text-[#94A3B8]">
                            Subject: <strong className="text-cyan-400">{sub ? sub.name : 'Unknown'}</strong> | {c.description || 'No description added.'}
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[#A78BFA] bg-[#111827] px-2 py-0.5 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                          ID: {c.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: STUDY NOTES CMS (UPLOAD / EDIT / DELETE) */}
        {/* ========================================================================= */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            
            {/* Form */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 shadow-sm space-y-4">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.06)] pb-2.5">
                <Upload className="w-4.5 h-4.5 text-[#3B82F6]" />
                {editingNoteId ? 'Edit Protected Handbook Study Note' : 'Upload New Protected Handbook Study Note'}
              </h4>

              <form onSubmit={handleUploadNote} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Note Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Algebra Ultimate Formula Tricks Book"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Broad Subject Area *</label>
                  <select
                    required
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value as any)}
                    className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="English">English</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Target Exam Category</label>
                  <input
                    type="text"
                    placeholder="e.g., SSC CGL, CHSL, Delhi Police SI"
                    value={noteExam}
                    onChange={(e) => setNoteExam(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">DRM Lock Access Status *</label>
                  <select
                    required
                    value={noteIsPaid ? 'paid' : 'free'}
                    onChange={(e) => setNoteIsPaid(e.target.value === 'paid')}
                    className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  >
                    <option value="paid">🔒 Premium Only (Requires Subscription)</option>
                    <option value="free">🔓 Free for All Students</option>
                  </select>
                </div>

                {/* Sub-Subject and Sub-Chapter dropdown ties */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Academic Subject Category Connection</label>
                  <select
                    value={noteSubjectId}
                    onChange={(e) => setNoteSubjectId(e.target.value)}
                    className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  >
                    <option value="">-- No Direct Link --</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Chapter Worksheet Connection</label>
                  <select
                    value={noteChapterId}
                    onChange={(e) => setNoteChapterId(e.target.value)}
                    className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  >
                    <option value="">-- No Direct Link --</option>
                    {chapters.filter(c => !noteSubjectId || c.subjectId === noteSubjectId).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Note Source URL (PDF / Reader Link)</label>
                  <input
                    type="text"
                    placeholder="https://vibrantparivar.in/handbooks/pdf_file.pdf (leave blank for default simulator content)"
                    value={notePdf}
                    onChange={(e) => setNotePdf(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Syllabus Overview Summary *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter detailed summary text mapping formulas, chapters covered, and previous year repetition indexes."
                    value={noteSummary}
                    onChange={(e) => setNoteSummary(e.target.value)}
                    className="w-full p-2.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  {editingNoteId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(null);
                        setNoteTitle('');
                        setNoteSummary('');
                        setNotePdf('');
                      }}
                      className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-[12px] font-bold cursor-pointer text-[10px] uppercase"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] text-white rounded-[12px] font-bold cursor-pointer text-[10px] uppercase tracking-wider"
                  >
                    <span className="flex items-center gap-1.5">
                      <Save className="w-4.5 h-4.5" />
                      {editingNoteId ? 'Save Edits' : 'Publish Study Handbook'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Catalog Grid */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Active Study Handbook Library Catalog ({notes.length} Files)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(n => (
                  <div key={n.id} className="bg-[#0B1220] p-4 rounded-[16px] border border-[rgba(255,255,255,0.04)] flex flex-col justify-between h-40">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[8.5px] bg-[#111827] text-cyan-400 font-extrabold uppercase px-1.5 py-0.5 rounded-[8px] border border-[rgba(255,255,255,0.08)]">
                          {n.subject}
                        </span>
                        <span className={`text-[8.5px] font-black uppercase ${n.isPremium || n.isPaid ? 'text-purple-400' : 'text-blue-400'}`}>
                          {n.isPremium || n.isPaid ? '🔒 Premium' : '🔓 Free'}
                        </span>
                      </div>
                      
                      <h5 className="font-extrabold text-white text-xs truncate leading-snug">{n.title}</h5>
                      <p className="text-[10px] text-[#94A3B8] line-clamp-2 mt-1">{n.contentSummary}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.04)] pt-2 mt-2 text-[9px] text-zinc-500">
                      <span>Ref ID: {n.id}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditNoteInit(n)}
                          className="p-1 hover:bg-[#111827] text-[#3B82F6] hover:text-white rounded transition-colors cursor-pointer"
                          title="Edit Note Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="p-1 hover:bg-[#111827] text-red-400 hover:text-white rounded transition-colors cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: MOCK EXAMS BUILDER & QUESTIONS MANAGER */}
        {/* ========================================================================= */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            {!selectedTestForQuestions ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Test Series Creator Form */}
                <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4 h-fit">
                  <h4 className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                    <PlusCircle className="w-4.5 h-4.5 text-cyan-400" />
                    {editingTestId ? 'Modify Test Parameters' : 'Establish New Mock Exam'}
                  </h4>

                  <form onSubmit={handleCreateOrUpdateTestSeries} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Mock Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CGL Tier-1 Super Mock 01"
                        value={testTitle}
                        onChange={(e) => setTestTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Exam Category *</label>
                      <select
                        value={testCategory}
                        onChange={(e) => setTestCategory(e.target.value as any)}
                        className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                      >
                        <option value="SSC CGL">SSC CGL</option>
                        <option value="SSC CHSL">SSC CHSL</option>
                        <option value="SSC MTS">SSC MTS</option>
                        <option value="Delhi Police">Delhi Police</option>
                        <option value="State Exams">State Exams</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="test_is_paid"
                        checked={testIsPaid}
                        onChange={(e) => setTestIsPaid(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-800 bg-[#0B1220] cursor-pointer"
                      />
                      <label htmlFor="test_is_paid" className="text-[10px] text-[#94A3B8] uppercase font-bold cursor-pointer">
                        Premium Subscription Locked
                      </label>
                    </div>

                    {testIsPaid && (
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Mock Value Price (INR) *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          placeholder="199"
                          value={testPrice}
                          onChange={(e) => setTestPrice(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      {editingTestId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTestId(null);
                            setTestTitle('');
                            setTestIsPaid(false);
                          }}
                          className="flex-1 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-zinc-400 rounded-[12px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white rounded-[12px] font-bold cursor-pointer text-center uppercase"
                      >
                        {editingTestId ? 'Save Changes' : 'Generate Series'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Exam Catalog grid */}
                <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4 lg:col-span-2">
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">Active Simulated Exams ({tests.length})</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tests.map(t => (
                      <div key={t.id} className="bg-[#0B1220] p-4.5 rounded-[20px] border border-[rgba(255,255,255,0.04)] flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[8.5px] bg-[#111827] text-[#06B6D4] font-extrabold uppercase px-2 py-0.5 rounded-[8px] border border-[rgba(255,255,255,0.08)]">
                              {t.examCategory}
                            </span>
                            <span className={`text-[8.5px] font-black uppercase ${t.isPaid ? 'text-purple-400' : 'text-emerald-400'}`}>
                              {t.isPaid ? `🔒 Premium (₹${t.price})` : '🔓 Open Free'}
                            </span>
                          </div>

                          <h5 className="font-black text-white text-xs leading-snug">{t.title}</h5>
                          
                          {/* Details */}
                          <div className="grid grid-cols-2 gap-2 mt-2.5 text-[10px] text-zinc-400 border-t border-[rgba(255,255,255,0.03)] pt-2 font-mono">
                            <div>Questions: <strong className="text-white">{t.totalQuestions}</strong></div>
                            <div>Marks: <strong className="text-white">{t.totalMarks}</strong></div>
                            <div>Enrolled: <strong className="text-zinc-300">{t.enrolledCount} Students</strong></div>
                            <div>Sections: <strong className="text-zinc-300">4 Core</strong></div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t border-[rgba(255,255,255,0.03)] pt-2.5">
                          <button
                            onClick={() => setSelectedTestForQuestions(t)}
                            className="flex-1 py-1 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-800/30 text-[#06B6D4] hover:text-white rounded-[10px] text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors text-center"
                          >
                            📝 Build Questions
                          </button>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEditTest(t)}
                              className="p-1.5 bg-slate-900 border border-zinc-800 text-amber-400 hover:text-white rounded-[8px] cursor-pointer"
                              title="Edit Parameters"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTest(t.id)}
                              className="p-1.5 bg-slate-900 border border-zinc-800 text-red-400 hover:text-white rounded-[8px] cursor-pointer"
                              title="Delete Test Series"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              // Question Builder Overlay Sub-view
              <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4 gap-3">
                  <div>
                    <button
                      onClick={() => {
                        setSelectedTestForQuestions(null);
                        setEditingQuestionId(null);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 text-[10px] uppercase font-bold tracking-wider mb-1 block"
                    >
                      ← Return to Mock Exam Builder
                    </button>
                    <h3 className="font-extrabold text-white text-sm">
                      Question & Section Builder: <span className="text-indigo-400">{selectedTestForQuestions.title}</span>
                    </h3>
                  </div>

                  <span className="text-[10px] font-mono bg-[#0B1220] px-3 py-1 border border-zinc-800 text-zinc-400 rounded-full">
                    Total Questions inside: <strong className="text-white font-bold">{selectedTestForQuestions.questions.length}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Form to Add Question */}
                  <div className="lg:col-span-2 bg-[#0B1220] p-4.5 rounded-[20px] border border-[rgba(255,255,255,0.04)] space-y-4 h-fit">
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                      {editingQuestionId ? 'Modify Question Parameters' : 'Append New Simulated Question'}
                    </h4>

                    <form onSubmit={handleSaveQuestion} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Target Test Section *</label>
                        <select
                          value={selectedSectionName}
                          onChange={(e) => setSelectedSectionName(e.target.value)}
                          className="w-full p-2 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                        >
                          <option value="General Intelligence">General Intelligence (Reasoning)</option>
                          <option value="General Awareness">General Awareness (GK)</option>
                          <option value="Quantitative Aptitude">Quantitative Aptitude (Mathematics)</option>
                          <option value="English Comprehension">English Comprehension (English)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Question Text *</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="e.g. Find the missing term in: 12, 23, 34, 45, ?"
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          className="w-full p-2 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Options List *</label>
                        <div className="grid grid-cols-1 gap-1.5">
                          <input
                            type="text"
                            required
                            placeholder="Option A"
                            value={questionOptA}
                            onChange={(e) => setQuestionOptA(e.target.value)}
                            className="w-full px-2 py-1 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Option B"
                            value={questionOptB}
                            onChange={(e) => setQuestionOptB(e.target.value)}
                            className="w-full px-2 py-1 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Option C (Optional)"
                            value={questionOptC}
                            onChange={(e) => setQuestionOptC(e.target.value)}
                            className="w-full px-2 py-1 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Option D (Optional)"
                            value={questionOptD}
                            onChange={(e) => setQuestionOptD(e.target.value)}
                            className="w-full px-2 py-1 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Correct Answer Index *</label>
                        <select
                          value={questionCorrectIndex}
                          onChange={(e) => setQuestionCorrectIndex(Number(e.target.value))}
                          className="w-full p-2 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Explanation (optional)</label>
                        <textarea
                          rows={2}
                          placeholder="Provide descriptive solution for review screen..."
                          value={questionExplanation}
                          onChange={(e) => setQuestionExplanation(e.target.value)}
                          className="w-full p-2 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        {editingQuestionId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestionId(null);
                              setQuestionText('');
                              setQuestionOptA('');
                              setQuestionOptB('');
                              setQuestionOptC('');
                              setQuestionOptD('');
                              setQuestionExplanation('');
                            }}
                            className="flex-1 py-1.5 bg-[#111827] border border-[rgba(255,255,255,0.08)] text-zinc-400 rounded-[12px] font-bold cursor-pointer"
                          >
                            Cancel Edit
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[12px] font-bold cursor-pointer text-center uppercase"
                        >
                          {editingQuestionId ? 'Update Question' : 'Append Question'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* List of existing questions inside this mock series */}
                  <div className="lg:col-span-3 space-y-4">
                    <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Simulated Questions Pool ({selectedTestForQuestions.questions.length})</h4>
                    
                    <div className="space-y-3 overflow-y-auto max-h-[550px] pr-1">
                      {selectedTestForQuestions.questions.map((q, idx) => {
                        let secName = 'Reasoning';
                        if (q.sectionId === 'sec_ga') secName = 'GK/GS';
                        if (q.sectionId === 'sec_qa') secName = 'Quant Maths';
                        if (q.sectionId === 'sec_en') secName = 'English';
                        return (
                          <div key={q.id} className="bg-[#0B1220] p-4 rounded-[16px] border border-[rgba(255,255,255,0.04)] space-y-2 relative">
                            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.03)] pb-2 mb-1">
                              <span className="text-[8px] bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded-full font-bold uppercase">
                                Q{idx + 1} | {secName}
                              </span>
                              
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleStartEditQuestion(q)}
                                  className="text-[10px] text-amber-400 hover:text-white transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="text-[10px] text-red-400 hover:text-white transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <p className="text-white text-[11.5px] font-semibold">{q.questionText}</p>

                            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                              {q.options.map((opt, oIdx) => (
                                <div 
                                  key={oIdx} 
                                  className={`p-1.5 px-2.5 rounded-[8px] border ${
                                    oIdx === q.correctAnswerIndex 
                                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-bold' 
                                      : 'bg-[#111827]/40 border-[rgba(255,255,255,0.03)] text-zinc-400'
                                  }`}
                                >
                                  {['A','B','C','D'][oIdx]}. {opt}
                                </div>
                              ))}
                            </div>

                            {q.explanation && (
                              <div className="bg-[#111827]/60 p-2.5 rounded-lg border border-slate-800/40 mt-2 text-[10px] text-zinc-400 italic">
                                <strong>Explanation:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {selectedTestForQuestions.questions.length === 0 && (
                        <div className="text-center py-16 text-zinc-500 italic bg-[#0B1220] rounded-[20px] border border-[rgba(255,255,255,0.04)]">
                          Question pool is currently empty. Build the first question!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: OFFLINE BATCHES CMS */}
        {/* ========================================================================= */}
        {activeTab === 'batches' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4 h-fit">
              <h4 className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4.5 h-4.5 text-cyan-400" />
                {editingBatchId ? 'Modify Offline Batch' : 'Create Offline Batch Sikar'}
              </h4>

              <form onSubmit={handleSaveBatch} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Course Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SSC Foundation Super-50 Batch"
                    value={batchCourseName}
                    onChange={(e) => setBatchCourseName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Commencement Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15th July 2026"
                    value={batchStartDate}
                    onChange={(e) => setBatchStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Class Timings *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:00 AM - 12:30 PM"
                    value={batchTimings}
                    onChange={(e) => setBatchTimings(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Course Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Months"
                    value={batchDuration}
                    onChange={(e) => setBatchDuration(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Venue Branch *</label>
                  <select
                    value={batchVenue}
                    onChange={(e) => setBatchVenue(e.target.value)}
                    className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  >
                    <option value="Nawalgarh Road Sikar">Nawalgarh Road Sikar</option>
                    <option value="Piprali Road Sikar">Piprali Road Sikar</option>
                    <option value="Main Sikar Campus">Main Sikar Campus</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  {editingBatchId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBatchId(null);
                        setBatchCourseName('');
                        setBatchStartDate('');
                        setBatchTimings('');
                      }}
                      className="flex-1 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-zinc-400 rounded-[12px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white rounded-[12px] font-bold cursor-pointer uppercase"
                  >
                    {editingBatchId ? 'Save Edits' : 'Deploy Batch'}
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4 lg:col-span-2">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Active Offline Batches ({batches.length})</h4>
              
              <div className="space-y-3">
                {batches.map(b => (
                  <div key={b.id} className="bg-[#0B1220] p-4 rounded-[16px] border border-[rgba(255,255,255,0.04)] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <h5 className="font-extrabold text-white text-xs leading-snug">{b.courseName}</h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-zinc-400 mt-1.5 font-mono">
                        <div>Start: <span className="text-zinc-200">{b.startDate}</span></div>
                        <div>Timing: <span className="text-zinc-200">{b.timings}</span></div>
                        <div>Duration: <span className="text-zinc-200">{b.duration}</span></div>
                        <div>Venue: <span className="text-[#06B6D4]">{b.venue}</span></div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 sm:self-center">
                      <button
                        onClick={() => handleStartEditBatch(b)}
                        className="px-2.5 py-1 text-[10px] font-extrabold bg-[#111827] text-amber-400 border border-zinc-800 rounded-[8px] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(b.id)}
                        className="px-2.5 py-1 text-[10px] font-extrabold bg-[#111827] text-red-400 border border-zinc-800 rounded-[8px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: FACULTY CMS */}
        {/* ========================================================================= */}
        {activeTab === 'faculty' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4 h-fit">
              <h4 className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4.5 h-4.5 text-cyan-400" />
                {editingFacultyId ? 'Modify Faculty Profile' : 'Add Senior Faculty Member'}
              </h4>

              <form onSubmit={handleSaveFaculty} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Akhil Sir"
                    value={facName}
                    onChange={(e) => setFacName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Reasoning Expert"
                    value={facDesignation}
                    onChange={(e) => setFacDesignation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Primary Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Logical Reasoning & Verbal"
                    value={facSubject}
                    onChange={(e) => setFacSubject(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Experience (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10+ Years of SSC Experience"
                    value={facExperience}
                    onChange={(e) => setFacExperience(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Faculty Portrait Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={facImageUrl}
                    onChange={(e) => setFacImageUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  {editingFacultyId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFacultyId(null);
                        setFacName('');
                        setFacDesignation('');
                        setFacSubject('');
                        setFacExperience('');
                        setFacImageUrl('');
                      }}
                      className="flex-1 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-zinc-400 rounded-[12px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white rounded-[12px] font-bold cursor-pointer uppercase"
                  >
                    {editingFacultyId ? 'Save Profile' : 'Deploy Faculty'}
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4 lg:col-span-2">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Verifiable Faculty Members ({faculty.length})</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faculty.map(f => (
                  <div key={f.id} className="bg-[#0B1220] p-4 rounded-[20px] border border-[rgba(255,255,255,0.04)] flex items-start gap-3">
                    <img 
                      src={f.imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop'} 
                      alt={f.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-full shrink-0 border border-[rgba(255,255,255,0.1)]"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-extrabold text-white text-xs truncate">{f.name}</h5>
                      <div className="text-[10px] text-zinc-300 font-bold mt-0.5">{f.designation}</div>
                      <div className="text-[9.5px] text-cyan-400 font-semibold">{f.subject}</div>
                      <div className="text-[9.5px] text-zinc-500 font-mono mt-0.5">{f.experience}</div>
                      
                      <div className="flex gap-2 border-t border-[rgba(255,255,255,0.03)] pt-2 mt-2">
                        <button
                          onClick={() => handleStartEditFaculty(f)}
                          className="text-[9px] text-amber-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(f.id)}
                          className="text-[9px] text-red-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Delete Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SUCCESS TESTIMONIALS CMS */}
        {/* ========================================================================= */}
        {activeTab === 'testimonials' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4 h-fit">
              <h4 className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4.5 h-4.5 text-cyan-400" />
                {editingTestimonialId ? 'Modify Story' : 'Publish Success Testimonial'}
              </h4>

              <form onSubmit={handleSaveTestimonial} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Student Alumnus Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={testiStudentName}
                    onChange={(e) => setTestiStudentName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Designation Selection *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Selected in SSC CGL 2024 (Inspector)"
                    value={testiSelection}
                    onChange={(e) => setTestiSelection(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Detailed Review / Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write beautiful feedback regarding faculty, mocks..."
                    value={testiMessage}
                    onChange={(e) => setTestiMessage(e.target.value)}
                    className="w-full p-2.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Rating Rank (1-5 Star) *</label>
                  <select
                    value={testiRating}
                    onChange={(e) => setTestiRating(Number(e.target.value))}
                    className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  {editingTestimonialId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTestimonialId(null);
                        setTestiStudentName('');
                        setTestiSelection('');
                        setTestiMessage('');
                      }}
                      className="flex-1 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-zinc-400 rounded-[12px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white rounded-[12px] font-bold cursor-pointer uppercase"
                  >
                    {editingTestimonialId ? 'Save Story' : 'Publish Story'}
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4 lg:col-span-2">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider">Alumni Wall of Success ({testimonials.length})</h4>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {testimonials.map(t => (
                  <div key={t.id} className="bg-[#0B1220] p-4.5 rounded-[16px] border border-[rgba(255,255,255,0.04)] space-y-2">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h5 className="font-extrabold text-white text-xs">{t.studentName}</h5>
                        <div className="text-[10px] text-[#06B6D4] font-bold mt-0.5">{t.selection}</div>
                      </div>
                      <span className="text-[10px] shrink-0 font-bold text-amber-400">{'★'.repeat(t.rating)}</span>
                    </div>

                    <p className="text-[10.5px] text-zinc-300 leading-relaxed italic">"{t.message}"</p>

                    <div className="flex gap-3 text-[9.5px] text-zinc-500 pt-2 border-t border-[rgba(255,255,255,0.03)]">
                      <button
                        onClick={() => handleStartEditTestimonial(t)}
                        className="text-amber-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Edit Story
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="text-red-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Delete Story
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: USER REGISTRY & SUBSCRIPTION STATUS CONTROLS */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wide text-white">Central Student Registry & Role Managers</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B1220] border-b border-[rgba(255,255,255,0.08)] text-[10px] text-[#94A3B8] font-bold uppercase">
                      <th className="p-3">Student / Roll</th>
                      <th className="p-3">Contacts / Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Active Subscription Plan</th>
                      <th className="p-3">Validity Dates</th>
                      <th className="p-3 text-right">Database Adjustments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.06)] text-[11px]">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-[#0B1220]/20">
                        <td className="p-3">
                          <div className="font-bold text-white text-xs">{u.name}</div>
                          <div className="text-[10px] text-[#06B6D4] font-mono font-bold mt-0.5">{u.rollNumber}</div>
                        </td>
                        <td className="p-3">
                          <div>{u.email}</div>
                          <div className="text-zinc-400 font-mono text-[10px] mt-0.5">{u.mobile}</div>
                        </td>
                        <td className="p-3 capitalize">
                          <span className={`px-2 py-0.5 rounded-[12px] text-[9px] font-black uppercase ${
                            u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                            u.role === 'instructor' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                            'bg-slate-800 text-zinc-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-[12px] text-[9px] font-black uppercase ${
                            u.subscriptionPlan === 'platinum' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                            u.subscriptionPlan === 'gold' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                            u.subscriptionPlan === 'silver' ? 'bg-zinc-400/10 text-zinc-300 border border-zinc-400/30' :
                            'bg-zinc-800 text-zinc-500'
                          }`}>
                            {(u.subscriptionPlan || 'FREE').toUpperCase()}
                          </span>
                          {u.subscriptionStatus === 'pending_verification' && (
                            <span className="bg-amber-500 text-black font-extrabold text-[8px] px-1.5 py-0.5 rounded-[8px] ml-1.5 animate-pulse">
                              Pending UPI Check
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-zinc-400">
                          {u.subscriptionEndDate ? (
                            <div>
                              Ends: <strong className="text-white">{new Date(u.subscriptionEndDate).toLocaleDateString()}</strong>
                            </div>
                          ) : (
                            <span>No Active Validity</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenUserEdit(u)}
                            className="px-2.5 py-1 rounded-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] cursor-pointer flex items-center gap-1 ml-auto transition-all"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Edit Parameters</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Direct Edits Dialog */}
            {selectedUserForEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <form 
                  onSubmit={handleSaveUserDirect}
                  className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-2xl text-xs text-[#F8FAFC]"
                >
                  <h4 className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4.5 h-4.5 text-[#3B82F6]" />
                    Adjust User Database Fields
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Manually adjust system roles or extend subscription validity periods for student account: <strong className="text-white">{selectedUserForEdit.name}</strong>.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">System Role *</label>
                    <select
                      value={userRoleEdit}
                      onChange={(e) => setUserRoleEdit(e.target.value as any)}
                      className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                    >
                      <option value="student">Student Account</option>
                      <option value="instructor">Verified Instructor</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Membership Plan *</label>
                    <select
                      value={userPlanEdit}
                      onChange={(e) => setUserPlanEdit(e.target.value as any)}
                      className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                    >
                      <option value="free">Free Plan (Standard)</option>
                      <option value="silver">Silver Pass</option>
                      <option value="gold">Gold Pass (Recommended)</option>
                      <option value="platinum">Platinum Pass (Premium)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Plan Validity Status *</label>
                    <select
                      value={userStatusEdit}
                      onChange={(e) => setUserStatusEdit(e.target.value as any)}
                      className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                    >
                      <option value="active">Active Plan</option>
                      <option value="expired">Force Expired</option>
                      <option value="pending_verification">Needs Verification</option>
                    </select>
                  </div>

                  {userPlanEdit !== 'free' && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Grant Validity Duration (Days) *</label>
                      <select
                        value={extendDays}
                        onChange={(e) => setExtendDays(Number(e.target.value))}
                        className="w-full p-2 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none"
                      >
                        <option value={7}>7 Days (Trial)</option>
                        <option value={30}>30 Days (1 Month)</option>
                        <option value={90}>90 Days (3 Months)</option>
                        <option value={180}>180 Days (6 Months)</option>
                        <option value={365}>365 Days (1 Year)</option>
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForEdit(null)}
                      className="flex-1 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] text-zinc-400 hover:text-white rounded-[12px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white rounded-[12px] font-bold cursor-pointer"
                    >
                      Apply Adjustments
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: NOTICE BOARD (ANNOUNCEMENTS CREATOR) */}
        {/* ========================================================================= */}
        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Form */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4.5 h-4.5 text-cyan-400" />
                Post Announcement Alert
              </h4>
              
              <form onSubmit={handleAddNotice} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Notice Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Offline mock timings rescheduled"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Notice Body Details *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter full notice guidelines..."
                    value={noticeContent}
                    onChange={(e) => setNoticeContent(e.target.value)}
                    className="w-full p-2.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pin_check"
                    checked={noticePinned}
                    onChange={(e) => setNoticePinned(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-800 bg-[#0B1220] cursor-pointer"
                  />
                  <label htmlFor="pin_check" className="text-[10px] text-[#94A3B8] uppercase font-bold cursor-pointer">
                    Pin Notice on Top Header of Student Dashboard
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:shadow-md text-white font-bold rounded-[12px] cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Post Announcement
                </button>
              </form>
            </div>

            {/* List */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase text-white tracking-wider">Active Notices</h4>
              <div className="space-y-3 overflow-y-auto max-h-[450px]">
                {notices.map(n => (
                  <div key={n.id} className="bg-[#0B1220] p-4 rounded-[16px] border border-[rgba(255,255,255,0.04)] space-y-2 relative">
                    {n.pinned && (
                      <span className="absolute top-3 right-3 text-[7.5px] bg-[#991B1B] text-white font-black uppercase px-1.5 py-0.5 rounded-[8px]">
                        ★ Pinned
                      </span>
                    )}
                    <h5 className="font-extrabold text-white text-xs max-w-[80%]">{n.title}</h5>
                    <p className="text-[10px] text-zinc-400 leading-normal">{n.content}</p>
                    
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-1.5 border-t border-[rgba(255,255,255,0.04)]">
                      <span>By: {n.author} | {new Date(n.date).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleDeleteNotice(n.id)}
                        className="text-red-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Delete Notice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: BANNER CAROUSEL MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Form */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs uppercase text-white tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4.5 h-4.5 text-cyan-400" />
                Upload Dynamic Promo Banner
              </h4>
              
              <form onSubmit={handleAddBanner} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Banner Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sikar super batch starting July 12!"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-[#94A3B8] uppercase block font-bold">Banner Link Trigger (Anchor)</label>
                  <input
                    type="text"
                    placeholder="e.g. #batches, #mocks"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-[rgba(255,255,255,0.08)] rounded-[12px] text-xs text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:shadow-md text-white font-bold rounded-[12px] cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Publish Banner Promo
                </button>
              </form>
            </div>

            {/* List */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase text-white tracking-wider">Active Promotional Banners</h4>
              <div className="space-y-3">
                {banners.map(b => (
                  <div key={b.id} className="bg-[#0B1220] p-3 rounded-[16px] border border-[rgba(255,255,255,0.04)] flex items-center justify-between gap-3">
                    <img 
                      src={b.imageUrl} 
                      alt={b.title} 
                      className="w-16 h-10 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-white text-xs truncate">{b.title}</div>
                      <div className="text-[9.5px] text-zinc-400">Action link: {b.link || '#'}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleBannerActive(b.id)}
                        className={`px-2 py-0.5 rounded-[10px] font-black uppercase text-[8.5px] cursor-pointer transition-all ${
                          b.active ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {b.active ? 'Active' : 'Draft'}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-1 hover:bg-[#111827] text-red-400 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: AUDIT TRAIL LOG MONITOR */}
        {/* ========================================================================= */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] p-5 rounded-[20px] shadow flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs uppercase text-[#EF4444] flex items-center gap-1.5 tracking-wider">
                  <Terminal className="w-4.5 h-4.5" />
                  Compliance Cryptography Logs
                </h4>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Audits all student sign-ins, JWT evaluations, manual checkout approvals, and suspicious DRM violations.
                </p>
              </div>

              {/* Filters */}
              <div className="flex gap-1.5">
                {['ALL', 'INFO', 'WARNING', 'CRITICAL'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => alert(`Filtering logs is automated. Displays all items sorted by timestamp.`)}
                    className="px-2.5 py-1 rounded-[10px] bg-[#0B1220] text-[#94A3B8] border border-[rgba(255,255,255,0.04)] font-bold text-[9px] uppercase tracking-wider hover:text-white"
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrolling Logs list */}
            <div className="bg-[#0B1220] border border-zinc-800 rounded-[20px] p-4.5 font-mono text-[10.5px] text-[#F8FAFC]/90 h-[450px] overflow-y-auto space-y-3 shadow-inner">
              {auditLogs.map((log) => {
                const isCritical = log.severity === 'CRITICAL';
                const isWarning = log.severity === 'WARNING';
                return (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded-[12px] border transition-colors ${
                      isCritical ? 'bg-[#991B1B]/10 border-red-900/40 text-red-200' :
                      isWarning ? 'bg-amber-950/15 border-amber-900/30 text-amber-200' :
                      'bg-[#111827]/60 border-zinc-800/40 text-zinc-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[rgba(255,255,255,0.03)] pb-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          isCritical ? 'bg-red-950 text-red-400' :
                          isWarning ? 'bg-amber-950 text-amber-400' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {log.severity}
                        </span>
                        <span className="font-bold text-[#3B82F6]">{log.action}</span>
                      </div>
                      <span className="text-zinc-500 text-[9px]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    
                    <p className="leading-relaxed text-[11px] font-sans">{log.details}</p>
                    
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-1.5 mt-1.5 border-t border-[rgba(255,255,255,0.03)] font-mono">
                      <span>Principal: {log.userEmail} ({log.userRole.toUpperCase()})</span>
                      <span>Target IP: {log.ipAddress}</span>
                    </div>
                  </div>
                );
              })}
              {auditLogs.length === 0 && (
                <div className="text-center text-zinc-600 py-16 italic font-sans">
                  Compliance auditor console is currently silent.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
