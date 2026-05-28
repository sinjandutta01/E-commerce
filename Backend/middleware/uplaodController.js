const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });  // Create the directory if it doesn't exist
}

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save the uploaded files to the 'uploads' folder
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Make the filename unique by adding a timestamp and file extension
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'));
    }
};

// Set file size limit (e.g., 5MB)
const limits = { fileSize: 5 * 1024 * 1024 };  // 5 MB

// Initialize multer with storage, fileFilter, and limits
const upload = multer({ storage, fileFilter, limits });

// Single image upload middleware for 'image' field
module.exports = upload;
