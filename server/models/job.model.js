// MODELS/job.model.js
import { Schema, model } from "mongoose";

const jobSchema = new Schema({
  // ============================================
  // BASIC INFO
  // ============================================
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title must be less than 100 characters'],
    index: true
  },
  
  description: {
    type: String,
    required: [true, 'Job description is required'],
    minlength: [100, 'Description must be at least 100 characters']
  },
  
  // ============================================
  // EMPLOYER INFO
  // ============================================
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // ============================================
  // JOB DETAILS
  // ============================================
  jobType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'],
    required: true
  },
  
  category: {
    type: String,
    enum: [
      'IT',
      'FINANCE',
      'HR',
      'SALES',
      'MARKETING',
      'DESIGN',
      'MANAGEMENT',
      'OTHER'
    ],
    required: true,
    index: true
  },
  
  skillsRequired: [String],  // ["JavaScript", "React", "Node.js"]
  
  experienceLevel: {
    type: String,
    enum: ['ENTRY', 'MID', 'SENIOR'],
    required: true
  },
  
  minimumExperience: {
    type: Number,
    default: 0
  },
  
  // ============================================
  // SALARY & LOCATION
  // ============================================
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    isHidden: {
      type: Boolean,
      default: false
    }
  },
  
  locations: [
    {
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India'
      },
      isRemote: {
        type: Boolean,
        default: false
      }
    }
  ],
  
  // ============================================
  // STATUS
  // ============================================
  status: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'CLOSED', 'DRAFT'],
    default: 'DRAFT',
    index: true
  },
  
  // ============================================
  // ENGAGEMENT METRICS
  // ============================================
  applicantsCount: {
    type: Number,
    default: 0
  },
  
  viewsCount: {
    type: Number,
    default: 0
  },
  
  // ============================================
  // DATES
  // ============================================
  postedDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  closingDate: {
    type: Date,
    required: true
  },
  
  // ============================================
  // METADATA
  // ============================================
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// ============================================
// INDEXES
// ============================================
jobSchema.index({ employerId: 1, status: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ status: 1, closingDate: 1 });
jobSchema.index({ createdAt: -1 });

const Job = model('Job', jobSchema);

export default Job;
