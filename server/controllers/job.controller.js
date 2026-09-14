// CONTROLLERS/job.controller.js
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import Application from "../models/application.model.js";
import Apperror from "../routes/error.util.js";

// ============================================
// 1. CREATE JOB (Employer Only) - FIXED
// ============================================
export const createJob = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      companyId,
      jobType,
      category,
      skillsRequired,
      experienceLevel,
      minimumExperience,
      salary,
      locations,
      closingDate,
      tags,
      isFeatured
    } = req.body;

    // ✅ Validation - Check required fields
    if (!title || !description || !companyId || !jobType || !category || !experienceLevel || !closingDate) {
      return next(new Apperror('Please provide all required fields', 400));
    }

    // ✅ Validate description length
    if (description.length < 100) {
      return next(new Apperror('Description must be at least 100 characters', 400));
    }

    // ✅ Validate closingDate is in future
    const closingDateObj = new Date(closingDate);
    if (closingDateObj <= new Date()) {
      return next(new Apperror('Closing date must be in the future', 400));
    }

    // ✅ Verify company belongs to employer - FIXED: Use ownerId instead of userId
    const company = await Company.findOne({ _id: companyId, ownerId: userId });
    if (!company) {
      return next(new Apperror('Company not found or you do not own this company', 404));
    }

    // ✅ Validate salary if provided
    if (salary) {
      if (salary.min && salary.max && salary.min > salary.max) {
        return next(new Apperror('Minimum salary cannot be greater than maximum salary', 400));
      }
    }

    // ✅ Create job
    const job = await Job.create({
      title,
      description,
      employerId: userId,
      companyId,
      jobType,
      category,
      skillsRequired: skillsRequired || [],
      experienceLevel,
      minimumExperience: minimumExperience || 0,
      salary: salary || {},
      locations: locations || [],
      closingDate,
      tags: tags || [],
      isFeatured: isFeatured || false,
      status: 'DRAFT'  // Jobs start as draft
    });

    // ✅ Populate company info
    await job.populate('companyId', 'name logo');
    await job.populate('employerId', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Job created successfully (Status: DRAFT)',
      data: job
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to create job', 500));
  }
};

// ============================================
// 2. GET ALL JOBS (Public - With Filtering)
// ============================================
// ============================================
// 2. GET ALL JOBS (Public - With Filtering) - FIXED
/// ============================================
// 2. GET ALL JOBS (Simple - No Filters)
// ============================================
export const getAllJobs = async(req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // ✅ Simple filter - only get ACTIVE jobs
    // const filter = { status: 'ACTIVE' };

    // ✅ Execute query
    const jobs = await Job.find()
      .populate('companyId', 'name logo')
      .populate('employerId', 'fullName email')
      .sort({ postedDate: -1 })  // Most recent first
      .skip(skip)
      .limit(parseInt(limit));

    // ✅ Get total count
    const total = await Job.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        jobsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get All Jobs Error:', error);
    return next(new Apperror(error.message || 'Failed to retrieve jobs', 500));
  }
};



// ============================================
// 3. GET SINGLE JOB BY ID
// ============================================
export const getJobById = async(req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('companyId', 'name logo description industry website')
      .populate('employerId', 'fullName email phone');

    if (!job) {
      return next(new Apperror('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Job details retrieved',
      data: job
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve job', 500));
  }
};

// ============================================
// 4. GET MY JOBS (Employer Only)
// ============================================
export const getMyJobs = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, sortBy = 'postedDate' } = req.query;

    const skip = (page - 1) * limit;

    // ✅ Build filter
    const filter = { employerId: userId };
    if (status) {
      filter.status = status;
    }

    // ✅ Get jobs
    const jobs = await Job.find(filter)
      .populate('companyId', 'name logo')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Your jobs retrieved',
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve your jobs', 500));
  }
};

