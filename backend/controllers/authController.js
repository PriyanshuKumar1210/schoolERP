const User = require("../models/User");
const School = require("../models/School");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../utils/password");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt");

const Counter = require("../models/Counter");

const generateSchoolCode = async (schoolName) => {
  // Remove special characters and spaces
  const cleanedName = schoolName.replace(/[^a-zA-Z]/g, "").toUpperCase();

  // Take first 3 characters
  const prefix = cleanedName.substring(0, 3);

  if (prefix.length < 3) {
    throw new Error("School name must contain at least 3 letters");
  }

  // Atomically increment counter
  const counter = await Counter.findOneAndUpdate(
    { _id: "schoolCode" },
    { $inc: { sequenceValue: 1 } },
    {
      new: true,
      upsert: true,
    },
  );

  return `${prefix}${counter.sequenceValue}`;
};

// Password Validation Helper: 6+ chars, 1 capital, 1 number, 1 special character
const validatePasswordStrength = (password) => {
  const minLength = password.length >= 6;
  const hasCapital = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  return minLength && hasCapital && hasNumber && hasSpecial;
};

// Helper to resolve the correct Mongoose model by role
const getUserModelByRole = (role) => {
  if (role === "admin") return User;
  if (role === "teacher") return Teacher;
  if (role === "student") return Student;
  return User;
};

// Helper to find a user by ID and role, with a fallback lookup if role is missing
const findUserByIdAndRole = async (id, role) => {
  if (role) {
    const Model = getUserModelByRole(role);
    const user = await Model.findById(id);
    if (user) return user;
  }
  let user = await User.findById(id);
  if (!user) user = await Teacher.findById(id);
  if (!user) user = await Student.findById(id);
  return user;
};

