// CONTROLLERS/user.controller.js
import User from "../models/user.model.js";
import Resume from "../models/resume.model.js";
import Apperror from "../routes/error.util.js";
import jwt from 'jsonwebtoken';
import { cookieoptions } from "../utils/cookieoptions.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises';

// ============================================
// REGISTER
// ============================================
export const register = async(req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    
    // Validation
    if (!fullName || !email || !password) {
      return next(new Apperror('All fields are required', 400));
    }
    
    if (password.length < 8) {
      return next(new Apperror('Password must be at least 8 characters', 400));
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new Apperror('Email already registered', 400));
    }
    
    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'JOB_SEEKER'
    });
    
    if (!user) {
      return next(new Apperror('Registration failed, please try again', 500));
    }
    
    await user.save();
    user.password = undefined;
    
    const token = user.generateJWTToken();
    res.cookie('token', token, cookieoptions);
    
    res.status(201).json({
      success: true,
      message: `Welcome to CareerBridge, ${user.fullName}!`,
      data: user,
      token
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// LOGIN
// ============================================
export const login = async(req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new Apperror('Email and password are required', 400));
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return next(new Apperror('Email is not registered', 400));
    }
    
    if (!user.isAccountActive) {
      return next(new Apperror('Account has been deactivated', 403));
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new Apperror('Email or password does not match', 400));
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = user.generateJWTToken();
    user.password = undefined;
    
    res.cookie("token", token, cookieoptions);
    
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.fullName}! 🎉`,
      data: user,
      token
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// LOGOUT
// ============================================
export const logout = async(req, res, next) => {
  try {
    res.clearCookie('token', {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/"
    });
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// GET PROFILE
// ============================================
export const getProfile = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate('seekerProfile.resumeId')
      .populate('employerProfile.companyId');
    
    if (!user) {
      return next(new Apperror('User not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Your profile details',
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
export const updateProfile = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, bio, avatar } = req.body;
    
    if (!fullName && !bio && !avatar) {
      return next(new Apperror('At least one field is required', 400));
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new Apperror('User not found', 404));
    }
    
    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePassword = async(req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!oldPassword || !newPassword) {
      return next(new Apperror('All fields are required', 400));
    }
    
    if (newPassword.length < 8) {
      return next(new Apperror('New password must be at least 8 characters', 400));
    }
    
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return next(new Apperror('User not found', 404));
    }
    
    const isValidPassword = await user.comparePassword(oldPassword);
    if (!isValidPassword) {
      return next(new Apperror('Invalid old password', 400));
    }
    
    user.password = newPassword;
    await user.save();
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// UPDATE SOCIAL LINKS
// ============================================
export const updateSocialLinks = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { github, linkedin, twitter, website } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new Apperror('User not found', 404));
    }
    
    user.socialLinks = {
      github: github || user.socialLinks.github,
      linkedin: linkedin || user.socialLinks.linkedin,
      twitter: twitter || user.socialLinks.twitter,
      website: website || user.socialLinks.website
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Social links updated successfully",
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// TOGGLE PROFILE VISIBILITY
// ============================================
export const toggleProfileVisibility = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new Apperror('User not found', 404));
    }
    
    user.isProfilePublic = !user.isProfilePublic;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Profile is now ${user.isProfilePublic ? 'public' : 'private'}`,
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================
// UPLOAD RESUME
// ============================================
// CONTROLLERS/resume.controller.js
// ============================================
// 1. UPLOAD RESUME FILE
// ============================================
export const uploadResume = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    
    // ✅ Validation
    if (!req.file) {
      return next(new Apperror('Resume file (PDF, JPG, or PNG) is required', 400));
    }
    
    // ✅ UPDATED: Check file type
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (!allowedMimes.includes(req.file.mimetype)) {
      return next(new Apperror('Only PDF, JPG, and PNG files are allowed', 400));
    }
    
    // ✅ File size validation
    const maxSize = 10 * 1024 * 1024;  // 10MB
    if (req.file.size > maxSize) {
      return next(new Apperror('File size must be less than 10MB', 400));
    }
    
    // ✅ Determine file type
    let fileType = 'PDF';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'IMAGE';
    }
    
    // ✅ Upload to Cloudinary
    let cloudinaryResult;
    try {
      const uploadOptions = {
        folder: 'CareerBridge/Resumes',
        access_mode: 'public',
        type: 'upload',
        use_filename: true,
        unique_filename: true
      };
      
      // ✅ Add resource_type based on file
      if (fileType === 'PDF') {
        uploadOptions.resource_type = 'auto';
      } else {
        uploadOptions.resource_type = 'image';
      }
      
      cloudinaryResult = await cloudinary.v2.uploader.upload(req.file.path, uploadOptions);
    } catch (uploadError) {
      return next(new Apperror('Failed to upload file to cloud', 500));
    }
    
    // ✅ Delete local file
    try {
      await fs.unlink(req.file.path);
    } catch (deleteError) {
      console.log('Warning: Could not delete local file', deleteError);
    }
    
    // ✅ Create resume in database
    const resume = await Resume.create({
      userId,
      title: title || 'My Resume',
      fileDetails: {
        public_id: cloudinaryResult.public_id,
        secure_url: cloudinaryResult.secure_url,
        fileType: fileType,  // ✅ Store file type
        mimeType: req.file.mimetype  // ✅ Store MIME type
      },
      parsedData: {
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        projects: []
      }
    });
    
    if (!resume) {
      return next(new Apperror('Failed to create resume record', 500));
    }
    
    res.status(201).json({
      success: true,
      message: `Resume (${fileType}) uploaded successfully! Now fill in your details.`,
      data: resume
    });
    
  } catch (error) {
    return next(new Apperror(error.message || 'Resume upload failed', 500));
  }
};


