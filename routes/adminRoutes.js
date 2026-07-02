const path = require('path');
const fs = require('fs');
const express = require('express');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');

const Order = require('../models/Order');
const Settings = require('../models/Settings');
const { requireAdmin } = require('../middleware/auth');
const { getSettings } = require('../utils/settings');
const { buildWhatsAppLink } = require('../utils/payment');

const router = express.Router();

async function isValidAdminPassword(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compare(password, hash);

  // Demo fallback only. Use ADMIN_PASSWORD_HASH in production.
  return password === (process.env.ADMIN_PASSWORD || 'admin123');
}

router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.render('admin/login', { title: 'Admin Login' });
});

router.post('/login', async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const passwordOk = await isValidAdminPassword(password);

    if (username !== expectedUsername || !passwordOk) {
      req.session.error = 'Invalid admin username or password.';
      return res.redirect('/admin/login');
    }

    req.session.isAdmin = true;
    req.session.success = 'Admin login successful.';
    return res.redirect('/admin/dashboard');
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

router.get('/dashboard', requireAdmin, async (req, res, next) => {
  try {
    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      completedOrders,
      todayOrders,
      recentOrders,
      revenueAgg,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Order.countDocuments({ paymentStatus: 'Paid' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Order.find().sort({ createdAt: -1 }).limit(8),
      Order.aggregate([
        { $match: { paymentStatus: 'Paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$summary.totalAmount' } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: {
        totalOrders,
        pendingOrders,
        paidOrders,
        completedOrders,
        todayOrders,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/orders', requireAdmin, async (req, res, next) => {
  try {
    const status = req.query.status;
    const filter = status ? { orderStatus: status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.render('admin/orders', { title: 'Manage Orders', orders, status });
  } catch (error) {
    next(error);
  }
});

router.get('/orders/:orderId', requireAdmin, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      req.session.error = 'Order not found.';
      return res.redirect('/admin/orders');
    }

    const settings = await getSettings();
    const customerMessage = `Hello ${order.customer.name}, your Xerox order ${order.orderId} status is: ${order.orderStatus}.`;
    const customerWhatsappLink = buildWhatsAppLink(order.customer.phone, customerMessage);

    res.render('admin/order-detail', {
      title: `Order ${order.orderId}`,
      order,
      customerWhatsappLink,
      statuses: ['Pending', 'Paid', 'Printing', 'Ready for Pickup', 'Delivered', 'Cancelled'],
      paymentStatuses: ['Pending', 'Paid', 'Failed'],
      supportNumber: settings.whatsappNumber,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/orders/:orderId/update', requireAdmin, async (req, res, next) => {
  try {
    const allowedStatuses = ['Pending', 'Paid', 'Printing', 'Ready for Pickup', 'Delivered', 'Cancelled'];
    const allowedPaymentStatuses = ['Pending', 'Paid', 'Failed'];
    const update = {
      adminNote: String(req.body.adminNote || '').trim(),
    };

    if (allowedStatuses.includes(req.body.orderStatus)) update.orderStatus = req.body.orderStatus;
    if (allowedPaymentStatuses.includes(req.body.paymentStatus)) update.paymentStatus = req.body.paymentStatus;

    const order = await Order.findOneAndUpdate({ orderId: req.params.orderId }, update, { new: true });
    if (!order) {
      req.session.error = 'Order not found.';
      return res.redirect('/admin/orders');
    }

    req.session.success = 'Order updated successfully.';
    res.redirect(`/admin/orders/${order.orderId}`);
  } catch (error) {
    next(error);
  }
});

router.get('/orders/:orderId/download/:fileIndex', requireAdmin, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      req.session.error = 'Order not found.';
      return res.redirect('/admin/orders');
    }

    const fileIndex = Number(req.params.fileIndex);
    const file = order.files[fileIndex];
    if (!file || !file.diskPath || !fs.existsSync(file.diskPath)) {
      req.session.error = 'File not found on server.';
      return res.redirect(`/admin/orders/${order.orderId}`);
    }

    res.download(path.resolve(file.diskPath), file.originalName);
  } catch (error) {
    next(error);
  }
});

router.get('/settings', requireAdmin, async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.render('admin/settings', { title: 'Pricing Settings', settings });
  } catch (error) {
    next(error);
  }
});

router.post('/settings', requireAdmin, async (req, res, next) => {
  try {
    const settings = await getSettings();
    const fields = [
      'shopName',
      'whatsappNumber',
      'upiId',
      'singleSideRate',
      'doubleSideRate',
      'fourInOneRate',
      'colorRate',
      'minimumOrderAmount',
      'discountPercentage',
      'discountMinPdfs',
      'discountMinPagesPerPdf',
    ];

    for (const field of fields) {
      if (['shopName', 'whatsappNumber', 'upiId'].includes(field)) {
        settings[field] = String(req.body[field] || '').trim();
      } else {
        settings[field] = Math.max(Number(req.body[field] || 0), 0);
      }
    }

    await settings.save();
    req.session.success = 'Settings updated successfully.';
    res.redirect('/admin/settings');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
