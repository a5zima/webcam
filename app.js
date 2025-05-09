const video = document.getElementById('webcam');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// Set fixed dimensions
const WIDTH = 480;
const HEIGHT = 360;
const RECT_WIDTH = WIDTH / 2;
const RECT_HEIGHT = HEIGHT / 2;

// Set canvas size
canvas.width = WIDTH;
canvas.height = HEIGHT;

// Game state
let score = 0;
let canScore = true;
let colorPositions = [
    { color: '#00FF00', name: 'green' },
    { color: '#FF0000', name: 'red' },
    { color: '#FFFF00', name: 'yellow' },
    { color: '#0000FF', name: 'blue' }
];

// Create score display
const scoreDiv = document.createElement('div');
scoreDiv.style.position = 'fixed';
scoreDiv.style.bottom = '20px';
scoreDiv.style.left = '50%';
scoreDiv.style.transform = 'translateX(-50%)';  // Center horizontally
scoreDiv.style.color = 'white';
scoreDiv.style.fontSize = '24px';
document.body.appendChild(scoreDiv);

// Create audio context and success sound
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
function playSuccessSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Show BINGO text
function showBingo() {
    const bingo = document.getElementById('bingo');
    bingo.style.opacity = '1';
    setTimeout(() => {
        bingo.style.opacity = '0';
    }, 1000);
}

// Initialize MediaPipe Hands
const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(results => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw colored rectangles
    drawColoredRectangles();
    
    if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach(landmarks => {
            // Track matching fingers
            const fingerPoints = [
                { index: 8, color: '#00FF00', name: 'green' },
                { index: 12, color: '#FF0000', name: 'red' },
                { index: 16, color: '#FFFF00', name: 'yellow' },
                { index: 20, color: '#0000FF', name: 'blue' }
            ];
            
            // Only draw tracked finger points
            fingerPoints.forEach(finger => {
                const landmark = landmarks[finger.index];
                ctx.fillStyle = finger.color;
                ctx.beginPath();
                ctx.arc(
                    landmark.x * canvas.width,
                    landmark.y * canvas.height,
                    6,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });
            
            // Check for matching positions
            let matches = 0;
            fingerPoints.forEach(finger => {
                const landmark = landmarks[finger.index];
                const rectIndex = getRectangleIndex(landmark.x, landmark.y);
                if (colorPositions[rectIndex].name === finger.name) {
                    matches++;
                }
            });
            
            // Update score if all fingers match and scoring is allowed
            if (matches === 4 && canScore) {
                score += 10;
                canScore = false;
                playSuccessSound();
                showBingo();
                // Add quick shuffle after 2 seconds
                setTimeout(shuffleColors, 2000);
            }
            //LULO
            // Update score display
            scoreDiv.textContent = `Score: ${score}`;
        });
    }
});

// Reset scoring flag when colors shuffle
const originalShuffleColors = shuffleColors;
shuffleColors = function() {
    originalShuffleColors();
    canScore = true;
};

// Function to shuffle colors
function shuffleColors() {
    for (let i = colorPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [colorPositions[i], colorPositions[j]] = [colorPositions[j], colorPositions[i]];
    }
}

// Shuffle colors every 10 seconds
setInterval(shuffleColors, 10000);

// Draw colored rectangles
function drawColoredRectangles() {
    ctx.globalAlpha = 0.5;
    
    // Draw rectangles in current color positions
    ctx.fillStyle = colorPositions[0].color;
    ctx.fillRect(0, 0, RECT_WIDTH, RECT_HEIGHT);
    
    ctx.fillStyle = colorPositions[1].color;
    ctx.fillRect(RECT_WIDTH, 0, RECT_WIDTH, RECT_HEIGHT);
    
    ctx.fillStyle = colorPositions[2].color;
    ctx.fillRect(0, RECT_HEIGHT, RECT_WIDTH, RECT_HEIGHT);
    
    ctx.fillStyle = colorPositions[3].color;
    ctx.fillRect(RECT_WIDTH, RECT_HEIGHT, RECT_WIDTH, RECT_HEIGHT);
    
    ctx.globalAlpha = 1.0;
}

// Check if point is in rectangle
function isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
    return x >= rectX && x <= rectX + rectWidth && 
           y >= rectY && y <= rectY + rectHeight;
}

// Get rectangle index for a point
function getRectangleIndex(x, y) {
    const normalizedX = x * WIDTH;
    const normalizedY = y * HEIGHT;
    
    if (normalizedY < RECT_HEIGHT) {
        return normalizedX < RECT_WIDTH ? 0 : 1;
    } else {
        return normalizedX < RECT_WIDTH ? 2 : 3;
    }
}

// Initialize webcam
async function initializeWebcam() {
    try {
        // Request webcam access explicitly first
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: WIDTH,
                height: HEIGHT
            },
            audio: false
        });
        
        // Set video source and wait for it to be ready
        video.srcObject = stream;
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve);
            };
        });

        // Only start MediaPipe camera after video is ready
        const camera = new Camera(video, {
            onFrame: async () => {
                await hands.send({image: video});
            },
            width: WIDTH,
            height: HEIGHT
        });

        await camera.start();
        
        console.log('Webcam and MediaPipe initialized successfully');
    } catch (error) {
        console.error('Error initializing webcam:', error);
        alert('Please allow camera access to use this demo.\nIf denied, please reset permissions and reload the page.');
    }
}

// Start everything only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting webcam initialization...');
    initializeWebcam();
});