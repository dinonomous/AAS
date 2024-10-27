// // controllers/faceController.js
// const multer = require('multer');
// const { loadVGGFaceModel, computeEmbedding, compareEmbeddings } = require('../utils/faceRecognitionUtils');

// const upload = multer({ dest: 'uploads/' });
// let model;

// // Load the VGGFace2 model once
// loadVGGFaceModel().then(loadedModel => {
//     model = loadedModel;
// });

// // Handle photo upload
// const uploadPhoto = async (req, res) => {
//     const referenceImagePath = req.file.path;
//     const referenceEmbedding = await computeEmbedding(model, referenceImagePath);
//     // Store this embedding for later comparison (in-memory, database, etc.)
    
//     // Assuming you want to store it in memory temporarily
//     req.session.referenceEmbedding = referenceEmbedding;

//     res.send('Reference photo uploaded and processed.');
// };

// // Handle face verification
// const verifyFace = async (req, res) => {
//     // Capture a frame from the video feed (pseudo-code)
//     const frame = captureVideoFrame();

//     // Compute embedding for the detected face
//     const detectedEmbedding = await computeEmbedding(model, frame);

//     // Compare embeddings
//     const distance = compareEmbeddings(req.session.referenceEmbedding, detectedEmbedding);
//     const threshold = 0.6; // Set your threshold

//     if (distance < threshold) {
//         res.send('Match found!');
//     } else {
//         res.send('No match found.');
//     }
// };

// module.exports = {
//     uploadPhoto,
//     verifyFace,
//     upload
// };