// -------------------------------------------------------------------------------------------
// This route allows self-registration only for Admin/School accounts.
// Student and Teacher accounts must be created by the Administrator.
// -------------------------------------------------------------------------------------------
exports.register = async (req, res) => {
  try {
    const { schoolName, userName, email, phone, password, role } = req.body;

    // Basic validation
    if (!userName || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required",
      });
    }

    // Only admin can self-register
    if (role !== "admin") {
      return res.status(403).json({
        message:
          "Self-registration is only allowed for Admin/School accounts. Student and Teacher accounts must be created by the Administrator.",
      });
    }

    // School name is required for admin registration
    if (!schoolName) {
      return res.status(400).json({
        message: "School name is required for admin registration",
      });
    }

    // Generate school code automatically
    const schoolCode = await generateSchoolCode(schoolName);

    // Check whether generated school code already exists
    const existingSchool = await School.findOne({
      schoolCode,
    });

    if (existingSchool) {
      return res.status(400).json({
        message: "School with this code already exists",
      });
    }

    // Check whether admin already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Validate password
    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters, contain 1 capital letter, 1 number, and 1 special character",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate IDs
    const adminId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();

    // Create admin
    const user = await User.create({
      _id: adminId,
      name: userName,
      email,
      password: hashedPassword,
      phone,
      role: "admin",
      schoolId,
    });

    // Create school
    const school = await School.create({
      _id: schoolId,
      name: schoolName,
      schoolCode,
      adminId,
      email,
      phone,
      address: req.body.address,
      principalName: req.body.adminName || userName,
      principalEmail: email,
      isActive: true,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.schoolId, user.role);

    const refreshToken = generateRefreshToken(
      user._id,
      user.schoolId,
      user.role,
    );

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
    });

    await user.save();

    // Don't return password
    user.password = undefined;

    return res.status(201).json({
      message: "User registered successfully",
      user,
      school,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
// Login User
// exports.login = async (req, res) => {
//   try {
//     const { email, password, schoolCode } = req.body;

//     if (!email || !password || !schoolCode) {
//       return res
//         .status(400)
//         .json({ message: "Email, password, and school code are required" });
//     }

//     // Find school by code
//     const school = await School.findOne({ schoolCode: schoolCode });
//     if (!school) {
//       return res.status(404).json({ message: "School does not exist" });
//     }

//     // Find user across respective collections
//     let user = null;
//     user = await User.findOne({
//       email,
//       schoolId: school._id,
//       role: "admin",
//     }).select("+password");
//     if (!user) {
//       user = await Teacher.findOne({ email, schoolId: school._id }).select(
//         "+password",
//       );
//     }
    

//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Check password
//     const isPasswordValid = await comparePassword(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate tokens
//     const accessToken = generateAccessToken(user._id, user.schoolId, user.role);
//     const refreshToken = generateRefreshToken(
//       user._id,
//       user.schoolId,
//       user.role,
//     );

//     // Save refresh token
//     user.refreshTokens.push({ token: refreshToken });
//     user.lastLogin = new Date();
//     await user.save();

//     user.password = undefined;
//     const schoolData = await School.findById(user.schoolId).populate(
//       "adminId",
//       "name email phone",
//     );

//     res.json({
//       message: "Login successful",
//       user,
//       school: schoolData,
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


exports.login = async (req, res) => {
  try {
    const { email, password, schoolCode } = req.body;

    if (!email || !password || !schoolCode) {
      return res
        .status(400)
        .json({ message: "Email, password, and school code are required" });
    }

    // 1. Find school by code
    const school = await School.findOne({ schoolCode: schoolCode });
    if (!school) {
      return res.status(404).json({ message: "School does not exist" });
    }

    // 2. Search for user across User/Admin or Teacher collections
    let user = await User.findOne({
      email,
      schoolId: school._id,
      role: "admin",
    }).select("+password");

    let role = "admin";

    if (!user) {
      user = await Teacher.findOne({ email, schoolId: school._id }).select("+password");
      role = user?.role || "teacher";
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Generate JWT Tokens
    const accessToken = generateAccessToken(user._id, user.schoolId, role);
    const refreshToken = generateRefreshToken(user._id, user.schoolId, role);

    // 5. Save Refresh Token (keep max 5 sessions)
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }

    user.lastLogin = new Date();
    await user.save();

    // 6. Return exact structured response
    return res.json({
      message: "Login successful",
      userName: user.name,
      userEmail: user.email,
      phone: user.phone || "",
      role: role,
      isActive: user.isActive ?? true,
      accessToken,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const user = await findUserByIdAndRole(decoded.userId, decoded.role);
    if (!user || !user.refreshTokens.find((t) => t.token === refreshToken)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(
      user._id,
      user.schoolId,
      user.role,
    );
    const newRefreshToken = generateRefreshToken(
      user._id,
      user.schoolId,
      user.role,
    );

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== refreshToken,
    );
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await findUserByIdAndRole(req.user.userId, req.user.role);

    if (refreshToken && user) {
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== refreshToken,
      );
      await user.save();
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const Model = getUserModelByRole(req.user.role);
    let query = Model.findById(req.user.userId).populate("schoolId");

    if (req.user.role === "student") {
      query = query.populate("classId").populate("subjectsEnrolled");
    } else if (req.user.role === "teacher") {
      query = query
        .populate("classTeacherOf")
        .populate("subjectIds")
        .populate({
          path: "subjectClassAssignments.subjectId",
          select: "name code standard",
        })
        .populate({
          path: "subjectClassAssignments.classId",
          select: "standard division",
        });
    }

    const user = await query.select("-password -refreshTokens");

    res.json({
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const Model = getUserModelByRole(req.user.role);

    const user = await Model.findByIdAndUpdate(
      req.user.userId,
      { name, phone, avatar },
      { new: true, runValidators: true },
    ).select("-password -refreshTokens");

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const Model = getUserModelByRole(req.user.role);

    const user = await Model.findById(req.user.userId).select("+password");

    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    if (!validatePasswordStrength(newPassword)) {
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 6 characters, contain 1 capital letter, 1 number, and 1 special character",
        });
    }

    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password - Send OTP Code
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user across collections
    let user = await User.findOne({ email });
    if (!user) user = await Teacher.findOne({ email });
    if (!user) user = await Student.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    // Generate unique 5-char code containing letters, numbers, and special characters
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specials = "!@#$%&*";

    // Guarantee at least one of each class
    const codeArray = [
      letters.charAt(Math.floor(Math.random() * letters.length)),
      numbers.charAt(Math.floor(Math.random() * numbers.length)),
      specials.charAt(Math.floor(Math.random() * specials.length)),
    ];

    // Fill the remaining 2 characters
    const pool = letters + numbers + specials;
    for (let i = 0; i < 2; i++) {
      codeArray.push(pool.charAt(Math.floor(Math.random() * pool.length)));
    }

    // Shuffle the array to randomize positions
    for (let i = codeArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [codeArray[i], codeArray[j]] = [codeArray[j], codeArray[i]];
    }

    const code = codeArray.join("");

    // Code valid for 1 minute
    user.passwordResetToken = code;
    user.passwordResetExpires = new Date(Date.now() + 60 * 1000); // 1 minute
    await user.save();

    // Send reset email via SMTP (or fallback log)
    const { sendResetEmail } = require("../utils/email");
    await sendResetEmail(email, code);

    res.json({
      message: "A 5-letter verification code has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify Reset Code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    let user = await User.findOne({ email });
    if (!user) user = await Teacher.findOne({ email });
    if (!user) user = await Student.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== code ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      return res.status(400).json({ message: "wrong code" });
    }

    res.json({ message: "Code verified successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, code, and new password are required" });
    }

    let user = await User.findOne({ email });
    if (!user) user = await Teacher.findOne({ email });
    if (!user) user = await Student.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    // Verify code again to prevent direct route hit
    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== code ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      return res.status(400).json({ message: "wrong code" });
    }

    // Validate new password strength
    if (!validatePasswordStrength(newPassword)) {
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 6 characters, contain 1 capital letter, 1 number, and 1 special character",
        });
    }

    // Update password
    user.password = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
