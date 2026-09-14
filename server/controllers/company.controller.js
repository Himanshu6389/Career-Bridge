// CONTROLLERS/company.controller.js
import Company from "../models/company.model.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Apperror from "../routes/error.util.js";
import cloudinary from "cloudinary";
import fs from 'fs/promises';

// ============================================
// 1. CREATE COMPANY (Employer Only)
// ============================================
export const createCompany = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      industry,
      companySize,
      foundedYear,
      website,
      location,
      socialLinks
    } = req.body;

    // ✅ Validation
    if (!name) {
      return next(new Apperror('Company name is required', 400));
    }

    // ✅ Check if company already exists for this user
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return next(new Apperror('Company with this name already exists', 400));
    }

    // ✅ Validate website URL if provided
    if (website) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(website)) {
        return next(new Apperror('Invalid website URL', 400));
      }
    }

    // ✅ Validate founded year
    if (foundedYear) {
      const currentYear = new Date().getFullYear();
      if (foundedYear > currentYear) {
        return next(new Apperror('Founded year cannot be in the future', 400));
      }
      if (foundedYear < 1900) {
        return next(new Apperror('Founded year must be after 1900', 400));
      }
    }

    // ✅ Create company
    const company = await Company.create({
      name,
      ownerId: userId,
      description: description || '',
      industry: industry || '',
      companySize,
      foundedYear,
      website,
      location: location || {},
      socialLinks: socialLinks || {},
      logo: {
        public_id: '',
        secure_url: ''
      },
      isVerified: false
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to create company', 500));
  }
};

// ============================================
// 2. UPLOAD COMPANY LOGO
// ============================================
export const uploadCompanyLogo = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { companyId } = req.params;

    // ✅ Validation
    if (!req.file) {
      return next(new Apperror('Logo file is required', 400));
    }

    // ✅ Find company and verify ownership
    const company = await Company.findById(companyId);
    if (!company) {
      return next(new Apperror('Company not found', 404));
    }

    if (company.ownerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to upload logo for this company', 403));
    }

    // ✅ Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return next(new Apperror('Only JPG and PNG files are allowed', 400));
    }

    // ✅ Upload to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'CareerBridge/Companies',
        resource_type: 'image',
        access_mode: 'public',
        type: 'upload',
        use_filename: true,
        unique_filename: true,
        width: 200,
        height: 200,
        crop: 'fill'
      });
    } catch (uploadError) {
      return next(new Apperror('Failed to upload logo to cloud', 500));
    }

    // ✅ Delete old logo from Cloudinary if exists
    if (company.logo && company.logo.public_id) {
      try {
        await cloudinary.v2.uploader.destroy(company.logo.public_id);
      } catch (deleteError) {
        console.log('Warning: Could not delete old logo', deleteError);
      }
    }

    // ✅ Delete local file
    try {
      await fs.unlink(req.file.path);
    } catch (deleteError) {
      console.log('Warning: Could not delete local file', deleteError);
    }

    // ✅ Update company logo
    company.logo = {
      public_id: cloudinaryResult.public_id,
      secure_url: cloudinaryResult.secure_url
    };
    await company.save();

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: company
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to upload logo', 500));
  }
};

// ============================================
// 3. GET ALL COMPANIES (Public - With Filtering)
// ============================================
export const getAllCompanies = async(req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword,
      industry,
      companySize,
      isVerified,
      sortBy = 'createdAt',
      order = '-1'
    } = req.query;

    const skip = (page - 1) * limit;

    // ✅ Build filter
    const filter = {};

    // Keyword search
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { industry: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Industry filter
    if (industry) {
      filter.industry = industry;
    }

    // Company size filter
    if (companySize) {
      filter.companySize = companySize;
    }

    // Verification filter
    if (isVerified === 'true') {
      filter.isVerified = true;
    }

    // ✅ Build sort
    const sortObject = {};
    sortObject[sortBy] = parseInt(order);

    // ✅ Execute query
    const companies = await Company.find(filter)
      .populate('ownerId', 'fullName email')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Companies retrieved successfully',
      data: companies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCompanies: total
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve companies', 500));
  }
};

// ============================================
// 4. GET SINGLE COMPANY BY ID
// ============================================
export const getCompanyById = async(req, res, next) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId)
      .populate('ownerId', 'fullName email phone');

    if (!company) {
      return next(new Apperror('Company not found', 404));
    }

    // ✅ Get total jobs posted by this company
    const totalJobs = await Job.countDocuments({ companyId });

    // ✅ Get active jobs
    const activeJobs = await Job.countDocuments({ companyId, status: 'ACTIVE' });

    res.status(200).json({
      success: true,
      message: 'Company details retrieved',
      data: {
        ...company.toObject(),
        stats: {
          totalJobs,
          activeJobs
        }
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve company', 500));
  }
};

// ============================================
// 5. GET MY COMPANIES (Employer Only)
// ============================================
export const getMyCompanies = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const companies = await Company.find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments({ ownerId: userId });

    res.status(200).json({
      success: true,
      message: 'Your companies retrieved',
      data: companies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCompanies: total
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve your companies', 500));
  }
};

// ============================================
// 6. UPDATE COMPANY (Employer Only)
// ============================================
export const updateCompany = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { companyId } = req.params;
    const updateData = req.body;

    // ✅ Find company and verify ownership
    const company = await Company.findById(companyId);
    if (!company) {
      return next(new Apperror('Company not found', 404));
    }

    if (company.ownerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to update this company', 403));
    }

    // ✅ Prevent updating certain fields
    const restrictedFields = ['ownerId', 'logo', 'isVerified', 'createdAt'];
    restrictedFields.forEach(field => delete updateData[field]);

    // ✅ Validate website URL if provided
    if (updateData.website) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(updateData.website)) {
        return next(new Apperror('Invalid website URL', 400));
      }
    }

    // ✅ Validate founded year if provided
    if (updateData.foundedYear) {
      const currentYear = new Date().getFullYear();
      if (updateData.foundedYear > currentYear) {
        return next(new Apperror('Founded year cannot be in the future', 400));
      }
    }

    // ✅ Check if name is being changed and if it's unique
    if (updateData.name && updateData.name !== company.name) {
      const existingCompany = await Company.findOne({ name: updateData.name });
      if (existingCompany) {
        return next(new Apperror('Company with this name already exists', 400));
      }
    }

    // ✅ Update company
    Object.assign(company, updateData);
    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to update company', 500));
  }
};

