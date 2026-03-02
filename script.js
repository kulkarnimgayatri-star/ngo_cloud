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

    // Modal Handling
    const modal = document.getElementById('donation-modal');
    const openBtn = document.getElementById('open-donation-modal');
    const closeBtn = document.querySelector('.close-modal');
    // Select all "Donate Now" buttons in the community feed
    const feedButtons = document.querySelectorAll('.feed-card .btn');

    if (modal && closeBtn) {
        // Open modal via main button
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                const donationFormEl = document.getElementById('donation-form');
                if (donationFormEl) {
                    donationFormEl.reset(); // Clear name/email/amount etc.
                }

                // Explicitly reset the custom category logic
                const categorySelect = document.getElementById('donation-type');
                if (categorySelect) categorySelect.value = ''; // Reset to placeholder

                toggleOtherInput(); // Will hide the "Other" text input because value != "Other"

                modal.style.display = 'block';
            });
        }

        // Open modal via "Empower Every Generation" category links
        const categoryLinks = document.querySelectorAll('.open-donation-modal');
        const ageGroupSelect = document.getElementById('age-group');
        const ageGroupMap = {
            'children': 'children',
            'youth': 'youth',
            'adults': 'adults',
            'seniors': 'seniors'
        };
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const donationFormEl = document.getElementById('donation-form');
                if (donationFormEl) donationFormEl.reset();

                // Detect which age group from the link text
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

        // Open modal via community feed buttons
        feedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.style.display = 'block';

                // Get the title from the card
                const card = e.target.closest('.feed-card');
                if (card) {
                    const title = card.querySelector('h3').innerText;

                    // Set category select to "Other"
                    const categorySelect = document.getElementById('donation-type');
                    categorySelect.value = 'Other';

                    // Trigger the toggle function to show the input field
                    toggleOtherInput();

                    // Set the value of the 'other' input to the title
                    document.getElementById('other-donation-type').value = title;
                }
            });
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Login Form Handling
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (email && password) {
            // Detect role from filename
            const filename = window.location.pathname.split('/').pop().toLowerCase();
            let role = 'Donator';
            if (filename.includes('receiver')) role = 'Receiver';
            else if (filename.includes('worker')) role = 'Worker';
            else if (filename.includes('admin')) role = 'Admin';

            // Derive a display name from the email prefix
            const prefix = email.split('@')[0];
            const displayName = prefix
                .replace(/[._-]+/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());

            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userName', displayName);
            sessionStorage.setItem('userRole', role);
            alert(`Login successful! Welcome, ${displayName} (${role})! Redirecting to your Dashboard...`);
            window.location.href = 'home.html';
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
            // Detect role from filename to redirect correctly
            const filename = window.location.pathname.split('/').pop().toLowerCase();
            let loginUrl = 'login-donator.html';
            if (filename.includes('receiver')) loginUrl = 'login-receiver.html';
            else if (filename.includes('worker')) loginUrl = 'login-worker.html';
            else if (filename.includes('admin')) loginUrl = 'login-admin.html';

            sessionStorage.setItem('userName', name);
            alert(`Account created successfully for ${name}! Please sign in.`);
            window.location.href = loginUrl;
        }
    });
}

// Dashboard Init
if (window.location.pathname.includes('home.html')) {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        alert('Please login to access the donation hub.');
        window.location.href = 'login-donator.html';
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
