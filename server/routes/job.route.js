// ROUTES/job.route.js
import { Router } from "express";
import asyncWrap from "../utils/asyncwrap.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { isEmployer, isJobSeeker } from "../middlewares/auth.middleware.js";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getSimilarJobs,
  trackJobView,
  getSavedJobs,
  saveJob,
  unsaveJob,
  searchJobs,
  publishJob,
  closeJob,
  getJobStats
} from "../controllers/job.controller.js";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', asyncWrap(getAllJobs));
router.get('/search', asyncWrap(searchJobs));
router.get('/similar', asyncWrap(getSimilarJobs));
router.get('/:jobId', asyncWrap(getJobById));

// ============================================
// PROTECTED ROUTES (All authenticated users)
// ============================================
router.use(asyncWrap(isLoggedIn));

router.post('/:jobId/view', asyncWrap(trackJobView));

// ============================================
// JOB SEEKER ROUTES
// ============================================
router.get('/seeker/saved', asyncWrap(getSavedJobs));
router.post('/:jobId/save', asyncWrap(saveJob));
router.delete('/:jobId/unsave', asyncWrap(unsaveJob));

// ============================================
// EMPLOYER ONLY ROUTES
// ============================================
router.use(asyncWrap(isEmployer));

router.post('/', asyncWrap(createJob));
router.get('/employer/my-jobs', asyncWrap(getMyJobs));
router.get('/employer/stats', asyncWrap(getJobStats));
router.put('/:jobId', asyncWrap(updateJob));
router.put('/:jobId/publish', asyncWrap(publishJob));
router.put('/:jobId/close', asyncWrap(closeJob));
router.delete('/:jobId', asyncWrap(deleteJob));

export default router;
