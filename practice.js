const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
    '!': '-.-.--', ' ': '..--'
};

// Create reverse mapping for Morse to English
const reverseMorseCode = Object.fromEntries(
    Object.entries(morseCode).map(([key, value]) => [value, key])
);

// DOM elements
const currentInput = document.getElementById('current-input');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');

// Audio context and settings
let audioContext = null;
const dotDuration = 100;
const dashDuration = dotDuration * 3;
const letterTimeout = 300; // Time to wait before converting to letter

let currentMorse = '';
let lastKeyTime = 0;
let letterTimer = null;
let isPlaying = false;
let soundQueue = [];

// Initialize audio context
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play a beep sound
function playBeep(duration) {
    return new Promise((resolve) => {
        initAudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);

        setTimeout(resolve, duration);
    });
}

// Process sound queue
async function processSoundQueue() {
    if (isPlaying || soundQueue.length === 0) return;
    
    isPlaying = true;
    while (soundQueue.length > 0) {
        const duration = soundQueue.shift();
        await playBeep(duration);
    }
    isPlaying = false;
}

// Handle morse code input
function handleMorseInput(symbol) {
    // Clear previous timer
    if (letterTimer) {
        clearTimeout(letterTimer);
    }

    // Add the symbol
    currentMorse += symbol;
    currentInput.textContent = currentMorse;
    
    // Add sound to queue and process
    soundQueue.push(symbol === '.' ? dotDuration : dashDuration);
    processSoundQueue();

    // Update input text
    inputText.value = inputText.value + symbol;

    // Set timer for letter conversion
    letterTimer = setTimeout(() => {
        if (currentMorse in reverseMorseCode) {
            const letter = reverseMorseCode[currentMorse];
            outputText.value += letter;
        }
        // Always add space and reset input, even if the code was invalid
        currentMorse = '';
        currentInput.textContent = '';
        inputText.value += ' ';
    }, letterTimeout);
}

// Clear all input fields
function clearInput() {
    currentMorse = '';
    currentInput.textContent = '';
    inputText.value = '';
    outputText.value = '';
    soundQueue = [];
    if (letterTimer) {
        clearTimeout(letterTimer);
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
document.addEventListener('keydown', (event) => {
    if (event.key === '.' || event.key === '-') {
        event.preventDefault();
        handleMorseInput(event.key);
    }
});

// Clear button event listener
document.getElementById('clear-btn').addEventListener('click', clearInput);

// Initialize the guide when page loads
createMorseGuide();
