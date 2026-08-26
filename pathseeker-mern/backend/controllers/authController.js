import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

import User from '../models/User.js';

// ============================================================
// JWT
// ============================================================

const sign = (u) =>
  jwt.sign(
    {
      id: u._id,
      role: u.role,
    },
    process.env.JWT_SECRET || 'change_this_secret',
    {
      expiresIn: '7d',
    }
  );

// ============================================================
// HELPERS
// ============================================================

const parseListField = (raw) => {
  if (Array.isArray(raw)) {
    return raw
      .map((s) => String(s).trim())
      .filter(Boolean);
  }

  if (
    typeof raw !== 'string' ||
    !raw.trim()
  ) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed
        .map((s) => String(s).trim())
        .filter(Boolean);
    }
  } catch (_) {
    // Not JSON — use comma split
  }

  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

// ============================================================
// RESUME
// ============================================================

const uploadDir = path.join(
  process.cwd(),
  'uploads'
);

const deleteResumeFile = (filename) => {
  if (!filename) return;

  fs.unlink(
    path.join(uploadDir, filename),
    () => {
      // Ignore errors
    }
  );
};

// ============================================================
// EMAIL CONFIGURATION
// ============================================================

const createTransporter = () => {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    console.error(
      'EMAIL_USER or EMAIL_PASS is missing from .env'
    );

    return null;
  }

  /*
    Gmail SMTP

    Port 587 = STARTTLS
    secure:false is correct for port 587.

    For normal/production use:
      EMAIL_TLS_ALLOW_SELF_SIGNED=false

    If your local antivirus/network is injecting
    a self-signed certificate, you can temporarily
    set:
      EMAIL_TLS_ALLOW_SELF_SIGNED=true

    DO NOT use that setting in production.
  */

  const allowSelfSigned =
    process.env.EMAIL_TLS_ALLOW_SELF_SIGNED === 'true';

  console.log('SMTP CONFIG:', {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    email: process.env.EMAIL_USER,
    allowSelfSigned,
  });

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',

    port: 587,

    secure: false,

    requireTLS: true,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    tls: {
      rejectUnauthorized: !allowSelfSigned,
    },

    connectionTimeout: 30000,

    greetingTimeout: 30000,

    socketTimeout: 30000,
  });
};

// ============================================================
// REGISTER
// ============================================================

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Name, email and password required',
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          'Email already registered',
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const u = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      token: sign(u),

      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
      },
    });
  } catch (e) {
    console.error(
      'Register error:',
      e
    );

    res.status(500).json({
      message: e.message,
    });
  }
};

// ============================================================
// LOGIN
// ============================================================

export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const normalizedEmail =
      email?.toLowerCase().trim();

    const u = await User.findOne({
      email: normalizedEmail,
    });

    if (
      !u ||
      !(await bcrypt.compare(
        password,
        u.password
      ))
    ) {
      return res.status(401).json({
        message:
          'Invalid credentials',
      });
    }

    u.lastLoginAt = new Date();

    await u.save();

    res.json({
      token: sign(u),

      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,

        education: u.education,
        skills: u.skills,
        interests: u.interests,
        experience: u.experience,
        resume: u.resume,
        resumeVisibility:
          u.resumeVisibility,
      },
    });
  } catch (e) {
    console.error(
      'Login error:',
      e
    );

    res.status(500).json({
      message: e.message,
    });
  }
};

// ============================================================
// FORGOT PASSWORD
// ============================================================