// ============================================
// 2. UPDATE RESUME PARSED DATA (Skills, Experience, etc.)
// ============================================
export const updateResumeData = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;
    const { dataType, data } = req.body;
    
    if (!dataType || !data) {
      return next(new Apperror('dataType and data are required', 400));
    }
    
    const validTypes = ['skills', 'experience', 'education', 'certifications', 'projects'];
    if (!validTypes.includes(dataType)) {
      return next(new Apperror(`Invalid dataType. Must be one of: ${validTypes.join(', ')}`, 400));
    }
    
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return next(new Apperror('Resume not found', 404));
    }
    
    switch(dataType) {
      case 'skills':
        if (!Array.isArray(data)) {
          return next(new Apperror('Skills must be an array', 400));
        }
        resume.parsedData.skills = data;
        break;
      
      case 'experience':
        if (!data.title || !data.company) {
          return next(new Apperror('Title and company are required for experience', 400));
        }
        resume.parsedData.experience.push({
          id: new Schema.Types.ObjectId(),
          title: data.title,
          company: data.company,
          location: data.location,
          duration: data.duration,
          description: data.description,
          addedAt: new Date()
        });
        break;
      
      case 'education':
        if (!data.degree || !data.university) {
          return next(new Apperror('Degree and university are required', 400));
        }
        resume.parsedData.education.push({
          id: new Schema.Types.ObjectId(),
          degree: data.degree,
          university: data.university,
          field: data.field,
          year: data.year,
          cgpa: data.cgpa,
          addedAt: new Date()
        });
        break;
      
      case 'certifications':
        if (!data.name || !data.issuer) {
          return next(new Apperror('Name and issuer are required', 400));
        }
        resume.parsedData.certifications.push({
          id: new Schema.Types.ObjectId(),
          name: data.name,
          issuer: data.issuer,
          issueDate: data.issueDate,
          expiryDate: data.expiryDate
        });
        break;
      
      case 'projects':
        if (!data.title) {
          return next(new Apperror('Project title is required', 400));
        }
        resume.parsedData.projects.push({
          id: new Schema.Types.ObjectId(),
          title: data.title,
          description: data.description,
          link: data.link,
          technologies: data.technologies || []
        });
        break;
    }
    
    await resume.save();
    
    res.status(200).json({
      success: true,
      message: `${dataType} added successfully`,
      data: resume
    });
    
  } catch (error) {
    return next(new Apperror(error.message, 500));
  }
};

