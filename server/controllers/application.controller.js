// CONTROLLERS/application.controller.js
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import Resume from "../models/resume.model.js";
import Apperror from "../routes/error.util.js";

// ============================================
// 1. APPLY FOR JOB (Job Seeker Only)
// ============================================
export const applyForJob = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId, resumeId, coverLetter } = req.body;

    // ✅ Validation
    if (!jobId || !resumeId) {
      return next(new Apperror('Job ID and Resume ID are required', 400));
    }

    // ✅ Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new Apperror('Job not found', 404));
    }

    // // ✅ Check if job is still active
    // if (job.status !== 'ACTIVE') {
    //   return next(new Apperror('This job is no longer accepting applications', 400));
    // }

    // ✅ Check if closing date has passed
    if (new Date() > job.closingDate) {
      return next(new Apperror('Application deadline has passed', 400));
    }

    // ✅ Check if resume exists and belongs to user
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return next(new Apperror('Resume not found or does not belong to you', 404));
    }

    // ✅ Check if already applied
    const existingApplication = await Application.findOne({ jobId, seekerId: userId });
    if (existingApplication) {
      return next(new Apperror('You have already applied for this job', 400));
    }

    // ✅ Validate cover letter length
    if (coverLetter && coverLetter.length > 1000) {
      return next(new Apperror('Cover letter must be less than 1000 characters', 400));
    }

    // ✅ Create application
    const application = await Application.create({
      jobId,
      seekerId: userId,
      employerId: job.employerId,
      resumeId,
      coverLetter: coverLetter || '',
      status: 'APPLIED',
      appliedDate: new Date()
    });

    // ✅ Increment applicant count
    job.applicantsCount = (job.applicantsCount || 0) + 1;
    if (!job.status) {
  job.status = 'DRAFT';
  await job.save();
}
    await job.save();

    // ✅ Populate data
    await application.populate('jobId', 'title company');
    await application.populate('seekerId', 'fullName email');
    await application.populate('resumeId', 'title');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to apply for job', 500));
  }
};

// ============================================
// 2. GET MY APPLICATIONS (Job Seeker Only)
// ============================================
export const getMyApplications = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, sortBy = 'appliedDate' } = req.query;

    const skip = (page - 1) * limit;

    // ✅ Build filter
    const filter = { seekerId: userId };
    if (status) {
      filter.status = status;
    }

    // ✅ Get applications
    const applications = await Application.find(filter)
      .populate('jobId', 'title company salary locations')
      .populate('employerId', 'fullName email')
      .populate('resumeId', 'title')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Your applications retrieved',
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalApplications: total
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve applications', 500));
  }
};

// ============================================
// 3. GET RECEIVED APPLICATIONS (Employer Only)
// ============================================
export const getReceivedApplications = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, jobId, sortBy = 'appliedDate' } = req.query;

    const skip = (page - 1) * limit;

    // ✅ Build filter
    const filter = { employerId: userId };
    if (status) {
      filter.status = status;
    }
    if (jobId) {
      filter.jobId = jobId;
    }

    // ✅ Get applications
    const applications = await Application.find(filter)
      .populate('jobId', 'title company')
      .populate('seekerId', 'fullName email phone avatar')
      .populate('resumeId', 'title fileDetails')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Received applications retrieved',
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalApplications: total
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve applications', 500));
  }
};

// ============================================
// 4. GET SINGLE APPLICATION
// ============================================
export const getApplicationById = async(req, res, next) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const application = await Application.findById(applicationId)
      .populate('jobId', 'title description company salary locations')
      .populate('seekerId', 'fullName email phone avatar')
      .populate('employerId', 'fullName email')
      .populate('resumeId', 'title parsedData fileDetails');

    if (!application) {
      return next(new Apperror('Application not found', 404));
    }

    // ✅ Authorization check - only seeker or employer can view
    if (
      application.seekerId._id.toString() !== userId &&
      application.employerId._id.toString() !== userId
    ) {
      return next(new Apperror('You are not authorized to view this application', 403));
    }

    // ✅ Mark as viewed if employer viewing
    if (application.employerId._id.toString() === userId && !application.viewedDate) {
      application.viewedDate = new Date();
      await application.save();
    }

    res.status(200).json({
      success: true,
      message: 'Application details retrieved',
      data: application
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve application', 500));
  }
};