// ============================================
// 7. DELETE COMPANY (Employer Only)
// ============================================
export const deleteCompany = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return next(new Apperror('Company not found', 404));
    }

    if (company.ownerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to delete this company', 403));
    }

    // ✅ Check if company has active jobs
    const activeJobs = await Job.countDocuments({ companyId, status: 'ACTIVE' });
    if (activeJobs > 0) {
      return next(new Apperror('Cannot delete company with active jobs. Please close all jobs first.', 400));
    }

    // ✅ Delete logo from Cloudinary
    if (company.logo && company.logo.public_id) {
      try {
        await cloudinary.v2.uploader.destroy(company.logo.public_id);
      } catch (deleteError) {
        console.log('Warning: Could not delete logo from Cloudinary', deleteError);
      }
    }

    // ✅ Delete all jobs associated with this company
    await Job.deleteMany({ companyId });

    // ✅ Delete company
    await Company.findByIdAndDelete(companyId);

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to delete company', 500));
  }
};

// ============================================
// 8. SEARCH COMPANIES
// ============================================
export const searchCompanies = async(req, res, next) => {
  try {
    const {
      keyword,
      industry,
      companySize,
      location,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    // Keyword search
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Industry filter
    if (industry) {
      filter.industry = industry;
    }

    // Company size filter
    if (companySize) {
      filter.companySize = companySize;
    }

    // Location filter
    if (location) {
      filter['location.city'] = { $regex: location, $options: 'i' };
    }

    const companies = await Company.find(filter)
      .populate('ownerId', 'fullName email')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Companies found',
      data: companies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCompanies: total
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Search failed', 500));
  }
};

// ============================================
// 9. GET COMPANY STATISTICS (Employer Dashboard)
// ============================================
export const getCompanyStats = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { companyId } = req.params;

    // ✅ Find company
    const company = await Company.findById(companyId);
    if (!company) {
      return next(new Apperror('Company not found', 404));
    }

    if (company.ownerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to view this company statistics', 403));
    }

    // ✅ Get job statistics
    const totalJobs = await Job.countDocuments({ companyId });
    const activeJobs = await Job.countDocuments({ companyId, status: 'ACTIVE' });
    const closedJobs = await Job.countDocuments({ companyId, status: 'CLOSED' });

    // ✅ Get applicants count
    const jobs = await Job.find({ companyId });
    const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicantsCount || 0), 0);

    // ✅ Get total views
    const totalViews = jobs.reduce((sum, job) => sum + (job.viewsCount || 0), 0);

    res.status(200).json({
      success: true,
      message: 'Company statistics retrieved',
      data: {
        companyName: company.name,
        stats: {
          totalJobs,
          activeJobs,
          closedJobs,
          draftJobs: totalJobs - activeJobs - closedJobs,
          totalApplicants,
          totalViews,
          avgViewsPerJob: totalJobs > 0 ? Math.round(totalViews / totalJobs) : 0,
          avgApplicantsPerJob: totalJobs > 0 ? Math.round(totalApplicants / totalJobs) : 0
        }
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve statistics', 500));
  }
};

// ============================================
// 10. ADD COMPANY REVIEW (Optional - Future Feature)
// ============================================
export const addCompanyReview = async(req, res, next) => {
  try {
    const { companyId } = req.params;
    const { rating, comment } = req.body;

    // ✅ Validation
    if (!rating || rating < 1 || rating > 5) {
      return next(new Apperror('Rating must be between 1 and 5', 400));
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return next(new Apperror('Company not found', 404));
    }

    // ✅ Update average rating
    const totalReviews = company.rating.totalReviews || 0;
    const avgRating = company.rating.avgRating || 0;

    const newAvgRating = (avgRating * totalReviews + rating) / (totalReviews + 1);

    company.rating.avgRating = Math.round(newAvgRating * 10) / 10;
    company.rating.totalReviews = totalReviews + 1;

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: {
        avgRating: company.rating.avgRating,
        totalReviews: company.rating.totalReviews
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to add review', 500));
  }
};

// ============================================
// 11. GET TOP COMPANIES
// ============================================
export const getTopCompanies = async(req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const companies = await Company.find({ isVerified: true })
      .sort({ 'rating.avgRating': -1 })
      .limit(parseInt(limit))
      .populate('ownerId', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Top companies retrieved',
      data: companies
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve top companies', 500));
  }
};

// ============================================
// 12. VERIFY COMPANY (Admin Only - Future Feature)
// ============================================
export const verifyCompany = async(req, res, next) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return next(new Apperror('Company not found', 404));
    }

    company.isVerified = true;
    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company verified successfully',
      data: company
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to verify company', 500));
  }
};