export const forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message:
          'Please enter your email address.',
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    /*
      Security:
      Don't reveal whether the email
      actually exists.
    */

    if (!user) {
      return res.json({
        message:
          'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // --------------------------------------------------------
    // Email configuration
    // --------------------------------------------------------

    const transporter =
      createTransporter();

    if (!transporter) {
      return res.status(500).json({
        message:
          'Email service is not configured. Please check EMAIL_USER and EMAIL_PASS in your .env file.',
      });
    }

    // --------------------------------------------------------
    // Generate secure reset token
    // --------------------------------------------------------

    const resetToken =
      crypto.randomBytes(32).toString('hex');

    // --------------------------------------------------------
    // Hash token before saving
    // --------------------------------------------------------

    const hashedToken =
      crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    user.resetPasswordToken =
      hashedToken;

    // Token expires after 15 minutes

    user.resetPasswordExpires =
      new Date(
        Date.now() +
          15 * 60 * 1000
      );

    await user.save();

    // --------------------------------------------------------
    // Reset URL
    // --------------------------------------------------------

    const clientUrl =
      process.env.CLIENT_URL ||
      'http://localhost:5173';

    const resetUrl =
      `${clientUrl}/reset-password/${resetToken}`;

    console.log(
      'RESET URL:',
      resetUrl
    );

    // --------------------------------------------------------
    // Send email
    // --------------------------------------------------------

    await transporter.sendMail({
      from:
        `"PathSeeker" <${process.env.EMAIL_USER}>`,

      to: user.email,

      subject:
        'PathSeeker - Reset Your Password',

      html: `
        <!DOCTYPE html>

        <html>

        <head>
          <meta charset="UTF-8">

          <title>
            Reset Your Password
          </title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f4f6f8;
            font-family:Arial, Helvetica, sans-serif;
          "
        >

          <div
            style="
              max-width:600px;
              margin:40px auto;
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
              box-shadow:0 8px 30px rgba(0,0,0,0.08);
            "
          >

            <!-- HEADER -->

            <div
              style="
                background:#111827;
                padding:30px;
                text-align:center;
              "
            >

              <div
                style="
                  width:55px;
                  height:55px;
                  line-height:55px;
                  margin:auto;
                  background:#ffffff;
                  color:#111827;
                  border-radius:14px;
                  font-size:20px;
                  font-weight:bold;
                "
              >
                PS
              </div>

              <h2
                style="
                  color:#ffffff;
                  margin:15px 0 5px;
                "
              >
                PathSeeker
              </h2>

              <p
                style="
                  color:#d1d5db;
                  margin:0;
                  font-size:13px;
                "
              >
                Discover What Fits You Best.
              </p>

            </div>

            <!-- CONTENT -->

            <div
              style="
                padding:35px;
              "
            >

              <h2
                style="
                  color:#111827;
                  margin-top:0;
                "
              >
                Reset your password
              </h2>

              <p
                style="
                  color:#4b5563;
                  line-height:1.7;
                "
              >
                We received a request to reset
                the password for your PathSeeker
                account.
              </p>

              <p
                style="
                  color:#4b5563;
                  line-height:1.7;
                "
              >
                Click the button below to create
                a new password.
              </p>

              <!-- BUTTON -->

              <div
                style="
                  text-align:center;
                  margin:30px 0;
                "
              >

                <a
                  href="${resetUrl}"
                  style="
                    display:inline-block;
                    background:#111827;
                    color:#ffffff;
                    text-decoration:none;
                    padding:14px 28px;
                    border-radius:8px;
                    font-weight:bold;
                  "
                >
                  Reset Password
                </a>

              </div>

              <!-- EXPIRY -->

              <div
                style="
                  background:#f9fafb;
                  border-radius:8px;
                  padding:15px;
                  margin-top:25px;
                "
              >

                <p
                  style="
                    margin:0;
                    color:#6b7280;
                    font-size:13px;
                    line-height:1.6;
                  "
                >
                  This password reset link will
                  expire in
                  <strong>
                    15 minutes
                  </strong>.
                </p>

              </div>

              <p
                style="
                  color:#6b7280;
                  font-size:13px;
                  line-height:1.6;
                  margin-top:25px;
                "
              >
                If you didn't request a password
                reset, you can safely ignore
                this email.
              </p>

            </div>

            <!-- FOOTER -->

            <div
              style="
                border-top:1px solid #e5e7eb;
                padding:20px;
                text-align:center;
              "
            >

              <p
                style="
                  color:#9ca3af;
                  font-size:12px;
                  margin:0;
                "
              >
                © ${new Date().getFullYear()}
                PathSeeker
              </p>

            </div>

          </div>

        </body>

        </html>
      `,
    });

    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    return res.json({
      message:
        'If an account exists with this email, a password reset link has been sent.',
    });

  } catch (e) {
    console.error(
      'FORGOT PASSWORD ERROR:',
      e
    );

    return res.status(500).json({
      message:
        e.message ||
        'Unable to process your request.',
    });
  }
};

// ============================================================
// RESET PASSWORD
// ============================================================

export const resetPassword = async (
  req,
  res
) => {
  try {
    const { token } =
      req.params;

    const { password } =
      req.body;

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!token) {
      return res.status(400).json({
        message:
          'Password reset token is missing.',
      });
    }

    if (!password) {
      return res.status(400).json({
        message:
          'Please enter a new password.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long.',
      });
    }

    // --------------------------------------------------------
    // Hash token received from URL
    // --------------------------------------------------------

    const hashedToken =
      crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // --------------------------------------------------------
    // Find valid token
    // --------------------------------------------------------

    const user =
      await User.findOne({
        resetPasswordToken:
          hashedToken,

        resetPasswordExpires: {
          $gt: new Date(),
        },
      });

    if (!user) {
      return res.status(400).json({
        message:
          'This password reset link is invalid or has expired.',
      });
    }

    // --------------------------------------------------------
    // Hash new password
    // --------------------------------------------------------

    user.password =
      await bcrypt.hash(
        password,
        10
      );

    // --------------------------------------------------------
    // Remove reset token
    // --------------------------------------------------------

    user.resetPasswordToken =
      undefined;

    user.resetPasswordExpires =
      undefined;

    await user.save();

    return res.json({
      message:
        'Password reset successfully. You can now login with your new password.',
    });

  } catch (e) {
    console.error(
      'RESET PASSWORD ERROR:',
      e
    );

    return res.status(500).json({
      message:
        e.message ||
        'Unable to reset password. Please try again.',
    });
  }
};