// ============================================
// 5. UPDATE JOB (Employer Only)
// ============================================
export const updateJob = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const updateData = req.body;

    // ✅ Find job and verify ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new Apperror('Job not found', 404));
    }

    if (job.employerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to update this job', 403));
    }

    // ✅ Don't allow updating certain fields
    const restrictedFields = ['employerId', 'companyId', 'applicantsCount', 'viewsCount', 'postedDate'];
    restrictedFields.forEach(field => delete updateData[field]);

    // ✅ Validate closing date if provided
    if (updateData.closingDate) {
      const closingDateObj = new Date(updateData.closingDate);
      if (closingDateObj <= new Date()) {
        return next(new Apperror('Closing date must be in the future', 400));
      }
    }

    // ✅ Validate salary if provided
    if (updateData.salary) {
      if (updateData.salary.min && updateData.salary.max && updateData.salary.min > updateData.salary.max) {
        return next(new Apperror('Minimum salary cannot be greater than maximum salary', 400));
      }
    }

    // ✅ Update job
    Object.assign(job, updateData);
    await job.save();

    await job.populate('companyId', 'name logo');
    await job.populate('employerId', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to update job', 500));
  }
};

// ============================================
// 6. DELETE JOB (Employer Only)
// ============================================
export const deleteJob = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new Apperror('Job not found', 404));
    }

    if (job.employerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to delete this job', 403));
    }

    // ✅ Delete all applications for this job
    await Application.deleteMany({ jobId });

    // ✅ Delete job
    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: 'Job and all its applications deleted successfully'
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to delete job', 500));
  }
};

// ============================================
// 7. TRACK JOB VIEW (Authenticated Users)
// ============================================
export const trackJobView = async(req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new Apperror('Job not found', 404));
    }

    // ✅ Increment view count
    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job view tracked',
      viewsCount: job.viewsCount
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to track view', 500));
  }
};

// ============================================
// 8. GET SIMILAR JOBS
// ============================================
export const getSimilarJobs = async(req, res, next) => {
  try {
    const { jobId, limit = 5 } = req.query;

    if (!jobId) {
      return next(new Apperror('Job ID is required', 400));
    }

    // ✅ Find the reference job
    const referenceJob = await Job.findById(jobId);
    if (!referenceJob) {
      return next(new Apperror('Job not found', 404));
    }

    // ✅ Find similar jobs
    const similarJobs = await Job.find({
      _id: { $ne: jobId },
      status: 'ACTIVE',
      $or: [
        { category: referenceJob.category },
        { skillsRequired: { $in: referenceJob.skillsRequired } },
        { experienceLevel: referenceJob.experienceLevel }
      ]
    })
      .populate('companyId', 'name logo')
      .populate('employerId', 'fullName')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Similar jobs retrieved',
      data: similarJobs
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve similar jobs', 500));
  }
};

// ============================================
// 9. SAVE JOB (Job Seeker Only)
// ============================================
export const saveJob = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    // ✅ Find job
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new Apperror('Job not found', 404));
    }

    // ✅ Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new Apperror('User not found', 404));
    }

    // ✅ Check if already saved
    if (user.savedJobs && user.savedJobs.includes(jobId)) {
      return next(new Apperror('Job already saved', 400));
    }

    // ✅ Add job to saved jobs
    if (!user.savedJobs) {
      user.savedJobs = [];
    }
    user.savedJobs.push(jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job saved successfully',
      savedJobs: user.savedJobs
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to save job', 500));
  }
};

// ============================================
// 10. UNSAVE JOB (Job Seeker Only)
// ============================================
export const unsaveJob = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    // ✅ Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(new Apperror('User not found', 404));
    }

    // ✅ Check if job is saved
    if (!user.savedJobs || !user.savedJobs.includes(jobId)) {
      return next(new Apperror('Job not in saved jobs', 400));
    }

    // ✅ Remove job from saved jobs
    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs',
      savedJobs: user.savedJobs
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to unsave job', 500));
  }
};

