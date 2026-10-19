/**
 * Crust & Co - Prototype Customer Session & Auth
 * Follows Sections 78, 79, 80, 86, 87 of specification.
 * Uses localStorage: crust_co_users, crust_co_current_user
 */

const USERS_STORAGE_KEY = 'crust_co_users';
const CURRENT_USER_KEY = 'crust_co_current_user';

// Seed demo user if no users exist
function initDefaultUsers() {
  const existing = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existing) {
    const demoUsers = [
      {
        id: 'user-001',
        name: 'Hamza Farooq',
        email: 'hamza@crustco.pk',
        phone: '03001234567',
        password: 'password123',
        address: 'House 42, Street 7, Block F',
        area: 'Gulberg III, Lahore',
        landmark: 'Near Mini Market',
        createdAt: '2026-10-01T12:00:00Z',
      },
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(demoUsers));
  }
}

initDefaultUsers();

export function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    window.dispatchEvent(new CustomEvent('crust:auth-changed', { detail: { user } }));
  } catch (e) {
    console.error('Failed to update current user:', e);
  }
}

export function signup({ name, phone, email, password }) {
  const users = getUsers();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  // Check existing
  const exists = users.some(
    (u) => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone
  );

  if (exists) {
    throw new Error('An account with this email or phone number already exists.');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    phone: cleanPhone,
    email: cleanEmail,
    password: password,
    address: '',
    area: '',
    landmark: '',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  setCurrentUser(newUser);
  return newUser;
}

export function login(identifier, password) {
  const users = getUsers();
  const cleanIdent = identifier.trim().toLowerCase();

  const user = users.find(
    (u) =>
      (u.email.toLowerCase() === cleanIdent || u.phone === cleanIdent) &&
      u.password === password
  );

  if (!user) {
    throw new Error('Invalid email/phone or password. Please try again.');
  }

  setCurrentUser(user);
  return user;
}

export function logout() {
  setCurrentUser(null);
}

export function updateProfile(data) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not logged in');

  const users = getUsers();
  const index = users.findIndex((u) => u.id === currentUser.id);

  const updatedUser = {
    ...currentUser,
    ...data,
  };

  if (index > -1) {
    users[index] = updatedUser;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  setCurrentUser(updatedUser);
  return updatedUser;
}
