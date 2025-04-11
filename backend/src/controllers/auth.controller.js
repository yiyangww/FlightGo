const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

// User registration
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.account.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await prisma.account.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'USER'
      }
    });

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await prisma.account.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user information
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.account.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        role: true,
        passengers: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user information error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    // 1. Handle authentication error
    if (req.authError) {
      console.error('Google OAuth error:', req.authError);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
    
    // 2. Handle authentication failure
    if (!req.authUser) {
      const info = req.authInfo || {};
      
      // Handle email already exists
      if (info.message === 'EMAIL_EXISTS') {
        const email = info.email || '';
        console.log(`Email already exists: ${email}`);
        
        // Redirect to specific page
        return res.redirect(`${process.env.FRONTEND_URL}/email-exists?email=${encodeURIComponent(email)}`);
      }
      
      // Other authentication failure
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
    
    // 3. Handle authentication success
    const { id, username, role } = req.authUser;
    
    // Create JWT token
    const token = jwt.sign(
      { id, username, role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Redirect to frontend page, and pass the token
    return res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
  } catch (error) {
    // Handle unexpected errors
    console.error('Google OAuth callback unexpected error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};