// Firebase Configuration (same as Website A)
const firebaseConfig = {
    apiKey: "AIzaSyC1234567890ABCDEFGHIJKLMNOPQRST",
    authDomain: "shivleela-letters.firebaseapp.com",
    databaseURL: "https://shivleela-letters-default-rtdb.firebaseio.com",
    projectId: "shivleela-letters",
    storageBucket: "shivleela-letters.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefg1234567890"
};

// Initialize Firebase
let db;
let initialized = false;

function initializeFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        initialized = true;
        console.log("Firebase initialized successfully");
    } catch (error) {
        console.log("Firebase config not set. Using local storage.");
    }
}

initializeFirebase();

// DOM Elements
const envelopeSection = document.getElementById('envelopeSection');
const letterContent = document.getElementById('letterContent');
const errorSection = document.getElementById('errorSection');
const loadingSection = document.getElementById('loadingSection');
const openBtn = document.getElementById('openBtn');
const backBtn = document.getElementById('backBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const goHomeBtn = document.getElementById('goHomeBtn');

let currentLetter = null;
let letterId = null;

// Get letter ID from URL
function getLetterIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Load letter on page load
window.addEventListener('DOMContentLoaded', () => {
    letterId = getLetterIdFromUrl();
    
    if (!letterId) {
        showError('No letter ID provided');
        return;
    }
    
    loadLetter(letterId);
});

// Load letter from database
async function loadLetter(id) {
    try {
        loadingSection.classList.remove('hidden');
        
        let letterData = null;
        
        if (initialized) {
            // Load from Firebase
            const snapshot = await db.ref('letters/' + id).get();
            if (snapshot.exists()) {
                letterData = snapshot.val();
            }
        } else {
            // Load from localStorage
            const stored = localStorage.getItem('letter_' + id);
            if (stored) {
                letterData = JSON.parse(stored);
            }
        }
        
        if (letterData) {
            currentLetter = letterData;
            displayEnvelope();
        } else {
            showError('Letter not found');
        }
        
        loadingSection.classList.add('hidden');
        
    } catch (error) {
        console.error('Error loading letter:', error);
        showError('Error loading letter. Please try again.');
        loadingSection.classList.add('hidden');
    }
}

// Display envelope
function displayEnvelope() {
    envelopeSection.classList.remove('hidden');
    letterContent.classList.add('hidden');
    errorSection.classList.add('hidden');
}

// Display letter content
function displayLetter() {
    if (!currentLetter) return;
    
    // Sender name
    document.getElementById('senderName').textContent = currentLetter.name;
    
    // Message
    document.getElementById('messageContent').textContent = currentLetter.message;
    
    // Photo
    if (currentLetter.photo) {
        document.getElementById('photoSection').classList.remove('hidden');
        document.getElementById('photoDisplay').innerHTML = `<img src="${currentLetter.photo}" alt="Letter photo">`;
    }
    
    // Audio
    if (currentLetter.audio) {
        document.getElementById('audioSection').classList.remove('hidden');
        document.getElementById('audioDisplay').innerHTML = `<audio controls src="${currentLetter.audio}"></audio>`;
    }
    
    // Date
    const date = new Date(currentLetter.createdAt);
    const formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('letterDate').textContent = `Created: ${formattedDate}`;
    
    envelopeSection.classList.add('hidden');
    letterContent.classList.remove('hidden');
    errorSection.classList.add('hidden');
}

// Show error
function showError(message) {
    envelopeSection.classList.add('hidden');
    letterContent.classList.add('hidden');
    errorSection.classList.remove('hidden');
}

// Open envelope button click
openBtn.addEventListener('click', () => {
    const flap = document.querySelector('.envelope-flap');
    const text = document.querySelector('.envelope-text');
    
    flap.classList.add('open');
    text.classList.add('hidden');
    
    setTimeout(() => {
        displayLetter();
    }, 800);
});

// Back button click
backBtn.addEventListener('click', () => {
    displayEnvelope();
    
    // Reset envelope animation
    const flap = document.querySelector('.envelope-flap');
    const text = document.querySelector('.envelope-text');
    flap.classList.remove('open');
    text.classList.remove('hidden');
});

// Go home button click
goHomeBtn.addEventListener('click', () => {
    window.location.href = 'https://ashishthombre9761-lgtm.github.io/Shivleela-/';
});

// Download letter as PDF/text
downloadBtn.addEventListener('click', () => {
    if (!currentLetter) return;
    
    let content = `LETTER\n\n`;
    content += `From: ${currentLetter.name}\n\n`;
    content += `Message:\n${currentLetter.message}\n\n`;
    content += `Created: ${new Date(currentLetter.createdAt).toLocaleString()}\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `letter-${currentLetter.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

// Share button click
shareBtn.addEventListener('click', () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Check out this letter from ' + currentLetter.name,
            text: 'Open this beautiful letter with animation',
            url: shareUrl
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link copied to clipboard!');
        });
    }
});

// Print letter
function printLetter() {
    window.print();
}
