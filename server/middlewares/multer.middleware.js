// MIDDLEWARES/multer.middleware.js
import multer from 'multer';
import path from 'path';

// Set storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ✅ UPDATED: File filter (PDF + JPG + PNG)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',     // PDF
    'image/jpeg',          // JPG
    'image/png',           // PNG
    'image/jpg'            // JPG (alternative)
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
  }
};

// ✅ UPDATED: Create upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024  // ⬆️ Increased to 10MB for images
  }
});

export default upload;
