const CHATBOT_API_URL = 'https://gokul-s-portfolio.onrender.com/chat';

const EMAILJS_CONFIG = {
    serviceId: 'service_azcyx5n',
    templateId: 'template_c2tm5py',
    publicKey: 'gLL7Goac-tIRTVzeA'
};

const MOBILE_NAV_CLOSE_DELAY = 2000;

// Typewriter Effect for Hero Section
const phrases = [
    'Gen-AI Enthusiast.',
    'Aspiring AI Engineer.',
    'Video Editor.'
];

let phraseIndex = 0;
let letterIndex = 0;
let currentText = '';
let isDeleting = false;
const typewriterElement = document.getElementById('typewriter');

function type() {
    if (!typewriterElement) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        currentText = currentPhrase.substring(0, letterIndex - 1);
        letterIndex--;
    } else {
        currentText = currentPhrase.substring(0, letterIndex + 1);
        letterIndex++;
    }

    typewriterElement.textContent = currentText;

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && letterIndex === currentPhrase.length) {
        typeSpeed = 2500;
        isDeleting = true;
    } else if (isDeleting && letterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(type, 1000);
});

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
}

// Navbar Blur on Scroll
const snapContainer = document.querySelector('.snap-container');
const header = document.querySelector('.header');

if (snapContainer && header) {
    snapContainer.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', snapContainer.scrollTop > 50);
    });
}

// Mobile Navigation
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
let mobileNavCloseTimer;

function setMobileNavState(isOpen) {
    if (!mobileMenuBtn || !mobileNav) return;

    clearTimeout(mobileNavCloseTimer);
    mobileMenuBtn.classList.toggle('open', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    mobileNav.classList.toggle('open', isOpen);

    if (isOpen) {
        mobileNav.classList.remove('closing');
    } else {
        mobileNav.classList.add('closing');
        window.setTimeout(() => mobileNav.classList.remove('closing'), 450);
    }
}

function closeMobileNav(delay = 0) {
    if (!mobileNav?.classList.contains('open')) return;

    clearTimeout(mobileNavCloseTimer);
    mobileNavCloseTimer = window.setTimeout(() => {
        setMobileNavState(false);
    }, delay);
}

window.closeMobileNav = closeMobileNav;

if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
        setMobileNavState(!mobileNav.classList.contains('open'));
    });

    mobileNav.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                event.preventDefault();
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, '', targetId);
            }

            closeMobileNav(MOBILE_NAV_CLOSE_DELAY);
        });
    });
}

// Chatbot Logic
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotMessages = document.getElementById('chatbot-messages');

if (chatbotToggle && chatbotWindow && chatbotClose) {
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.remove('hidden');
        chatbotInput?.focus();
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.add('hidden');
    });
}

function addMessageToUI(text, className) {
    if (!chatbotMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', className);
    const p = document.createElement('p');
    p.textContent = text;
    msgDiv.appendChild(p);
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showTypingIndicator() {
    if (!chatbotMessages) return;

    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-message', 'bot-message');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.innerHTML = '<p>...</p>';
    chatbotMessages.appendChild(typingIndicator);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTypingIndicator() {
    document.getElementById('typing-indicator')?.remove();
}

async function sendMessage() {
    if (!chatbotInput || !chatbotSend) return;

    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessageToUI(message, 'user-message');
    chatbotInput.value = '';
    chatbotSend.disabled = true;
    showTypingIndicator();

    try {
        const response = await fetch(CHATBOT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: message })
        });

        if (!response.ok) {
            throw new Error(`Chatbot request failed with status ${response.status}`);
        }

        const data = await response.json();
        addMessageToUI(data.response || 'I could not generate an answer.', 'bot-message');
    } catch (error) {
        console.error('[Chatbot] Request failed:', error);
        addMessageToUI('Sorry, I am currently offline. Please ensure the backend is running.', 'bot-message');
    } finally {
        removeTypingIndicator();
        chatbotSend.disabled = false;
        chatbotInput.focus();
    }
}

if (chatbotSend && chatbotInput) {
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// EmailJS Contact Form
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');
let isEmailSubmitting = false;

function setFormStatus(message, state = '') {
    if (!formStatus) return;

    formStatus.textContent = message;
    formStatus.className = `form-status ${state}`.trim();
}

function getTrimmedField(form, fieldName) {
    return form.elements[fieldName]?.value.trim() || '';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactForm(form) {
    const fromName = getTrimmedField(form, 'from_name');
    const fromEmail = getTrimmedField(form, 'from_email');
    const message = getTrimmedField(form, 'message');

    if (fromName.length < 2) {
        return 'Please enter your name.';
    }

    if (!isValidEmail(fromEmail)) {
        return 'Please enter a valid email address.';
    }

    if (message.length < 10) {
        return 'Please write a message with at least 10 characters.';
    }

    return '';
}

function hasEmailJsConfig() {
    return Boolean(EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.publicKey);
}

if (window.emailjs && EMAILJS_CONFIG.publicKey) {
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    console.info('[EmailJS] SDK initialized.');
} else {
    console.warn('[EmailJS] Public key is not configured yet.');
}

if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (isEmailSubmitting) {
            console.warn('[EmailJS] Duplicate submission prevented.');
            return;
        }

        const validationError = validateContactForm(contactForm);
        if (validationError) {
            setFormStatus(validationError, 'error');
            console.warn('[EmailJS] Validation failed:', validationError);
            return;
        }

        if (!window.emailjs || !hasEmailJsConfig()) {
            setFormStatus('Contact form is not configured yet. Please email me directly.', 'error');
            console.error('[EmailJS] Missing SDK or config:', {
                hasSdk: Boolean(window.emailjs),
                hasServiceId: Boolean(EMAILJS_CONFIG.serviceId),
                hasTemplateId: Boolean(EMAILJS_CONFIG.templateId),
                hasPublicKey: Boolean(EMAILJS_CONFIG.publicKey)
            });
            return;
        }

        isEmailSubmitting = true;
        submitBtn.disabled = true;
        const originalButtonText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        setFormStatus('Sending your message...', 'loading');

        const templateParams = {
            from_name: getTrimmedField(contactForm, 'from_name'),
            name: getTrimmedField(contactForm, 'from_name'),
            user_name: getTrimmedField(contactForm, 'from_name'),
            from_email: getTrimmedField(contactForm, 'from_email'),
            email: getTrimmedField(contactForm, 'from_email'),
            user_email: getTrimmedField(contactForm, 'from_email'),
            reply_to: getTrimmedField(contactForm, 'from_email'),
            message: getTrimmedField(contactForm, 'message')
        };

        try {
            console.info('[EmailJS] Sending contact form...');
            await window.emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                templateParams
            );

            console.info('[EmailJS] Message sent successfully.');
            contactForm.reset();
            setFormStatus('Message sent successfully. I will get back to you soon.', 'success');
        } catch (error) {
            console.error('[EmailJS] Send failed:', error);
            const errorText = error?.text || error?.message || 'Please check your EmailJS service, template, and public key.';
            setFormStatus(`Email failed: ${errorText}`, 'error');
        } finally {
            isEmailSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = originalButtonText;
        }
    });
}
