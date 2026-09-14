// ROUTES/company.route.js
import { Router } from "express";
import asyncWrap from "../utils/asyncwrap.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { isEmployer } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getMyCompanies,
  uploadCompanyLogo,
  searchCompanies,
  getCompanyStats,
  addCompanyReview,
  getTopCompanies,
  verifyCompany
} from "../controllers/company.controller.js";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', asyncWrap(getAllCompanies));
router.get('/search', asyncWrap(searchCompanies));
router.get('/top', asyncWrap(getTopCompanies));
router.get('/:companyId', asyncWrap(getCompanyById));
router.post('/:companyId/review', asyncWrap(addCompanyReview));

// ============================================
// PROTECTED ROUTES (Employer Only)
// ============================================
router.use(asyncWrap(isLoggedIn));
router.use(asyncWrap(isEmployer));

router.post('/', asyncWrap(createCompany));
router.get('/employer/my-companies', asyncWrap(getMyCompanies));
router.put('/:companyId', asyncWrap(updateCompany));
router.delete('/:companyId', asyncWrap(deleteCompany));
router.post('/:companyId/upload-logo', upload.single('logo'), asyncWrap(uploadCompanyLogo));
router.get('/:companyId/stats', asyncWrap(getCompanyStats));

// ============================================
// ADMIN ROUTES (Future Feature)
// ============================================
// router.put('/:companyId/verify', asyncWrap(verifyCompany));

export default router;
