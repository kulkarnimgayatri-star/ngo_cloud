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

// Main Donation Form Handling
const donationForm = document.getElementById('donation-form');
if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(donationForm);
        const name = formData.get('fullname');
        const email = formData.get('email');
        const ageGroup = formData.get('age-group');
        const type = formData.get('donation-type');
        const amount = formData.get('amount');

        if (name && email && ageGroup && type) {
            let message = `Thank you, ${name}! Your donation of ${type} for the ${ageGroup} category has been recorded.`;
            if (amount) {
                message += ` We've also noted your contribution of $${amount}.`;
            }
            message += ` A confirmation has been sent to ${email}.`;

            alert(message);
            donationForm.reset();
            console.log("Donation Successful:", { name, email, ageGroup, type, amount });
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
