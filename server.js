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

app.use(async (req, res, next) => {
  try {
    res.locals.settings = await getSettings();
    res.locals.isAdmin = Boolean(req.session && req.session.isAdmin);
    res.locals.currentPath = req.path;
    res.locals.success = req.session.success;
    res.locals.error = req.session.error;

    delete req.session.success;
    delete req.session.error;

    next();
  } catch (error) {
    next(error);
  }
});

app.use('/', customerRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  const statusCode = error.status || 500;

  res.status(statusCode).render('error', {
    title: 'Something went wrong',
    message: error.message || 'Unexpected server error.',
  });
});

// Export the Express app for Vercel
module.exports = app;

// Start the server locally
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