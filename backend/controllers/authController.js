const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadImage } = require('../services/cloudinaryService');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const verifyOtpHelper = async (target, enteredOtp) => {
  const otpRecord = await Otp.findOne({ target });
  if (!otpRecord || otpRecord.otp !== enteredOtp) {
    return false;
  }
  await Otp.deleteOne({ _id: otpRecord._id });
  return true;
};

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  college: user.college,
  department: user.department,
  year: user.year,
  phone: user.phone,
  profileImage: user.profileImage,
  role: user.role,
  createdAt: user.createdAt,
});

// @desc    Register user
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, college, department, year, phone, profileImage, otp } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(400, 'Email already registered');
  }

  // Verify OTP
  const target = phone || email;
  const isOtpValid = await verifyOtpHelper(target, otp);
  if (!isOtpValid) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  const role =
    process.env.ADMIN_EMAIL &&
    email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
      ? 'admin'
      : 'student';

  const user = await User.create({
    name,
    email,
    password,
    college,
    department,
    year,
    phone,
    profileImage,
    role,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: formatUser(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login user (initiates OTP verification)
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const otp = generateOtp();
  await Otp.findOneAndUpdate(
    { target: email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  console.log(`\n==========================================`);
  console.log(`[OTP SERVICE] Generated login OTP for Email (${email}): ${otp}`);
  console.log(`==========================================\n`);

  try {
    const { sendOtpEmail } = require('../services/emailService');
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error('Failed to send OTP email:', err.message);
  }

  res.json({
    success: true,
    requiresOTP: true,
    otp,
    message: 'OTP sent to email. Please verify to complete login.',
  });
});

// @desc    Get profile
// @route   GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: formatUser(req.user),
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, college, department, year, phone } = req.body;

  const user = req.user;

  if (name !== undefined) user.name = name;
  if (college !== undefined) user.college = college;
  if (department !== undefined) user.department = department;
  if (year !== undefined) user.year = year;
  if (phone !== undefined) user.phone = phone;

  if (req.file) {
    const uploaded = await uploadImage(req.file.buffer, 'unimart/profiles');
    user.profileImage = uploaded.url;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated',
    data: formatUser(user),
  });
});

// @desc    Logout (client clears token)
// @route   POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully. Clear the token on the client.',
  });
});

// @desc    Google Sign-in / Registration
// @route   POST /api/auth/google
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, email: mockEmail, name: mockName, profileImage: mockImage, otp, googleVerified } = req.body;
  
  let email, name, profileImage, googleId;

  if (idToken && !idToken.startsWith('mock_token_')) {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!response.ok) {
        throw new ApiError(400, 'Invalid Google Token');
      }
      const payload = await response.json();
      email = payload.email;
      name = payload.name;
      profileImage = payload.picture;
      googleId = payload.sub;
    } catch (err) {
      throw new ApiError(400, 'Google token verification failed: ' + err.message);
    }
  } else {
    // Fallback for mock client/automated tests
    email = mockEmail || (idToken ? idToken.replace('mock_token_', '') : null);
    if (!email) {
      throw new ApiError(400, 'Email or Google ID token is required');
    }
    googleId = `mock_google_id_${email.replace(/[@.]/g, '_')}`;
    name = mockName || email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    profileImage = mockImage || '';
  }

  // Verify OTP (skip if verified by Google OAuth/Chooser)
  const isGoogleVerified = googleVerified === true || (idToken && !idToken.startsWith('mock_token_'));

  if (!isGoogleVerified) {
    if (!otp) {
      const generatedOtp = generateOtp();
      await Otp.findOneAndUpdate(
        { target: email },
        { otp: generatedOtp, createdAt: new Date() },
        { upsert: true, new: true }
      );

      console.log(`\n==========================================`);
      console.log(`[OTP SERVICE] Generated Google login OTP for Email (${email}): ${generatedOtp}`);
      console.log(`==========================================\n`);

      try {
        const { sendOtpEmail } = require('../services/emailService');
        await sendOtpEmail(email, generatedOtp);
      } catch (err) {
        console.error('Failed to send OTP email:', err.message);
      }

      return res.status(200).json({
        success: true,
        requiresOTP: true,
        otp: generatedOtp,
        message: 'OTP sent to Google email. Please verify to complete login.',
      });
    }

    const isOtpValid = await verifyOtpHelper(email, otp);
    if (!isOtpValid) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }
  }

  // Find or create user
  let user = await User.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    const role =
      process.env.ADMIN_EMAIL &&
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
        ? 'admin'
        : 'student';

    user = await User.create({
      name,
      email,
      googleId,
      college: 'Global Campus',
      department: 'General Studies',
      year: '1st Year',
      profileImage,
      role,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Google Sign-in successful',
    data: {
      user: formatUser(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Send OTP for registration
// @route   POST /api/auth/otp/send
const sendOtp = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) {
    throw new ApiError(400, 'Email or Phone is required');
  }

  const target = phone || email;
  const otp = generateOtp();

  await Otp.findOneAndUpdate(
    { target },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  const method = phone ? `Phone (${phone})` : `Email (${email})`;
  console.log(`\n==========================================`);
  console.log(`[OTP SERVICE] Generated registration OTP for ${method}: ${otp}`);
  console.log(`==========================================\n`);

  if (!phone && email) {
    try {
      const { sendOtpEmail } = require('../services/emailService');
      await sendOtpEmail(email, otp);
    } catch (err) {
      console.error('Failed to send OTP email:', err.message);
    }
  }

  res.status(200).json({
    success: true,
    message: `OTP sent successfully to ${phone ? 'phone' : 'email'}`,
    otp,
  });
});

// @desc    Verify login OTP and return token
// @route   POST /api/auth/login/verify
const verifyLoginOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const isOtpValid = await verifyOtpHelper(email, otp);
  if (!isOtpValid) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: formatUser(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get Google Client ID
// @route   GET /api/auth/google/client-id
const getGoogleClientId = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  });
});

module.exports = { register, login, getProfile, updateProfile, logout, googleLogin, sendOtp, verifyLoginOtp, getGoogleClientId };
