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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 3,
    },
  })
);

// Make these variables available to ALL EJS pages
app.use(async (req, res, next) => {
  // Set these FIRST so even error pages have them
  res.locals.currentPath = req.path || '/';
  res.locals.isAdmin = Boolean(req.session && req.session.isAdmin);
  res.locals.success = req.session?.success || null;
  res.locals.error = req.session?.error || null;
  res.locals.settings = {};

  delete req.session.success;
  delete req.session.error;

  try {
    res.locals.settings = await getSettings();
    next();
  } catch (error) {
    console.error('Settings error:', error);

    // Don't crash the page because settings failed
    next();
  }
});

app.use('/', customerRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    currentPath: req.path || '/',
    isAdmin: Boolean(req.session && req.session.isAdmin),
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Application Error:', error);

  const statusCode = error.status || 500;

  res.status(statusCode).render('error', {
    title: 'Something went wrong',
    message: error.message || 'Unexpected server error.',
    currentPath: req.path || '/',
    isAdmin: Boolean(req.session && req.session.isAdmin),
  });
});

// Export the Express app for Vercel
module.exports = app;

// Start server locally
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    });
}