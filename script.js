// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        }
    });

    // Close nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });
}

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

// Toggle Other Donation Input + Payment Section
function toggleOtherInput() {
    const select = document.getElementById('donation-type');
    const otherGroup = document.getElementById('other-donation-group');
    const otherInput = document.getElementById('other-donation-type');
    const paymentSection = document.getElementById('payment-section');

    if (select.value === 'Other') {
        otherGroup.style.display = 'block';
        otherInput.required = true;
    } else {
        otherGroup.style.display = 'none';
        otherInput.required = false;
        otherInput.value = '';
    }

    // Show payment section only when Money is selected
    if (paymentSection) {
        paymentSection.style.display = select.value === 'Money' ? 'block' : 'none';
        if (select.value !== 'Money') {
            // Reset payment selection when switching away
            document.querySelectorAll('input[name="payment-method"]').forEach(r => r.checked = false);
            document.querySelectorAll('.pay-subfields').forEach(el => el.style.display = 'none');
        }
    }
}

// Payment method sub-field switcher
document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', () => {
        document.querySelectorAll('.pay-subfields').forEach(el => el.style.display = 'none');
        const target = document.getElementById('pay-' + radio.value);
        if (target) target.style.display = 'block';
    });
});

// Card number auto-format (add space every 4 digits)
const cardNumberInput = document.getElementById('card-number');
if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        e.target.value = val.match(/.{1,4}/g)?.join(' ') || val;
    });
}

// Card expiry auto-format (MM / YY)
const cardExpiryInput = document.getElementById('card-expiry');
if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) val = val.substring(0, 2) + ' / ' + val.substring(2);
        e.target.value = val;
    });
}

// Main Donation Form Handling
const donationForm = document.getElementById('donation-form');
if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(donationForm);
        const name = formData.get('fullname');
        const email = formData.get('email');
        const ageGroup = formData.get('age-group');
        let type = formData.get('donation-type');
        const amount = formData.get('amount');

        if (type === 'Other') {
            type = document.getElementById('other-donation-type').value || 'Other Donation';
        }

        if (name && email && ageGroup && type) {
            let message = `Thank you, ${name}! Your donation of ${type} for the ${ageGroup} category has been securely recorded.`;
            if (amount) {
                message += ` We've noted your contribution of ₹${amount}.`;
            }
            message += `\n\n[NGO Acceptance Flow] Your donation will first be verified and accepted by an NGO Admin or Worker before it is distributed to the Receiver. A confirmation has been sent to ${email}.`;

            alert(message);
            donationForm.reset();
            toggleOtherInput(); // Reset the Other field visibility
            console.log("Donation Successful:", { name, email, ageGroup, type, amount });

            // Close modal on successful submit
            const modal = document.getElementById('donation-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });
}

// ── Modal Handling (shared across all dashboards) ──────────────────────────
const modal = document.getElementById('donation-modal');
const openBtn = document.getElementById('open-donation-modal');
const closeBtn = document.querySelector('.close-modal');

if (modal && closeBtn) {
    // Open modal via main button ("Create a Post" / "Fill Donation Form")
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            // Receiver dashboard uses request-form; others use donation-form
            const requestFormEl = document.getElementById('request-form');
            const donationFormEl = document.getElementById('donation-form');

            if (requestFormEl) {
                requestFormEl.reset();
            } else if (donationFormEl) {
                donationFormEl.reset();
                const categorySelect = document.getElementById('donation-type');
                if (categorySelect) categorySelect.value = '';
                toggleOtherInput();
            }

            modal.style.display = 'block';
        });
    }

    // Open modal via "Empower Every Generation" category links (other dashboards)
    const categoryLinks = document.querySelectorAll('.open-donation-modal');
    const ageGroupSelect = document.getElementById('age-group');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const donationFormEl = document.getElementById('donation-form');
            if (donationFormEl) donationFormEl.reset();

            const linkText = link.innerText.toLowerCase();
            if (ageGroupSelect) {
                if (linkText.includes('children') || linkText.includes('infant')) {
                    ageGroupSelect.value = 'children';
                } else if (linkText.includes('youth')) {
                    ageGroupSelect.value = 'youth';
                } else if (linkText.includes('adult')) {
                    ageGroupSelect.value = 'adults';
                } else if (linkText.includes('senior')) {
                    ageGroupSelect.value = 'seniors';
                }
            }

            const categorySelect = document.getElementById('donation-type');
            if (categorySelect) categorySelect.value = '';
            toggleOtherInput();

            modal.style.display = 'block';
        });
    });

    // Open modal via community feed "Donate Now" buttons (other dashboards)
    const feedButtons = document.querySelectorAll('.feed-card .btn');
    feedButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Don't open for "Update Post" buttons on receiver dashboard
            if (btn.innerText.trim() === 'Update Post') return;
            modal.style.display = 'block';

            const card = e.target.closest('.feed-card');
            if (card) {
                const titleEl = card.querySelector('h3');
                const categorySelect = document.getElementById('donation-type');
                if (categorySelect && titleEl) {
                    categorySelect.value = 'Other';
                    toggleOtherInput();
                    const otherInput = document.getElementById('other-donation-type');
                    if (otherInput) otherInput.value = titleEl.innerText;
                }
            }
        });
    });

    // Close on X button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close on backdrop click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Login Form Handling
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (email && password) {
            const roleSelect = document.getElementById('login-role');
            const role = roleSelect ? roleSelect.value : 'Donator';

            // Derive a display name from the email prefix
            const prefix = email.split('@')[0];
            const displayName = prefix
                .replace(/[._-]+/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());

            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userName', displayName);
            sessionStorage.setItem('userRole', role);

            if (role.toLowerCase() === 'receiver' && !sessionStorage.getItem('profileCompleted')) {
                alert(`Login successful! Redirecting to complete your profile...`);
                window.location.href = `onboarding-receiver.html`;
            } else {
                alert(`Login successful! Welcome, ${displayName} (${role})! Redirecting to your Dashboard...`);
                window.location.href = `dashboard-${role.toLowerCase()}.html`;
            }
        }
    });
}

