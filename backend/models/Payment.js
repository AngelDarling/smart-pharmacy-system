import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['momo', 'vnpay', 'cod', 'bank_transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  // MoMo specific fields
  requestId: {
    type: String,
    unique: true,
    sparse: true
  },
  transId: String, // MoMo transaction ID
  momoTransId: String, // MoMo internal transaction ID
  resultCode: Number, // 0 = success, other = error
  message: String,
  payType: String, // qr, webApp, credit, etc.
  signature: String,
  responseTime: Date,
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // IPN tracking
  ipnReceived: {
    type: Boolean,
    default: false
  },
  ipnReceivedAt: Date,
  
  // Error tracking
  errorCode: String,
  errorMessage: String
}, {
  timestamps: true
});

// Indexes for efficient queries
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ requestId: 1 });
paymentSchema.index({ transId: 1 });
paymentSchema.index({ createdAt: -1 });

// Static method to find payment by order
paymentSchema.statics.findByOrder = function(orderId) {
  return this.findOne({ orderId }).sort({ createdAt: -1 });
};

// Static method to find successful payment
paymentSchema.statics.findSuccessfulPayment = function(orderId) {
  return this.findOne({ orderId, status: 'success' });
};

// Instance method to mark as success
paymentSchema.methods.markAsSuccess = function(momoData) {
  this.status = 'success';
  this.transId = momoData.transId;
  this.resultCode = momoData.resultCode;
  this.message = momoData.message;
  this.payType = momoData.payType;
  this.responseTime = new Date(momoData.responseTime);
  this.ipnReceived = true;
  this.ipnReceivedAt = new Date();
  return this.save();
};

// Instance method to mark as failed
paymentSchema.methods.markAsFailed = function(momoData) {
  this.status = 'failed';
  this.resultCode = momoData.resultCode;
  this.message = momoData.message;
  this.errorCode = momoData.resultCode?.toString();
  this.errorMessage = momoData.message;
  this.responseTime = new Date(momoData.responseTime);
  this.ipnReceived = true;
  this.ipnReceivedAt = new Date();
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
