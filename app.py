from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import base64
from PIL import Image
import io
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# Load the trained model
model = tf.keras.models.load_model('digit_model.h5')

# Build the model by passing a sample input
sample_input = np.zeros((1, 784))
_ = model(sample_input)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get image data from request
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data received'}), 400
            
        image_data = data['image']
        
        try:
            # Remove the data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Preprocess image
            image = image.convert('L').resize((28, 28))
            image_array = np.array(image).reshape(1, 784) / 255.0
            
            # Get prediction using the main model
            prediction = model.predict(image_array)
            
            # Get intermediate activations using intermediate models
            activations = []
            current_input = image_array
            
            for layer in model.layers:
                current_output = layer(current_input)
                activations.append(current_output.numpy())
                current_input = current_output
            
            # Format response
            response_data = {
                'prediction': prediction.tolist(),
                'activations': [act.tolist() for act in activations]
            }
            
            return jsonify(response_data)
            
        except Exception as e:
            app.logger.error(f"Error processing image: {str(e)}")
            return jsonify({'error': f'Error processing image: {str(e)}'}), 500
            
    except Exception as e:
        app.logger.error(f"Server error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)