// ============================================
// 5. UPDATE APPLICATION STATUS (Employer Only)
// ============================================
export const updateApplicationStatus = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;
    const { status, rejectionReason } = req.body;

    // ✅ Validation
    if (!status) {
      return next(new Apperror('Status is required', 400));
    }

    const validStatuses = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'];
    if (!validStatuses.includes(status)) {
      return next(new Apperror(`Status must be one of: ${validStatuses.join(', ')}`, 400));
    }

    // ✅ Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return next(new Apperror('Application not found', 404));
    }

    // ✅ Authorization check
    if (application.employerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to update this application', 403));
    }

    // ✅ Update status
    application.status = status;

    // ✅ Set status-specific dates and reasons
    if (status === 'REJECTED') {
      if (!rejectionReason) {
        return next(new Apperror('Rejection reason is required', 400));
      }
      application.rejectionReason = rejectionReason;
    } else if (status === 'SHORTLISTED') {
      application.shortlistedDate = new Date();
    } else if (status === 'HIRED') {
      application.hiredDate = new Date();
    }

    await application.save();

    // ✅ Populate response
    await application.populate('jobId', 'title');
    await application.populate('seekerId', 'fullName email');

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to update application status', 500));
  }
};

// ============================================
// 6. WITHDRAW APPLICATION (Job Seeker Only)
// ============================================
export const withdrawApplication = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return next(new Apperror('Application not found', 404));
    }

    // ✅ Authorization check
    if (application.seekerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to withdraw this application', 403));
    }

    // ✅ Check if already hired
    if (application.status === 'HIRED') {
      return next(new Apperror('Cannot withdraw a job after being hired', 400));
    }

    // ✅ Delete application
    await Application.findByIdAndDelete(applicationId);

    // ✅ Decrement job applicant count
    const job = await Job.findById(application.jobId);
    if (job) {
      job.applicantsCount = Math.max(0, (job.applicantsCount || 1) - 1);
      await job.save();
    }

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to withdraw application', 500));
  }
};

// ============================================
// 7. GET ALL APPLICATIONS (Admin/Dashboard)
// ============================================
export const getApplications = async(req, res, next) => {
  try {
    const { page = 1, limit = 10, status, jobId } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (jobId) {
      filter.jobId = jobId;
    }

    const applications = await Application.find(filter)
      .populate('jobId', 'title')
      .populate('seekerId', 'fullName email')
      .populate('employerId', 'fullName')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Applications retrieved',
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalApplications: total
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve applications', 500));
  }
};

// ============================================
// 8. SEND MESSAGE IN APPLICATION
// ============================================
export const sendMessage = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;
    const { message } = req.body;

    // ✅ Validation
    if (!message || message.trim().length === 0) {
      return next(new Apperror('Message cannot be empty', 400));
    }

    if (message.length > 5000) {
      return next(new Apperror('Message is too long (max 5000 characters)', 400));
    }

    // ✅ Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return next(new Apperror('Application not found', 404));
    }

    // ✅ Authorization check
    if (
      application.seekerId.toString() !== userId &&
      application.employerId.toString() !== userId
    ) {
      return next(new Apperror('You are not authorized to message in this application', 403));
    }

    // ✅ Determine sender role
    let senderRole = 'SEEKER';
    if (application.employerId.toString() === userId) {
      senderRole = 'EMPLOYER';
    }

    // ✅ Add message
    if (!application.messages) {
      application.messages = [];
    }

    application.messages.push({
      senderId: userId,
      senderRole,
      message: message.trim(),
      sentDate: new Date()
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId: application.messages.length - 1,
        message: application.messages[application.messages.length - 1]
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to send message', 500));
  }
};

