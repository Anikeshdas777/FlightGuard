/**
 * authService.js
 * localStorage-based authentication and personalization service.
 * Simulates Firebase Auth behaviour without requiring any API keys.
 */

const USERS_KEY = 'flightguard_users';
const SESSION_KEY = 'flightguard_session';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
    catch { return {}; }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(pw) {
    // Simple deterministic hash (sufficient for localStorage demo)
    let h = 0;
    for (let i = 0; i < pw.length; i++) h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
    return h.toString(16);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export function signUp(name, email, password) {
    const users = getUsers();
    const key = email.toLowerCase().trim();

    if (users[key]) return { error: 'An account with this email already exists.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };

    const user = {
        uid: `uid_${Date.now()}`,
        name: name.trim(),
        email: key,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
        savedRoutes: [],
        travelHistory: [],
        preferences: { homeAirport: '', favoriteAirlines: [] },
    };

    users[key] = user;
    saveUsers(users);

    const session = { uid: user.uid, name: user.name, email: user.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { user: session };
}

export function signIn(email, password) {
    const users = getUsers();
    const key = email.toLowerCase().trim();
    const stored = users[key];

    if (!stored) return { error: 'No account found with this email.' };
    if (stored.passwordHash !== hashPassword(password)) return { error: 'Incorrect password.' };

    const session = { uid: stored.uid, name: stored.name, email: stored.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { user: session };
}

export function signOut() {
    localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
}

// ─── Personalization ──────────────────────────────────────────────────────────

function getUserData(uid) {
    const users = getUsers();
    return Object.values(users).find(u => u.uid === uid) || null;
}

function updateUserData(uid, patch) {
    const users = getUsers();
    const key = Object.keys(users).find(k => users[k].uid === uid);
    if (!key) return;
    users[key] = { ...users[key], ...patch };
    saveUsers(users);
}

// Saved Routes
export function getSavedRoutes(uid) {
    const data = getUserData(uid);
    return data ? data.savedRoutes : [];
}

export function saveRoute(uid, route) {
    const data = getUserData(uid);
    if (!data) return;
    const routes = data.savedRoutes || [];
    const exists = routes.find(r => r.from === route.from && r.to === route.to);
    if (!exists) {
        updateUserData(uid, { savedRoutes: [{ ...route, savedAt: new Date().toISOString() }, ...routes] });
    }
}

export function removeRoute(uid, routeId) {
    const data = getUserData(uid);
    if (!data) return;
    updateUserData(uid, { savedRoutes: data.savedRoutes.filter(r => r.id !== routeId) });
}

// Travel History
export function getTravelHistory(uid) {
    const data = getUserData(uid);
    return data ? data.travelHistory : [];
}

export function addToHistory(uid, entry) {
    const data = getUserData(uid);
    if (!data) return;
    const history = data.travelHistory || [];
    updateUserData(uid, {
        travelHistory: [{ ...entry, id: `h_${Date.now()}`, loggedAt: new Date().toISOString() }, ...history].slice(0, 50)
    });
}

// Preferences
export function getPreferences(uid) {
    const data = getUserData(uid);
    return data ? data.preferences : { homeAirport: '', favoriteAirlines: [] };
}

export function savePreferences(uid, prefs) {
    updateUserData(uid, { preferences: prefs });
}