// ============================================
// 11. GET SAVED JOBS (Job Seeker Only)
// ============================================
// GET SAVED JOBS (Fixed Version)
// ============================================
export const getSavedJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // ✅ Find user with saved jobs populated
    const user = await User.findById(userId)
      .select('savedJobs')
      .populate({
        path: 'savedJobs',
        model: 'Job',
        select: 'title description company location salary experience type skills featured applicants views createdAt',
        populate: [
          {
            path: 'employerId',
            select: 'fullName email'
          }
        ],
        options: {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 }  // Most recent first
        }
      })
      .lean();

    if (!user) {
      return next(new Apperror('User not found', 404));
    }

    // Get total count for pagination
    const totalSavedJobs = user.savedJobs ? user.savedJobs.length : 0;
    const totalPages = Math.ceil(totalSavedJobs / limit);

    res.status(200).json({
      success: true,
      message: 'Saved jobs retrieved successfully',
      data: user.savedJobs || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalSavedJobs,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get Saved Jobs Error:', error);
    return next(new Apperror(error.message || 'Failed to retrieve saved jobs', 500));
  }
};


// ============================================
// 12. SEARCH JOBS (Advanced Search)
// ============================================
export const searchJobs = async(req, res, next) => {
  try {
    const {
      keyword,
      skills,
      category,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      location,
      isRemote,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { status: 'ACTIVE' };

    // Keyword search
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Skills search
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      filter.skillsRequired = { $in: skillsArray };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Job type filter
    if (jobType) {
      filter.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Salary filter
    if (minSalary || maxSalary) {
      if (minSalary) {
        filter['salary.max'] = { $gte: parseInt(minSalary) };
      }
      if (maxSalary) {
        filter['salary.min'] = { $lte: parseInt(maxSalary) };
      }
    }

    // Location filter
    if (location) {
      filter['locations.city'] = { $regex: location, $options: 'i' };
    }

    // Remote filter
    if (isRemote === 'true') {
      filter['locations.isRemote'] = true;
    }

    const jobs = await Job.find(filter)
      .populate('companyId', 'name logo')
      .populate('employerId', 'fullName')
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Jobs found',
      data: jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Search failed', 500));
  }
};

// ============================================
// 13. PUBLISH JOB (Change Status from DRAFT to ACTIVE)
// ============================================
export const publishJob = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new Apperror('Job not found', 404));
    }

    if (job.employerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to publish this job', 403));
    }

    if (job.status !== 'DRAFT') {
      return next(new Apperror('Only DRAFT jobs can be published', 400));
    }

    job.status = 'ACTIVE';
    job.postedDate = new Date();
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job published successfully',
      data: job
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to publish job', 500));
  }
};

// ============================================
// 14. CLOSE JOB (Stop accepting applications)
// ============================================
export const closeJob = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new Apperror('Job not found', 404));
    }

    if (job.employerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to close this job', 403));
    }

    job.status = 'CLOSED';
    job.closingDate = new Date();
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job closed successfully',
      data: job
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to close job', 500));
  }
};

// ============================================
// 15. GET JOB STATISTICS (Employer Dashboard)
// ============================================
export const getJobStats = async(req, res, next) => {
  try {
    const userId = req.user.id;

    // ✅ Total jobs created
    const totalJobs = await Job.countDocuments({ employerId: userId });

    // ✅ Active jobs
    const activeJobs = await Job.countDocuments({ employerId: userId, status: 'ACTIVE' });

    // ✅ Total applicants
    const jobs = await Job.find({ employerId: userId });
    const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicantsCount || 0), 0);

    // ✅ Total views
    const totalViews = jobs.reduce((sum, job) => sum + (job.viewsCount || 0), 0);

    // ✅ Featured jobs
    const featuredJobs = await Job.countDocuments({ employerId: userId, isFeatured: true });

    res.status(200).json({
      success: true,
      message: 'Job statistics retrieved',
      data: {
        totalJobs,
        activeJobs,
        draftJobs: totalJobs - activeJobs,
        totalApplicants,
        totalViews,
        featuredJobs,
        avgViewsPerJob: totalJobs > 0 ? Math.round(totalViews / totalJobs) : 0,
        avgApplicantsPerJob: totalJobs > 0 ? Math.round(totalApplicants / totalJobs) : 0
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve statistics', 500));
  }
};