// ============================================
// 9. RATE APPLICATION (Mutual Rating)
// ============================================
export const rateApplication = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;
    const { rating } = req.body;

    // ✅ Validation
    if (!rating || rating < 1 || rating > 5) {
      return next(new Apperror('Rating must be between 1 and 5', 400));
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return next(new Apperror('Application not found', 404));
    }

    // ✅ Authorization check
    if (application.seekerId.toString() !== userId && application.employerId.toString() !== userId) {
      return next(new Apperror('You are not authorized to rate this application', 403));
    }

    // ✅ Set appropriate rating
    if (application.seekerId.toString() === userId) {
      // Seeker rating employer
      application.rating.seekerRating = rating;
    } else {
      // Employer rating seeker
      application.rating.employerRating = rating;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: application.rating
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to submit rating', 500));
  }
};

// ============================================
// 10. GET APPLICATION STATISTICS (Employer Dashboard)
// ============================================
export const getApplicationStats = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.query;

    let filter = { employerId: userId };
    if (jobId) {
      filter.jobId = jobId;
    }

    // ✅ Get all status counts
    const totalApplications = await Application.countDocuments(filter);
    const appliedCount = await Application.countDocuments({ ...filter, status: 'APPLIED' });
    const reviewingCount = await Application.countDocuments({ ...filter, status: 'REVIEWING' });
    const shortlistedCount = await Application.countDocuments({ ...filter, status: 'SHORTLISTED' });
    const rejectedCount = await Application.countDocuments({ ...filter, status: 'REJECTED' });
    const hiredCount = await Application.countDocuments({ ...filter, status: 'HIRED' });

    // ✅ Get average response time (if viewed)
    const viewedApplications = await Application.find({ ...filter, viewedDate: { $exists: true } });
    let avgResponseTime = 0;
    if (viewedApplications.length > 0) {
      const totalTime = viewedApplications.reduce((sum, app) => {
        return sum + (new Date(app.viewedDate) - new Date(app.appliedDate));
      }, 0);
      avgResponseTime = Math.round(totalTime / viewedApplications.length / (1000 * 60 * 60 * 24)); // Convert to days
    }

    res.status(200).json({
      success: true,
      message: 'Application statistics retrieved',
      data: {
        totalApplications,
        statusBreakdown: {
          applied: appliedCount,
          reviewing: reviewingCount,
          shortlisted: shortlistedCount,
          rejected: rejectedCount,
          hired: hiredCount
        },
        conversionMetrics: {
          shortlistRate: totalApplications > 0 ? Math.round((shortlistedCount / totalApplications) * 100) : 0,
          hireRate: totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0,
          rejectionRate: totalApplications > 0 ? Math.round((rejectedCount / totalApplications) * 100) : 0
        },
        avgResponseTimeInDays: avgResponseTime
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve statistics', 500));
  }
};

// ============================================
// 11. BULK UPDATE APPLICATIONS (Employer)
// ============================================
export const bulkUpdateApplications = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { applicationIds, status } = req.body;

    // ✅ Validation
    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return next(new Apperror('Application IDs must be provided as an array', 400));
    }

    if (!status) {
      return next(new Apperror('Status is required', 400));
    }

    // ✅ Update all applications
    const result = await Application.updateMany(
      { _id: { $in: applicationIds }, employerId: userId },
      { status, updatedAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} applications`,
      data: {
        totalRequested: applicationIds.length,
        totalUpdated: result.modifiedCount,
        totalMatched: result.matchedCount
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to bulk update applications', 500));
  }
};

// ============================================
// 12. GET CONVERSATION THREAD
// ============================================
export const getConversation = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('seekerId', 'fullName avatar')
      .populate('employerId', 'fullName avatar');

    if (!application) {
      return next(new Apperror('Application not found', 404));
    }

    // ✅ Authorization check
    if (
      application.seekerId._id.toString() !== userId &&
      application.employerId._id.toString() !== userId
    ) {
      return next(new Apperror('You are not authorized to view this conversation', 403));
    }

    res.status(200).json({
      success: true,
      message: 'Conversation retrieved',
      data: {
        applicationId: application._id,
        participants: {
          seeker: application.seekerId,
          employer: application.employerId
        },
        messages: application.messages || [],
        applicationStatus: application.status
      }
    });

  } catch (error) {
    return next(new Apperror(error.message || 'Failed to retrieve conversation', 500));
  }
};
