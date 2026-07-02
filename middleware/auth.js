function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  req.session.error = 'Please login to open admin panel.';
  return res.redirect('/admin/login');
}

module.exports = { requireAdmin };
