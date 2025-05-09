const video = document.getElementById('webcam');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// Set fixed dimensions
const WIDTH = 480;
const HEIGHT = 360;
const RECT_WIDTH = 240;
const RECT_HEIGHT = 180;

// Set canvas size
canvas.width = WIDTH;
canvas.height = HEIGHT;

// Game state
let score = 0;
let colorPositions = [
    { color: '#00FF00', name: 'green' },  // Green
    { color: '#FF0000', name: 'red' },    // Red
    { color: '#FFFF00', name: 'yellow' }, // Yellow
    { color: '#0000FF', name: 'blue' }    // Blue
];

// Score display
const scoreDiv = document.createElement('div');
scoreDiv.style.position = 'fixed';
scoreDiv.style.bottom = '20px';
scoreDiv.style.right = '20px';
scoreDiv.style.color = 'white';
scoreDiv.style.fontSize = '24px';
scoreDiv.style.fontFamily = 'Arial';
document.body.appendChild(scoreDiv);

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
                { index: 8, color: '#00FF00', name: 'green' },   // Index finger - Green
                { index: 12, color: '#FF0000', name: 'red' },    // Middle finger - Red
                { index: 16, color: '#FFFF00', name: 'yellow' }, // Ring finger - Yellow
                { index: 20, color: '#0000FF', name: 'blue' }    // Pinky - Blue
            ];
            
            // Draw landmarks
            for (let i = 0; i < landmarks.length; i++) {
                const landmark = landmarks[i];
                // Color the specific finger points
                const fingerPoint = fingerPoints.find(fp => fp.index === i);
                ctx.fillStyle = fingerPoint ? fingerPoint.color : '#808080';
                ctx.beginPath();
                ctx.arc(
                    landmark.x * canvas.width,
                    landmark.y * canvas.height,
                    4,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            }
            
            // Check for matching positions
            let matches = 0;
            fingerPoints.forEach(finger => {
                const landmark = landmarks[finger.index];
                const rectIndex = getRectangleIndex(landmark.x, landmark.y);
                if (colorPositions[rectIndex].name === finger.name) {
                    matches++;
                }
            });
            
            // Update score if all fingers match
            if (matches === 4) {
                score += 10;
            }
            
            // Update score display
            scoreDiv.textContent = `Score: ${score}`;
        });
    }
});

// Initialize webcam with explicit promise handling
async function initializeWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: WIDTH,
                height: HEIGHT
            }
        });
        
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
    } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Please allow camera access to use this demo');
    }
}

// Initialize camera after webcam is ready
async function startDemo() {
    await initializeWebcam();
    
    const camera = new Camera(video, {
        onFrame: async () => {
            await hands.send({image: video});
        },
        width: WIDTH,
        height: HEIGHT
    });
    
    camera.start();
}

// Start the demo
startDemo();