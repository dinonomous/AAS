// // utils/faceRecognitionUtils.js
// const tf = require('@tensorflow/tfjs-node');
// const fs = require('fs');
// const path = require('path');

// // Load the VGGFace2 model
// async function loadVGGFaceModel() {
//     const modelPath = 'file://path/to/vggface2/model.json'; // Update with your model path
//     const model = await tf.loadGraphModel(modelPath);
//     console.log('VGGFace2 model loaded successfully.');
//     return model;
// }

// // Preprocess the image and compute its embedding
// async function computeEmbedding(model, imagePath) {
//     // Load image from the file system
//     const imageBuffer = fs.readFileSync(imagePath);
//     const imageTensor = tf.node.decodeImage(imageBuffer);

//     // Resize the image to match model input shape
//     const resizedImage = tf.image.resizeBilinear(imageTensor, [224, 224]);
//     const normalizedImage = resizedImage.div(255.0).expandDims(0); // Normalize to [0,1] and add batch dimension

//     // Compute the embedding
//     const embedding = model.predict(normalizedImage);
//     const embeddingArray = await embedding.array(); // Convert tensor to array

//     return embeddingArray[0]; // Return the first (and only) item
// }

// // Compare two embeddings using Euclidean distance
// function compareEmbeddings(embedding1, embedding2) {
//     const distance = tf.losses.euclideanDistance(tf.tensor1d(embedding1), tf.tensor1d(embedding2));
//     return distance.arraySync(); // Convert tensor to scalar value
// }

// module.exports = {
//     loadVGGFaceModel,
//     computeEmbedding,
//     compareEmbeddings
// };