// Logout Handling
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('userRole');
        alert('You have been logged out.');
        window.location.href = 'index.html';
    });
}

// Signup Form Handling
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (name && email && password) {
            const roleSelect = document.getElementById('signup-role');
            const role = roleSelect ? roleSelect.value : 'Donator';
            const displayName = name.trim();

            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userName', displayName);
            sessionStorage.setItem('userRole', role);

            if (role.toLowerCase() === 'receiver' && !sessionStorage.getItem('profileCompleted')) {
                alert(`Account created successfully! Welcome, ${displayName}. Please complete your profile.`);
                window.location.href = `onboarding-receiver.html`;
            } else {
                alert(`Account created successfully! Welcome, ${displayName} (${role})! Redirecting to your Dashboard...`);
                window.location.href = `dashboard-${role.toLowerCase()}.html`;
            }
        }
    });
}

// Dashboard Init
if (window.location.pathname.includes('dashboard-')) {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        alert('Please login to access the dashboard.');
        window.location.href = 'login.html';
    }

    const userName = sessionStorage.getItem('userName') || 'Supporter';
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay) nameDisplay.innerText = userName;

    // Set avatar initials from the user's name
    const avatarEl = document.getElementById('user-avatar-initials');
    if (avatarEl) {
        const parts = userName.trim().split(/\s+/);
        const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : userName.substring(0, 2).toUpperCase();
        avatarEl.innerText = initials;
    }
}

// Role Pre-select logic
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');

    if (roleParam) {
        // Capitalize the first letter
        const role = roleParam.charAt(0).toUpperCase() + roleParam.slice(1);

        const loginRoleSelect = document.getElementById('login-role');
        if (loginRoleSelect) {
            loginRoleSelect.value = role;
        }

        const signupRoleSelect = document.getElementById('signup-role');
        if (signupRoleSelect) {
            signupRoleSelect.value = role;
        }
    }
});

// Receiver Dashboard Request Form
const requestForm = document.getElementById('request-form');
if (requestForm) {
    requestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(requestForm);
        const title = formData.get('req-title');
        const category = formData.get('req-category');
        const target = formData.get('req-target');

        if (title && category && target) {
            alert(`Your request "${title}" for ${target} has been submitted for review! Once approved by an Admin, it will be visible to Donators.`);
            requestForm.reset();
            const modal = document.getElementById('donation-modal');
            if (modal) modal.style.display = 'none';
        }
    });
}

// Open modal from receiver large plus card
const openReceiverModalBtn = document.getElementById('open-receiver-modal');
if (openReceiverModalBtn) {
    openReceiverModalBtn.addEventListener('click', () => {
        const modal = document.getElementById('donation-modal');
        const formEl = document.getElementById('request-form');
        if (formEl) formEl.reset();
        if (modal) modal.style.display = 'block';
    });
}
