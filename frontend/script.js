// ─────────────────────────────────────────────────────────────────────────────
// script.js  —  UnityCare NGO  |  Firebase v10 (ESM via CDN)
// ─────────────────────────────────────────────────────────────────────────────
import { auth, db } from '../backend/firebase-config.js';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
    doc, setDoc, getDoc, addDoc, collection,
    onSnapshot, query, where, orderBy,
    serverTimestamp, getDocs, updateDoc, increment
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}
function go(path) { window.location.href = path; }
function $(id) { return document.getElementById(id); }

// ─── TOAST NOTIFICATIONS ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
window.showToast = showToast;

// ─── TOGGLE "OTHER" INPUT IN DONATION FORM ───────────────────────────────────
window.toggleOtherInput = function () {
    const sel = $('donation-type');
    const grp = $('other-donation-group');
    const pay = $('payment-section');
    if (!sel) return;
    if (grp) grp.style.display = sel.value === 'Other' ? 'block' : 'none';
    if (pay) pay.style.display = sel.value === 'Money' ? 'block' : 'none';
};

// ─── NAV: HAMBURGER ──────────────────────────────────────────────────────────
const hamburger = $('hamburger');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        document.querySelector('.nav-links')?.classList.toggle('active');
    });
}

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── AUTH STATE — runs on every page ─────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
    const page = window.location.pathname;

    // Pages that need no auth
    const publicPages = ['/login.html', '/signup.html', '/index.html', '/onboarding-receiver.html'];
    const isPublic = publicPages.some(p => page.endsWith(p)) || page === '/' || page.endsWith('/');

    // Populate avatar/name on dashboard pages
    const avatarEl = $('user-avatar-initials');
    const nameEl = $('user-name-display');
    const logoutBtn = $('logout-btn');

    if (user) {
        // Fetch profile from Firestore
        const snap = await getDoc(doc(db, 'users', user.uid));
        const profile = snap.exists() ? snap.data() : {};
        const name = profile.name || user.email.split('@')[0];
        const role = profile.role || 'donator';

        if (avatarEl) avatarEl.textContent = getInitials(name);
        if (nameEl) nameEl.textContent = name;

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await signOut(auth);
                } catch (err) {
                    console.error('Sign-out failed:', err);
                }
                // Always navigate to landing page as a fallback
                try {
                    go('index.html');
                } catch (navErr) {
                    // If go() fails for any reason, set href directly
                    window.location.href = 'index.html';
                }
            });
        }

        // Redirect away from login/signup if already logged in
        if (isPublic && !page.endsWith('onboarding-receiver.html') && !page.endsWith('index.html')) {
            redirectByRole(role, profile.profileComplete);
        }
    } else {
        // Not logged in → redirect to login (except public pages)
        if (!isPublic) go('login.html');
    }
});

function redirectByRole(role, profileComplete) {
    switch (role) {
        case 'receiver':
            go(profileComplete ? 'dashboard-receiver.html' : 'onboarding-receiver.html');
            break;
        case 'admin': go('dashboard-admin.html'); break;
        case 'worker': go('dashboard-worker.html'); break;
        default: go('dashboard-donator.html'); break;
    }
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
const signupForm = $('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = signupForm.querySelector('[name="name"]')?.value.trim() || '';
        const email = signupForm.querySelector('[name="email"]')?.value.trim();
        const pass = signupForm.querySelector('[name="password"]')?.value;
        const role = signupForm.querySelector('[name="role"]')?.value || 'donator';

        const errEl = $('signup-error');
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, pass);
            // Write user profile to Firestore
            await setDoc(doc(db, 'users', cred.user.uid), {
                name,
                email,
                role,
                profileComplete: false,
                createdAt: serverTimestamp()
            });
            redirectByRole(role, false);
        } catch (err) {
            if (errEl) errEl.textContent = friendlyError(err.code);
        }
    });
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const loginForm = $('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('[name="email"]')?.value.trim();
        const pass = loginForm.querySelector('[name="password"]')?.value;
        const errEl = $('login-error');
        try {
            const cred = await signInWithEmailAndPassword(auth, email, pass);
            const snap = await getDoc(doc(db, 'users', cred.user.uid));
            const profile = snap.data() || {};
            redirectByRole(profile.role || 'donator', profile.profileComplete);
        } catch (err) {
            if (errEl) errEl.textContent = friendlyError(err.code);
        }
    });
}

function friendlyError(code) {
    const map = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
    };
    return map[code] || 'Something went wrong. Please try again.';
}

// ─── ONBOARDING — RECEIVER ───────────────────────────────────────────────────
const onboardingForm = $('onboarding-form');
if (onboardingForm) {
    onboardingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) { go('login.html'); return; }

        const data = {
            phone: onboardingForm.querySelector('[name="phone"]')?.value,
            dob: onboardingForm.querySelector('[name="dob"]')?.value,
            address: onboardingForm.querySelector('[name="address"]')?.value,
            needCategory: onboardingForm.querySelector('[name="need-category"]')?.value,
            profileComplete: true,
            updatedAt: serverTimestamp()
        };
        const medicalCondition = onboardingForm.querySelector('[name="medical-condition"]')?.value;
        if (medicalCondition) data.medicalCondition = medicalCondition;

        await setDoc(doc(db, 'users', user.uid), data, { merge: true });
        showToast('Profile completed successfully!');
        setTimeout(() => go('dashboard-receiver.html'), 1500);
    });
}

