// MODELS/resume.model.js
import { Schema, model } from "mongoose";

const resumeSchema = new Schema({
  // ============================================
  // RELATIONSHIP
  // ============================================
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // ============================================
  // RESUME DETAILS
  // ============================================
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    default: 'My Resume',
    maxlength: [50, 'Title must be less than 50 characters']
  },
  
  // ============================================
  // FILE UPLOAD (Cloudinary) - Support Both PDF & Images
  // ============================================
  fileDetails: {
    public_id: {
      type: String,
      required: true
    },
    secure_url: {
      type: String,
      required: true
    },
    // ✅ NEW: Track file type
    fileType: {
      type: String,
      enum: ['PDF', 'IMAGE'],  // PDF or JPG/PNG
      default: 'PDF'
    },
    // ✅ NEW: Original file format
    mimeType: String  // 'application/pdf', 'image/jpeg', 'image/png'
  },
  
  // ============================================
  // PARSED DATA (User-filled form)
  // ============================================
  parsedData: {
    headline: {
      type: String,
      maxlength: [100, 'Headline must be less than 100 characters']
    },
    
    skills: [String],
    
    experience: [
      {
        id: Schema.Types.ObjectId,
        title: {
          type: String,
          required: true
        },
        company: {
          type: String,
          required: true
        },
        location: String,
        duration: {
          startDate: Date,
          endDate: Date,
          currentlyWorking: {
            type: Boolean,
            default: false
          }
        },
        description: String,
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    
    education: [
      {
        id: Schema.Types.ObjectId,
        degree: {
          type: String,
          required: true
        },
        university: {
          type: String,
          required: true
        },
        field: String,
        year: Number,
        cgpa: Number,
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    
    certifications: [
      {
        id: Schema.Types.ObjectId,
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date
      }
    ],
    
    projects: [
      {
        id: Schema.Types.ObjectId,
        title: String,
        description: String,
        link: String,
        technologies: [String]
      }
    ]
  },
  
  // ============================================
  // METADATA
  // ============================================
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  uploadedDate: {
    type: Date,
    default: Date.now,
    index: true
  }
  
}, {
  timestamps: true
});

// ============================================
// INDEXES
// ============================================
resumeSchema.index({ userId: 1 });
resumeSchema.index({ isDefault: 1 });
resumeSchema.index({ userId: 1, isDefault: 1 });
resumeSchema.index({ 'parsedData.skills': 1 });

const Resume = model('Resume', resumeSchema);

export default Resume;
