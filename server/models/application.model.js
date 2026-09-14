// MODELS/application.model.js
import { Schema, model } from "mongoose";

const applicationSchema = new Schema({
  // ============================================
  // RELATIONSHIPS
  // ============================================
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  
  seekerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  resumeId: {
    type: Schema.Types.ObjectId,
    ref: 'Resume'
  },
  
  // ============================================
  // APPLICATION DETAILS
  // ============================================
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter must be less than 1000 characters']
  },
  
  status: {
    type: String,
    enum: ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'],
    default: 'APPLIED',
    index: true
  },
  
  appliedDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // ============================================
  // EMPLOYER INTERACTIONS
  // ============================================
  viewedDate: Date,
  shortlistedDate: Date,
  rejectionReason: String,
  hiredDate: Date,
  
  // ============================================
  // COMMUNICATION
  // ============================================
  messages: [
    {
      senderId: Schema.Types.ObjectId,
      senderRole: String,  // 'SEEKER' or 'EMPLOYER'
      message: String,
      sentDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  
  // ============================================
  // RATINGS (Mutual)
  // ============================================
  rating: {
    employerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    seekerRating: {
      type: Number,
      min: 1,
      max: 5
    }
  }
  
}, {
  timestamps: true
});

// ============================================
// INDEXES
// ============================================
applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });  // Prevent duplicates
applicationSchema.index({ status: 1 });
applicationSchema.index({ employerId: 1, status: 1 });
applicationSchema.index({ appliedDate: -1 });

const Application = model('Application', applicationSchema);

export default Application;
