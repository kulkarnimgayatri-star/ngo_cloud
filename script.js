// Reveal animations on scroll
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// Counter animation for impact stats
const counters = document.querySelectorAll('.counter');
const speed = 200;

 
const startCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

// Start counters when impact section is visible
const impactSection = document.querySelector('.impact-section');
const impactObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        startCounters();
        impactObserver.unobserve(impactSection);
    }
}, { threshold: 0.5 });

if (impactSection) {
    impactObserver.observe(impactSection);
}

// Simple dynamic tracking simulation (randomly incrementing raised amounts)
const progressBars = document.querySelectorAll('.progress');
setInterval(() => {
    progressBars.forEach(bar => {
        const currentWidth = parseFloat(bar.style.width);
        if (currentWidth < 98) {
            const newWidth = currentWidth + (Math.random() * 0.1);
            bar.style.width = `${newWidth}%`;
        }
    });
}, 3000);

// Form submission handling
const form = document.querySelector('.newsletter-form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input').value;
        if (email) {
            alert(`Thank you for joining UnityCare, ${email}!`);
            form.reset();
        }
    });
}



// ============================================================
// FIREBASE AUTH — Login
// ============================================================
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert(`Login Successful! Welcome ${userCredential.user.email}`);
            window.location.href = 'home.html';
        })
        .catch(error => alert('Login Failed: ' + error.message));
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });
}

// ============================================================
// FIREBASE AUTH — Register / Sign Up
// ============================================================
function register() {
    const name = document.getElementById('signup-name') ? document.getElementById('signup-name').value : '';
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Save display name to Firestore users collection
            return db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert(`Account created successfully for ${name}! Please sign in.`);
            window.location.href = 'login.html';
        })
        .catch(error => alert('Registration Failed: ' + error.message));
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        register();
    });
}

// ============================================================
// FIREBASE AUTH — Logout
// ============================================================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            alert('You have been logged out.');
            window.location.href = 'index.html';
        }).catch(error => alert('Logout Error: ' + error.message));
    });
}

// ============================================================
// FIREBASE AUTH — Auth State Observer (guards dashboard pages)
// ============================================================
auth.onAuthStateChanged((user) => {
    const onDashboard = window.location.pathname.includes('home.html');
    if (onDashboard) {
        if (!user) {
            alert('Please login to access the donation hub.');
            window.location.href = 'login.html';
        } else {
            // Show logged-in user's name/email
            const nameDisplay = document.getElementById('user-name-display');
            if (nameDisplay) {
                // Fetch name from Firestore
                db.collection('users').doc(user.uid).get().then((doc) => {
                    if (doc.exists && doc.data().name) {
                        nameDisplay.innerText = doc.data().name;
                    } else {
                        nameDisplay.innerText = user.email;
                    }
                });
            }
            // Load real-time fund data
            loadRealTimeFunds();
        }
    }
});

// ============================================================
// FIRESTORE — Real-Time Fund Tracking with onSnapshot
// ============================================================
function loadRealTimeFunds() {
    // Listen to 'funds' collection in real time
    db.collection('funds').onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
            const fund = doc.data();
            const fundId = doc.id; // e.g. "education", "cleanwater", "health"

            // Update progress bar
            const progressEl = document.getElementById(`progress-${fundId}`);
            if (progressEl && fund.target > 0) {
                const percent = Math.min((fund.raised / fund.target) * 100, 100).toFixed(1);
                progressEl.style.width = `${percent}%`;
            }

            // Update raised/target text
            const raisedEl = document.getElementById(`raised-${fundId}`);
            const targetEl = document.getElementById(`target-${fundId}`);
            if (raisedEl) raisedEl.innerText = `Raised: $${fund.raised.toLocaleString()}`;
            if (targetEl) targetEl.innerText = `Target: $${fund.target.toLocaleString()}`;

            // Update status
            const statusEl = document.getElementById(`status-${fundId}`);
            if (statusEl && fund.status) statusEl.innerHTML = `Status: <b>${fund.status}</b>`;
        });
    }, (error) => {
        console.error('Firestore real-time error:', error);
    });
}

// ============================================================
// FIRESTORE — Save Donation Record to Database
// ============================================================
const donationForm = document.getElementById('donation-form');
if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(donationForm);
        const name = formData.get('fullname');
        const email = formData.get('email');
        const ageGroup = formData.get('age-group');
        const type = formData.get('donation-type');
        const amount = parseFloat(formData.get('amount')) || 0;

        if (name && email && ageGroup && type) {
            // Save donation to Firestore
            db.collection('donations').add({
                name: name,
                email: email,
                ageGroup: ageGroup,
                type: type,
                amount: amount,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                let message = `Thank you, ${name}! Your donation of ${type} for the ${ageGroup} category has been recorded.`;
                if (amount) message += ` Contribution of $${amount} noted.`;
                message += ` A confirmation has been sent to ${email}.`;
                alert(message);
                donationForm.reset();
            }).catch(error => {
                alert('Error saving donation: ' + error.message);
            });
        }
    });
}
