# Real-Time Digit Recognition with Neural Network Visualization

An interactive web application that visualizes neural network behavior in real-time as users draw digits. The application shows live network activations, confidence metrics, and predictions as you draw!

![Demo](assets/HV-LA-demo.gif)

## Project Structure
```
project-root/
├── digit-recognition-ui/     # React Frontend
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── venv/                     # Python virtual environment
├── app.py                    # Flask backend server
├── digit_model.h5            # Trained neural network model
└── train_model.py           # Script to train the model
```

## Features
- Real-time digit recognition while drawing
- Live visualization of neural network activations
- Dynamic confidence metrics and entropy calculation
- Interactive canvas for digit drawing
- Network architecture visualization with neuron activations
- Confidence distribution chart

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Flask (Python)
- Machine Learning: TensorFlow
- Dataset: MNIST

## System Requirements

### Minimum Requirements
- CPU: Dual-core processor (2.0 GHz or higher)
- RAM: 4GB
- GPU: Not required, but can improve performance
- Storage: 500MB free space

### Recommended Requirements
- CPU: Quad-core processor (2.5 GHz or higher)
- RAM: 8GB
- GPU: Any dedicated GPU
- Storage: 1GB free space

### Software Prerequisites
- Node.js (v14 or higher)
- Python (3.8 or higher)
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, or Edge recommended)

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/champikadilshan/Real-Time-Digit-Recognition-with-Neural-Network-Visualization.git
cd Real-Time-Digit-Recognition-with-Neural-Network-Visualization
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install flask flask-cors tensorflow pillow numpy

# Start the Flask server
python app.py
```
The backend will start at `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to React project directory
cd digit-recognition-ui

# Install Node dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be available at `http://localhost:5173`

## Performance Configuration

### Frame Rate Control
The application runs at 30 FPS by default for real-time predictions. You can adjust this in `App.jsx`:

```javascript
// In App.jsx, find this section:
if (now - lastPredictTimeRef.current < 33) { // 33ms ≈ 30 FPS
  predictTimeoutRef.current = requestAnimationFrame(predictDrawing);
  return;
}
```

To modify the frame rate:
- For 60 FPS: Change `33` to `16`
- For 24 FPS: Change `33` to `42`
- For 15 FPS: Change `33` to `67`

Lower FPS will reduce CPU usage but make predictions less smooth. Higher FPS will be smoother but require more processing power.

### Performance Tips
- If you experience lag, try reducing the FPS
- Close other resource-intensive applications while running
- For better performance on lower-end systems, consider:
  1. Reducing the canvas size in `App.jsx`
  2. Increasing the prediction interval
  3. Running in a dedicated browser window

## Usage
1. Make sure both backend (Flask) and frontend (React) servers are running
2. Open your browser and navigate to `http://localhost:5173`
3. Use your mouse to draw a digit (0-9) on the canvas
4. Watch in real-time as the neural network:
   - Processes your drawing
   - Updates activation visualizations
   - Shows confidence levels for each digit
   - Displays the prediction

## Model Architecture
- Input Layer: 784 neurons (28x28 pixels)
- Hidden Layer 1: 128 neurons with ReLU activation
- Hidden Layer 2: 64 neurons with ReLU activation
- Output Layer: 10 neurons with Softmax activation
- Dropout: 0.2 for regularization

## Training the Model
If you want to retrain the model:
```bash
# Make sure you're in the root directory and virtual environment is activated
python train_model.py
```
This will:
1. Load the MNIST dataset
2. Train the model for 5 epochs
3. Save the trained model as 'digit_model.h5'

## Troubleshooting

### Common Issues and Solutions

1. High CPU Usage
   - Reduce FPS as described in Performance Configuration
   - Check if other browser tabs are consuming resources
   - Ensure your system meets the minimum requirements

2. Delayed Predictions
   - Check if both frontend and backend servers are running
   - Verify your CPU isn't throttled due to power settings
   - Try reducing the canvas size or prediction frequency

3. Browser Performance
   - Chrome/Firefox generally offer best performance
   - Enable hardware acceleration in your browser
   - Close unnecessary browser tabs and extensions

4. Backend Issues
   - Ensure TensorFlow is properly installed
   - Check if CUDA is available for GPU acceleration
   - Verify Python virtual environment is activated

## License
This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments
- MNIST Dataset
- TensorFlow Team
- React.js Community
