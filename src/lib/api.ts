// Local API Client mimicking server calls using localStorage
import { loadSecureKey, saveSecureKey } from './security';

export const setToken = (t: string | null) => {
  // no-op, token not needed for client-only
};

export const getToken = () => null;

export const syncUserProfile = async (profile: any) => {
  const users = loadSecureKey<any[]>('v_users', []);
  const idx = users.findIndex((u: any) => u.email.toLowerCase() === profile.email.toLowerCase());
  const updated = {
    ...profile,
    id: profile.id || (idx >= 0 ? users[idx].id : 'user_' + Math.random().toString(36).substring(2, 9)),
    registeredAt: profile.registeredAt || new Date().toISOString()
  };
  if (idx >= 0) {
    users[idx] = updated;
  } else {
    users.push(updated);
  }
  saveSecureKey('v_users', users);
  saveSecureKey('v_curr_user', updated);
  return updated;
};

export const fetchAttempts = async () => {
  const user = loadSecureKey<any>('v_curr_user', null);
  if (!user) return [];
  const attempts = JSON.parse(localStorage.getItem('v_attempts') || '[]');
  if (user.role === 'admin' || user.role === 'instructor') {
    return attempts;
  }
  return attempts.filter((a: any) => a.userUid === user.id || a.userUid === user.email);
};

export const saveAttempt = async (attempt: any) => {
  const attempts = JSON.parse(localStorage.getItem('v_attempts') || '[]');
  const user = loadSecureKey<any>('v_curr_user', null);
  const newAttempt = {
    ...attempt,
    userUid: user ? user.id : 'anonymous',
    completedAt: new Date().toISOString()
  };
  // Prepend so that latest attempts are first
  attempts.unshift(newAttempt);
  localStorage.setItem('v_attempts', JSON.stringify(attempts));
  return newAttempt;
};

export const fetchDoubts = async () => {
  const doubts = JSON.parse(localStorage.getItem('v_doubts') || '[]');
  const user = loadSecureKey<any>('v_curr_user', null);
  if (!user) return [];
  if (user.role === 'admin' || user.role === 'instructor') {
    return doubts;
  }
  return doubts.filter((d: any) => d.studentUid === user.id || d.studentUid === user.email);
};

export const createDoubt = async (doubt: any) => {
  const doubts = JSON.parse(localStorage.getItem('v_doubts') || '[]');
  const user = loadSecureKey<any>('v_curr_user', null);
  const newDoubt = {
    ...doubt,
    studentUid: user ? user.id : 'anonymous',
    createdAt: new Date().toISOString()
  };
  doubts.unshift(newDoubt);
  localStorage.setItem('v_doubts', JSON.stringify(doubts));
  return newDoubt;
};

export const replyToDoubt = async (id: string, replyPayload: any) => {
  const doubts = JSON.parse(localStorage.getItem('v_doubts') || '[]');
  const idx = doubts.findIndex((d: any) => d.id === id);
  if (idx >= 0) {
    doubts[idx] = {
      ...doubts[idx],
      reply: replyPayload.reply,
      repliedBy: replyPayload.repliedBy,
      status: replyPayload.status,
      repliedAt: new Date().toISOString()
    };
    localStorage.setItem('v_doubts', JSON.stringify(doubts));
    return doubts[idx];
  }
  throw new Error("Doubt not found");
};

export const fetchAdminUsers = async () => {
  return loadSecureKey<any[]>('v_users', []);
};
