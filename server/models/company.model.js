// MODELS/company.model.js
import { Schema, model } from "mongoose";

const companySchema = new Schema({
  // ============================================
  // BASIC INFO
  // ============================================
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Company name must be less than 100 characters'],
    index: true
  },
  
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  description: {
    type: String,
    maxlength: [1000, 'Description must be less than 1000 characters']
  },
  
  logo: {
    public_id: String,
    secure_url: String
  },
  
  // ============================================
  // COMPANY DETAILS
  // ============================================
  industry: String,
  
  companySize: {
    type: String,
    enum: ['1-50', '51-200', '201-500', '500+']
  },
  
  foundedYear: Number,
  
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid website URL'
    }
  },
  
  location: {
    city: String,
    state: String,
    country: String
  },
  
  // ============================================
  // SOCIAL LINKS
  // ============================================
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  
  // ============================================
  // RATINGS
  // ============================================
  rating: {
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
  
  // ============================================
  // VERIFICATION
  // ============================================
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  }
  
}, {
  timestamps: true
});

// ============================================
// INDEXES
// ============================================
companySchema.index({ ownerId: 1 });
companySchema.index({ isVerified: 1 });

const Company = model('Company', companySchema);

export default Company;
