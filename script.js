const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
    '!': '-.-.--', ' ': ' '
};

// Create reverse mapping for Morse to English
const reverseMorseCode = Object.fromEntries(
    Object.entries(morseCode).map(([key, value]) => [value, key])
);

// Audio context and settings for Morse code sound
let audioContext = null;
const dotDuration = 100;
const dashDuration = dotDuration * 3;
const pauseDuration = dotDuration;
const frequency = 600;

// DOM elements
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const toMorseBtn = document.getElementById('to-morse');
const toEnglishBtn = document.getElementById('to-english');
const playMorseBtn = document.getElementById('play-morse');

// Convert English to Morse code
function toMorse(text) {
    return text.toUpperCase()
        .split('')
        .map(char => morseCode[char] || char)
        .join(' ');
}

// Convert Morse code to English
function toEnglish(morse) {
    return morse.split(' ')
        .map(code => reverseMorseCode[code] || code)
        .join('');
}

// Initialize audio context
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play a beep sound
function playBeep(duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Play Morse code sound
async function playMorseSound(morseText) {
    initAudioContext();
    let currentTime = audioContext.currentTime;
    
    for (const symbol of morseText) {
        if (symbol === '.') {
            playBeep(dotDuration);
            await new Promise(resolve => setTimeout(resolve, dotDuration + pauseDuration));
        } else if (symbol === '-') {
            playBeep(dashDuration);
            await new Promise(resolve => setTimeout(resolve, dashDuration + pauseDuration));
        } else if (symbol === ' ') {
            await new Promise(resolve => setTimeout(resolve, pauseDuration * 3));
        }
    }
}

// Create Morse code guide table
function createMorseGuide() {
    const morseTable = document.getElementById('morse-table');
    for (const [char, code] of Object.entries(morseCode)) {
        if (char === ' ') continue;
        const item = document.createElement('div');
        item.className = 'morse-item';
        item.textContent = `${char}: ${code}`;
        morseTable.appendChild(item);
    }
}

// Event listeners
toMorseBtn.addEventListener('click', () => {
    const input = inputText.value;
    outputText.value = toMorse(input);
});

toEnglishBtn.addEventListener('click', () => {
    const input = inputText.value;
    outputText.value = toEnglish(input);
});

playMorseBtn.addEventListener('click', async () => {
    const morseText = outputText.value.replace(/[^.-\s]/g, '');
    await playMorseSound(morseText);
});

// Initialize the guide when page loads
createMorseGuide();
