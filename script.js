// Typewriter Effect for Hero Section
const phrases = [
    "Gen-AI Enthusiast.",
    "Aspiring AI Engineer.",
    "Video Editor."
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

    let typeSpeed = 100; // Normal typing speed

    if (isDeleting) {
        typeSpeed /= 2; // Delete faster
    }

    if (!isDeleting && letterIndex === currentPhrase.length) {
        // Pause at the end of typing the phrase
        typeSpeed = 2500;
        isDeleting = true;
    } else if (isDeleting && letterIndex === 0) {
        // Switch to the next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; // Pause briefly before typing the next word
    }

    setTimeout(type, typeSpeed);
}

// Start the typewriter effect when the document is loaded
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
        if (snapContainer.scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}
