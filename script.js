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

// Toggle Other Donation Input
function toggleOtherInput() {
    const select = document.getElementById('donation-type');
    const otherGroup = document.getElementById('other-donation-group');
    const otherInput = document.getElementById('other-donation-type');

    if (select.value === 'Other') {
        otherGroup.style.display = 'block';
        otherInput.required = true;
    } else {
        otherGroup.style.display = 'none';
        otherInput.required = false;
        otherInput.value = '';
    }
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
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            alert(`Login successful! Redirecting to your Donation Dashboard...`);
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
            sessionStorage.setItem('userName', name);
            alert(`Account created successfully for ${name}! Please sign in.`);
            window.location.href = 'login.html';
        }
    });
}

// Dashboard Init
if (window.location.pathname.includes('home.html')) {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        alert('Please login to access the donation hub.');
        window.location.href = 'login.html';
    }

    const userName = sessionStorage.getItem('userName') || 'Supporter';
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay) nameDisplay.innerText = userName;
}
