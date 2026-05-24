const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const { sendOTPEmail } = require('../utils/sendEmail');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password.' });

    const otp       = generateOTP();
    const otpExpiry = new Date(Date.now() + (process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);
    const salt      = await bcrypt.genSalt(10);

    user.otpCode   = await bcrypt.hash(otp, salt);
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.json({ message: 'OTP sent to your email. It expires in 10 minutes.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found.' });

    if (!user.otpCode || !user.otpExpiry)
      return res.status(400).json({ message: 'No OTP requested. Please login first.' });

    if (new Date() > user.otpExpiry) {
      user.otpCode   = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please login again.' });
    }

    const isMatch = await bcrypt.compare(otp, user.otpCode);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid OTP. Please try again.' });

    user.otpCode    = null;
    user.otpExpiry  = null;
    user.isVerified = true;
    await user.save();

    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email)
      return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found.' });

    const otp       = generateOTP();
    const otpExpiry = new Date(Date.now() + (process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);
    const salt      = await bcrypt.genSalt(10);

    user.otpCode   = await bcrypt.hash(otp, salt);
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── SEARCH USERS (admin) ──────────────────────────────────────────────────────
const searchUsers = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Please provide a name to search.' });
    }

    const users = await User.find({
      name: { $regex: name.trim(), $options: 'i' },
    }).select('-password -otpCode -otpExpiry');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otpCode -otpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { name, email } = req.body;
    if (name)  user.name  = name;
    if (email) user.email = email;
    await user.save();
    res.json({ message: 'Profile updated.', name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otpCode -otpExpiry');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { register, login, verifyOtp, resendOtp, getProfile, updateProfile, getAllUsers, searchUsers };