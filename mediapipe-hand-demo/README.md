# mediapipe-hand-demo/mediapipe-hand-demo/README.md

# MediaPipe Hand Tracking Demo

This project demonstrates hand tracking using MediaPipe and vanilla JavaScript. It captures the webcam feed and draws hand landmarks on top of the user's hands.

## Project Structure

```
mediapipe-hand-demo
├── src
│   ├── index.html       # HTML structure for the demo
│   ├── style.css        # Styles for the demo
│   └── app.js           # JavaScript code for hand tracking
├── package.json          # npm configuration file
└── README.md             # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mediapipe-hand-demo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Open `src/index.html` in a web browser to run the demo.

## How It Works

- The demo uses the MediaPipe library to track hand landmarks in real-time.
- The webcam feed is displayed in a video element, which is mirrored to provide a natural user experience.
- Hand landmarks are drawn on a canvas element overlaying the video feed.

## Future Enhancements

Feel free to add more features and improvements to the demo as needed!