// ============================================
// 3. UPDATE SINGLE ITEM (Experience, Education, etc.)
// ============================================
export const updateResumeItem = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { resumeId, itemType, itemId } = req.params;  // itemType: 'experience' | 'education'
    const updateData = req.body;
    
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return next(new Apperror('Resume not found', 404));
    }
    
    // Find and update the item
    const items = resume.parsedData[itemType];
    const itemIndex = items.findIndex(item => item.id.toString() === itemId);
    
    if (itemIndex === -1) {
      return next(new Apperror(`${itemType} item not found`, 404));
    }
    
    // Update the item
    items[itemIndex] = { ...items[itemIndex], ...updateData };
    await resume.save();
    
    res.status(200).json({
      success: true,
      message: `${itemType} updated successfully`,
      data: resume
    });
    
  } catch (error) {
    return next(new Apperror(error.message, 500));
  }
};

// ============================================
// 4. DELETE SINGLE ITEM (Experience, Education, etc.)
// ============================================
export const deleteResumeItem = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { resumeId, itemType, itemId } = req.params;
    
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return next(new Apperror('Resume not found', 404));
    }
    
    // Remove the item
    resume.parsedData[itemType] = resume.parsedData[itemType].filter(
      item => item.id.toString() !== itemId
    );
    
    await resume.save();
    
    res.status(200).json({
      success: true,
      message: `${itemType} deleted successfully`,
      data: resume
    });
    
  } catch (error) {
    return next(new Apperror(error.message, 500));
  }
};

// ============================================
// 5. GET ALL RESUMES FOR A USER
// ============================================
export const getMyResumes = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const resumes = await Resume.find({ userId })
      .sort({ uploadedDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('title fileDetails parsedData isDefault isPublic uploadedDate');  // ✅ Include fileDetails
    
    const total = await Resume.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      message: "Your resumes",
      data: resumes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResumes: total
      }
    });
    
  } catch (error) {
    return next(new Apperror(error.message, 500));
  }
};
// ============================================
// 6. GET SINGLE RESUME
// ============================================
export const getResumeById = async(req, res, next) => {
  try {
    const { resumeId } = req.params;
    
    const resume = await Resume.findById(resumeId)
      .populate('userId', 'fullName email avatar');
    
    if (!resume) {
      return next(new Apperror('Resume not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: "Resume details",
      data: resume
    });
    
  } catch (error) {
    return next(new Apperror(error.message, 500));
  }
};

// ============================================
// 7. DELETE RESUME
// ============================================
export const deleteResume = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;
    
    const resume = await Resume.findOne({ _id: resumeId, userId });
    
    if (!resume) {
      return next(new Apperror('Resume not found', 404));
    }
    
    // Delete from Cloudinary
    try {
      if (resume.fileDetails.public_id) {
        await cloudinary.v2.uploader.destroy(resume.fileDetails.public_id, {
          resource_type: resume.fileDetails.fileType === 'PDF' ? 'auto' : 'image'
        });
      }
    } catch (cloudinaryError) {
      console.log('Warning: Could not delete from Cloudinary', cloudinaryError);
    }
    
    // Delete from database
    await Resume.findByIdAndDelete(resumeId);
    
    res.status(200).json({
      success: true,
      message: "Resume deleted successfully"
    });
    
  } catch (error) {
    return next(new Apperror(error.message, 500));
  }
};

// ============================================
// 8. SET DEFAULT RESUME
// ============================================
export const setDefaultResume = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;
    
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return next(new Apperror('Resume not found', 404));
    }
    
    // Unset all other resumes
    await Resume.updateMany({ userId }, { isDefault: false });
    
    // Set this as default
    resume.isDefault = true;
    await resume.save();
    
    res.status(200).json({
      success: true,
      message: "Resume set as default",
      data: resume
    });
    
  } catch (error) {
    return next(new Apperror(error.message, 500));
  }
};

// ============================================
// 9. BULK UPDATE RESUME DATA
// ============================================
export const bulkUpdateResume = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;
    const { headline, skills, experience, education } = req.body;
    
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return next(new Apperror('Resume not found', 404));
    }
    
    // Update all fields at once
    if (headline) resume.parsedData.headline = headline;
    if (skills) resume.parsedData.skills = skills;
    if (experience) resume.parsedData.experience = experience;
    if (education) resume.parsedData.education = education;
    
    await resume.save();
    
    res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: resume
    });
    
  } catch (error) {
    return next(new Apperror(error.message, 500));
  }
};