// ============================================================
// PROFILE
// ============================================================

export const profile = async (
  req,
  res
) => {
  try {
    const u =
      await User.findById(
        req.user.id
      ).select('-password');

    if (!u) {
      return res.status(404).json({
        message:
          'User not found',
      });
    }

    const {
      name,
      education,
      skills,
      interests,
      experience,
      resumeVisibility,
      removeResume,
    } = req.body;

    u.name =
      name ?? u.name;

    u.education =
      education ?? u.education;

    u.experience =
      experience ?? u.experience;

    const rawSkills =
      req.body['skills[]'] ??
      skills;

    const rawInterests =
      req.body['interests[]'] ??
      interests;

    u.skills =
      parseListField(
        rawSkills
      );

    u.interests =
      parseListField(
        rawInterests
      );

    // Resume visibility

    if (
      resumeVisibility ===
        'public' ||
      resumeVisibility ===
        'private'
    ) {
      u.resumeVisibility =
        resumeVisibility;
    }

    // Remove resume

    if (
      (
        removeResume ===
          'true' ||
        removeResume === true
      ) &&
      !req.file
    ) {
      deleteResumeFile(
        u.resume
      );

      u.resume =
        undefined;
    }

    // New resume

    if (req.file) {
      if (u.resume) {
        deleteResumeFile(
          u.resume
        );
      }

      u.resume =
        req.file.filename;
    }

    await u.save();

    res.json({
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,

        education:
          u.education,

        skills:
          u.skills,

        interests:
          u.interests,

        experience:
          u.experience,

        resume:
          u.resume,

        resumeVisibility:
          u.resumeVisibility,
      },
    });

  } catch (e) {
    console.error(
      'Profile error:',
      e
    );

    res.status(500).json({
      message:
        e.message,
    });
  }
};