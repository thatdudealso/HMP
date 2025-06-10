const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const promptHistorySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  patientInfo: {
    type: Object,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  additionalNotes: {
    type: String
  },
  response: {
    type: String,
    required: true
  }
});

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["doctor", "technician", "student"], required: true },
    
    practiceType: { 
      type: String, 
      enum: ["small animal", "farm", "equine", "lab animal", "industry", "aquatics", "exotics", "zoo/wildlife"], 
      required: true 
    },

    // Doctor-Specific Fields
    licenseNumber: { 
      type: String, 
      required: function() { return this.role === "doctor"; }, 
      default: function() { return this.role === "doctor" ? undefined : undefined; }
    },
    experience: { 
      type: Number, 
      required: function() { return this.role === "doctor"; }, 
      default: function() { return this.role === "doctor" ? undefined : undefined; }
    },

    // Technician-Specific Fields
    certificationID: { 
      type: String, 
      required: function() { return this.role === "technician"; }, 
      default: function() { return this.role === "technician" ? undefined : undefined; }
    },
    clinicName: { 
      type: String, 
      required: function() { return this.role === "technician"; }, 
      default: function() { return this.role === "technician" ? undefined : undefined; }
    },

    // Student-Specific Fields
    university: { 
      type: String, 
      required: function() { return this.role === "student"; }, 
      default: function() { return this.role === "student" ? undefined : undefined; }
    },
    graduationYear: { 
      type: Number, 
      required: function() { return this.role === "student"; }, 
      default: function() { return this.role === "student" ? undefined : undefined; }
    },

    history: [
      {
        prompt: { type: String, required: true },
        response: { type: String, required: true },
        agentType: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Add these fields to your User schema for password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    country: String,
    countryCode: String,

    promptHistory: [promptHistorySchema]
  },
  { timestamps: true }
);

// Add debug logging to track password modifications
userSchema.pre('validate', function(next) {
  console.log('🔍 Pre-validate hook: Password length:', this.password?.length);
  next();
});

// Hash Password Before Saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    console.log("⏭️ Password not modified, skipping hash");
    return next();
  }

  try {
    // Check if password is already hashed
    if (this.password.startsWith('$2')) {
      console.log("⚠️ Password appears to be already hashed, skipping");
      return next();
    }

    console.log("🔐 Hashing new password");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("✅ Password hashed successfully");
    next();
  } catch (error) {
    console.error("❌ Error hashing password:", error);
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log("🔍 Comparing passwords");
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("✅ Password comparison result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("❌ Password comparison failed:", error);
    throw error;
  }
};

// Virtual for full name
userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password; // Remove password from JSON
    delete ret.__v;     // Remove version key
    return ret;
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;