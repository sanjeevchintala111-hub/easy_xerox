require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');

const connectDB = require('./config/db');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { getSettings } = require('./utils/settings');

const app = express();

const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// VIEW ENGINE
// --------------------------------------------------

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --------------------------------------------------
// SECURITY
// --------------------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// --------------------------------------------------
// BODY PARSING
// --------------------------------------------------

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// --------------------------------------------------
// STATIC FILES
// --------------------------------------------------

app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------------
// SESSION
// --------------------------------------------------

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      // Secure cookies on Vercel/production HTTPS
      secure: process.env.NODE_ENV === 'production',

      sameSite: 'lax',

      maxAge: 1000 * 60 * 60 * 3,
    },
  })
);

// --------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------

// Connect to MongoDB before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);

    next(error);
  }
});

// --------------------------------------------------
// GLOBAL EJS VARIABLES
// --------------------------------------------------

app.use(async (req, res, next) => {
  // Available on all EJS pages
  res.locals.currentPath = req.path || '/';

  res.locals.isAdmin = Boolean(
    req.session && req.session.isAdmin
  );

  res.locals.success = req.session?.success || null;

  res.locals.error = req.session?.error || null;

  res.locals.settings = {};

  // Remove flash messages after reading them
  if (req.session) {
    delete req.session.success;
    delete req.session.error;
  }

  try {
    res.locals.settings = await getSettings();
  } catch (error) {
    console.error('⚠️ Settings error:', error.message);

    // Don't crash the whole application
    res.locals.settings = {};
  }

  next();
});

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

app.use('/', customerRoutes);

app.use('/admin', adminRoutes);

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',

    message: 'The page you are looking for does not exist.',

    currentPath: req.path || '/',

    isAdmin: Boolean(req.session?.isAdmin),
  });
});

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use((error, req, res, next) => {
  console.error('❌ Application Error:', error);

  const statusCode = error.status || 500;

  res.status(statusCode).render('error', {
    title: 'Something went wrong',

    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong. Please try again later.'
        : error.message || 'Unexpected server error.',

    currentPath: req.path || '/',

    isAdmin: Boolean(req.session?.isAdmin),
  });
});

// --------------------------------------------------
// EXPORT FOR VERCEL
// --------------------------------------------------

module.exports = app;

// --------------------------------------------------
// LOCAL DEVELOPMENT SERVER
// --------------------------------------------------

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);

    connectDB()
      .then(() => {
        console.log('✅ MongoDB connected');
      })
      .catch((error) => {
        console.error(
          '❌ Failed to connect to MongoDB:',
          error.message
        );
      });
  });
}