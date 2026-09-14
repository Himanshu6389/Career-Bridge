// MODELS/notification.model.js
import { Schema, model } from "mongoose";

const notificationSchema = new Schema({
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
  // NOTIFICATION DETAILS
  // ============================================
  type: {
    type: String,
    enum: [
      'NEW_JOB_MATCH',
      'APPLICATION_STATUS',
      'NEW_MESSAGE',
      'PROFILE_VIEW',
      'ADMIN_ALERT',
      'JOB_CLOSED'
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // ============================================
  // ACTIONABLE LINK
  // ============================================
  referenceId: Schema.Types.ObjectId,  // Job ID or Application ID
  
  referenceModel: {
    type: String,
    enum: ['Job', 'Application', 'User', 'Company']
  },
  
  // ============================================
  // STATUS
  // ============================================
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  createdAt: {
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
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = model('Notification', notificationSchema);

export default Notification;
