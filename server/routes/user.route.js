// ROUTES/user.route.js
import { Router } from "express";
import asyncWrap from "../utils/asyncwrap.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  changePassword, 
  updateProfile,
  updateSocialLinks,
  toggleProfileVisibility,
  uploadResume,
  getMyResumes,
  deleteResume,
  deleteResumeItem,
  updateResumeItem,
  bulkUpdateResume,
  updateResumeData,
  setDefaultResume,
  getResumeById
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.post('/register', asyncWrap(register));
router.post('/login', asyncWrap(login));

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================
router.use(asyncWrap(isLoggedIn));  // All routes below require login

router.get('/logout', asyncWrap(logout));
router.get('/profile', asyncWrap(getProfile));

router.put('/update-profile', asyncWrap(updateProfile));
router.post('/change-password', asyncWrap(changePassword));
router.put('/social-links', asyncWrap(updateSocialLinks));
router.put('/toggle-visibility', asyncWrap(toggleProfileVisibility));

// ============================================
// RESUME ROUTES
// ============================================

router.post('/resume/upload', upload.single('fileDetails'), asyncWrap(uploadResume));
router.get('/resume/', asyncWrap(getMyResumes));
router.get('/resume/:resumeId', asyncWrap(getResumeById));
router.delete('/resume/:resumeId', asyncWrap(deleteResume));

// ============================================
// SET DEFAULT RESUME
// ============================================
router.put('/resume/:resumeId/set-default', asyncWrap(setDefaultResume));

// ============================================
// UPDATE RESUME DATA (Skills, Experience, Education)
// ============================================
router.post('/resume/:resumeId/update-data', asyncWrap(updateResumeData));
router.put('/resume/:resumeId/bulk-update', asyncWrap(bulkUpdateResume));

// ============================================
// UPDATE INDIVIDUAL ITEMS
// ============================================
router.put('/resume/:resumeId/:itemType/:itemId', asyncWrap(updateResumeItem));
router.delete('/resume/:resumeId/:itemType/:itemId', asyncWrap(deleteResumeItem));

export default router;