// ─── MODAL HANDLING (shared, non-receiver pages) ─────────────────────────────
const modal = $('donation-modal');
const openBtn = $('open-donation-modal');
const closeBtn = document.querySelector('.close-modal');

if (modal && closeBtn) {
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            const reqForm = $('request-form');
            if (reqForm) { reqForm.reset(); }
            else {
                $('donation-form')?.reset();
                const sel = $('donation-type');
                if (sel) { sel.value = ''; toggleOtherInput(); }
                // Clear hidden fields
                const targetId = $('target-id');
                const targetType = $('target-type');
                const banner = $('donation-context-banner');
                if (targetId) targetId.value = '';
                if (targetType) targetType.value = '';
                if (banner) banner.style.display = 'none';
            }
            modal.style.display = 'block';
        });
    }

    // Category links → open modal
    document.querySelectorAll('.open-donation-modal').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            $('donation-form')?.reset();
            const linkText = link.innerText.toLowerCase();
            const ageGrp = $('age-group');
            if (ageGrp) {
                if (linkText.includes('children') || linkText.includes('infant')) ageGrp.value = 'children';
                else if (linkText.includes('youth')) ageGrp.value = 'youth';
                else if (linkText.includes('adult')) ageGrp.value = 'adults';
                else if (linkText.includes('senior')) ageGrp.value = 'seniors';
            }
            const sel = $('donation-type');
            if (sel) { sel.value = ''; toggleOtherInput(); }
            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

// ─── DONATION FORM SUBMIT (Donator dashboard) ─────────────────────────────────
const donationForm = $('donation-form');
if (donationForm) {
    // Payment method toggle
    document.querySelectorAll('[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.pay-subfields').forEach(el => el.style.display = 'none');
            const target = $('pay-' + radio.value);
            if (target) target.style.display = 'block';
        });
    });

    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        let type = $('donation-type')?.value;
        if (type === 'Other') type = $('other-donation-type')?.value || 'Other';

        const data = {
            donorUid: user?.uid || 'anonymous',
            donorName: donationForm.querySelector('[name="fullname"]')?.value,
            email: donationForm.querySelector('[name="email"]')?.value,
            ageGroup: $('age-group')?.value,
            type,
            amount: $('amount')?.value || '',
            message: $('message')?.value || '',
            targetId: $('target-id')?.value || null,
            targetType: $('target-type')?.value || null,
            createdAt: serverTimestamp()
        };

        const targetId = $('target-id')?.value;
        const targetType = $('target-type')?.value;

        try {
            // 1. Save donation record
            await addDoc(collection(db, 'donations'), data);

            // 2. Increment target amount if applicable
            if (targetId && targetType && data.type === 'Money') {
                const amtStr = data.amount.replace(/[^0-9]/g, '');
                const amtValue = parseInt(amtStr) || 0;

                if (amtValue > 0) {
                    const targetRef = doc(db, targetType, targetId);
                    const field = targetType === 'campaigns' ? 'raised' : 'receivedAmount';
                    await updateDoc(targetRef, { [field]: increment(amtValue) });
                    // After increment, check if target reached and mark completed
                    try {
                        const tSnap = await getDoc(targetRef);
                        if (tSnap.exists()) {
                            const tdata = tSnap.data();
                            const cur = tdata[field] || 0;
                            const targ = tdata.target || 0;
                            if (targ > 0 && cur >= targ && tdata.status !== 'completed') {
                                await updateDoc(targetRef, { status: 'completed', completedAt: serverTimestamp() });
                                // notify about completion
                                try {
                                    await addDoc(collection(db, 'notifications'), {
                                        type: 'completed',
                                        targetType: targetType,
                                        targetId: targetId,
                                        targetTitle: tdata.title || tdata.submitterName || null,
                                        roles: ['admin', 'worker', 'donator'],
                                        createdAt: serverTimestamp()
                                    });
                                } catch (n2) { console.warn('Failed to create completion notification', n2); }
                            }
                        }
                    } catch (chkErr) {
                        console.warn('Failed checking target after donation:', chkErr);
                    }
                }
            }

            // 3. Create a notification for admin and workers (and keep donorUid for donor view)
            try {
                let targetTitle = '';
                if (targetId && targetType) {
                    const tSnap = await getDoc(doc(db, targetType, targetId));
                    if (tSnap.exists()) {
                        const tdata = tSnap.data();
                        targetTitle = tdata.title || tdata.submitterName || '';
                    }
                }

                await addDoc(collection(db, 'notifications'), {
                    type: 'donation',
                    donorUid: data.donorUid,
                    donorName: data.donorName,
                    amount: data.amount || '',
                    message: data.message || '',
                    targetType: targetType || null,
                    targetId: targetId || null,
                    targetTitle: targetTitle || null,
                    roles: ['admin', 'worker', 'donator'],
                    readBy: [],
                    createdAt: serverTimestamp()
                });
            } catch (nerr) {
                console.warn('Failed to create notification:', nerr);
            }

            showToast(`Thank you, ${data.donorName}! Donation recorded successfully.`);
            donationForm.reset();
            toggleOtherInput();
            modal.style.display = 'none';
        } catch (err) {
            showToast('Error saving donation. Please try again.', 'error');
            console.error(err);
        }
    });
}

// ─── RECEIVER: "CREATE REQUEST" FORM (inline handler on receiver dashboard) ──
// See dashboard-receiver.html inline <script> for the Firestore write
// (kept inline to avoid module scope issues with the auth.currentUser reference)
