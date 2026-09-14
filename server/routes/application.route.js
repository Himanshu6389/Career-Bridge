// ROUTES/application.route.js
import { Router } from "express";
import asyncWrap from "../utils/asyncwrap.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { isJobSeeker, isEmployer } from "../middlewares/auth.middleware.js";
import {
  applyForJob,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getMyApplications,
  getReceivedApplications,
  sendMessage,
  rateApplication,
  getApplicationStats,
  bulkUpdateApplications,
  getConversation
} from "../controllers/application.controller.js";

const router = Router();

// ============================================
// PROTECTED ROUTES (All authenticated users)
// ============================================
router.use(asyncWrap(isLoggedIn));

router.get('/', asyncWrap(getApplications));
router.get('/:applicationId', asyncWrap(getApplicationById));
router.post('/:applicationId/message', asyncWrap(sendMessage));
router.get('/:applicationId/conversation', asyncWrap(getConversation));
router.post('/:applicationId/rate', asyncWrap(rateApplication));

// ============================================
// JOB SEEKER ROUTES
// ============================================
router.post('/', asyncWrap(applyForJob));
router.get('/seeker/my-applications', asyncWrap(getMyApplications));
router.delete('/:applicationId', asyncWrap(withdrawApplication));

// ============================================
// EMPLOYER ROUTES
// ============================================
router.get('/employer/received', asyncWrap(getReceivedApplications));
router.get('/employer/stats', asyncWrap(getApplicationStats));
router.put('/:applicationId/status', asyncWrap(updateApplicationStatus));
router.put('/bulk/update', asyncWrap(bulkUpdateApplications));

export default router;
