import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";


const userSchema = new Schema({
  // ============================================
  // AUTHENTICATION FIELDS
  // ============================================
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [3, 'Full name must be at least 3 characters long'],
    maxlength: [50, 'Full name must be less than 50 characters'],
    lowercase: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    index: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false  // Never return password by default
  },
  
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,  // Allow null values
    validate: {
      validator: function(v) {
        if (!v) return true;  // Optional field
        return /^[6-9]\d{9}$/.test(v);  // Indian phone number validation
      },
      message: 'Please enter a valid Indian phone number (10 digits)'
    }
  },
  
  // ============================================
  // ROLE & PERMISSIONS
  // ============================================
  role: {
    type: String,
    enum: ['JOB_SEEKER', 'EMPLOYER', 'ADMIN'],
    default: 'JOB_SEEKER',
    index: true
  },
  
  // ============================================
  // PROFILE INFORMATION
  // ============================================
  avatar: {
    public_id: String,
    secure_url: String
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio must be less than 500 characters'],
    default: ''
  },
  
  // ============================================
  // JOB SEEKER SPECIFIC FIELDS
  // ============================================
  seekerProfile: {
    headline: {
      type: String,
      maxlength: [100, 'Headline must be less than 100 characters'],
      default: ''  // e.g., "MERN Stack Developer"
    },
    
    experience: {
      years: {
        type: Number,
        min: 0,
        max: 70
      },
      level: {
        type: String,
        enum: ['ENTRY', 'MID', 'SENIOR'],
        default: 'ENTRY'
      }
    },
    
    skills: [String],  // ["JavaScript", "React", "Node.js"]
    
    preferredLocations: [String],  // ["Mumbai", "Bangalore"]
    
    preferredJobTypes: [String],  // ["FULL_TIME", "CONTRACT", "INTERNSHIP"]
    
    expectedSalary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume'
    },
    
    isProfileComplete: {
      type: Boolean,
      default: false
    },
    
    lastProfileUpdate: Date
  },
  
  // ============================================
  // SAVED JOBS (✅ NEW FIELD)
  // ============================================
  savedJobs: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      index: true
    }
  ],
  
  // ============================================
  // EMPLOYER SPECIFIC FIELDS
  // ============================================
  employerProfile: {
    companyName: {
      type: String,
      trim: true
    },
    
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company'
    },
    
    jobsPosted: {
      type: Number,
      default: 0
    },
    
    applicantsReview: {
      avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalReviews: {
        type: Number,
        default: 0
      }
    },
    
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    
    verificationDocs: [String]  // URLs of uploaded documents
  },
  
  // ============================================
  // SOCIAL LINKS
  // ============================================
  socialLinks: {
    github: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/.test(v);
        },
        message: 'Invalid GitHub URL'
      }
    },
    linkedin: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/([a-z0-9-]+\.)*linkedin\.com\/.+$/i.test(v);
        },
        message: 'Invalid LinkedIn URL'
      }
    },
    twitter: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/.test(v);
        },
        message: 'Invalid Twitter/X URL'
      }
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Invalid website URL'
      }
    }
  },
  
  // ============================================
  // SECURITY & VERIFICATION
  // ============================================
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  
  lastLogin: Date,
  
  // ============================================
  // ACCOUNT STATUS
  // ============================================
  isAccountActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isProfilePublic: {
    type: Boolean,
    default: true
  },
  
  // ============================================
  // NOTIFICATIONS PREFERENCES
  // ============================================
  emailNotifications: {
    jobRecommendations: {
      type: Boolean,
      default: true
    },
    applicationUpdates: {
      type: Boolean,
      default: true
    },
    messages: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    }
  },
  
  // ============================================
  // METADATA
  // ============================================
  deviceTokens: [String],  // For push notifications
  
  loginHistory: [
    {
      timestamp: Date,
      ipAddress: String,
      userAgent: String
    }
  ],
  
  authProvider: {
    type: String,
    default: 'email'  // Can be 'google', 'github', etc.
  }
  
}, {
  timestamps: true
});


// ============================================
// INDEXES FOR PERFORMANCE
// ============================================
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'seekerProfile.skills': 1 });
userSchema.index({ 'employerProfile.isVerified': 1 });
userSchema.index({ isAccountActive: 1 });
userSchema.index({ savedJobs: 1 });  // ✅ NEW INDEX
userSchema.index({ createdAt: -1 });


// ============================================
// PRE-SAVE HOOK: Hash Password
// ============================================
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
});


// ============================================
// INSTANCE METHODS
// ============================================


// Generate JWT Token
userSchema.methods.generateJWTToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY || '7d'
    }
  );
};


// Compare Password
userSchema.methods.comparePassword = async function(plainTextPassword) {
  return await bcrypt.compare(plainTextPassword, this.password);
};


// Generate Password Reset Token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.forgotPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;  // 15 minutes
  
  return resetToken;
};


// Generate Email Verification Token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;  // 24 hours
  
  return token;
};


// ============================================
// EXPORT MODEL
// ============================================
const User = model('User', userSchema);


export default User;
