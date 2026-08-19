const crypto = require('crypto');
const express = require('express');
const QRCode = require('qrcode');

const Order = require('../models/Order');
const { attachUploadBatch, upload } = require('../middleware/upload');
const { analyzeFiles } = require('../utils/fileAnalyzer');
const { uploadFileToSupabase } = require('../utils/supabaseStorage');
const { getSettings } = require('../utils/settings');
const { calculatePrice } = require('../utils/pricing');
const { buildUpiLink, buildWhatsAppLink } = require('../utils/payment');

const router = express.Router();

function createOrderId() {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `XRX-${ymd}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function cleanPhone(phone) {
  return String(phone || '').replace(/[^0-9+]/g, '').slice(0, 15);
}

router.get('/', async (req, res) => {
  res.render('index', { title: 'College Xerox Order Management' });
});

router.get('/upload', async (req, res) => {
  res.render('upload', { title: 'Upload Documents' });
});

router.post('/orders/preview', attachUploadBatch, upload.array('documents', 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.session.error = 'Please upload at least one file.';
      return res.redirect('/upload');
    }

    const customer = {
      name: String(req.body.name || '').trim(),
      phone: cleanPhone(req.body.phone),
      branch: String(req.body.branch || '').trim(),
      yearSection: String(req.body.yearSection || '').trim(),
      deliveryPlace: String(req.body.deliveryPlace || '').trim(),
      instructions: String(req.body.instructions || '').trim(),
    };

    if (!customer.name || !customer.phone || !customer.branch || !customer.yearSection || !customer.deliveryPlace) {
      req.session.error = 'Please fill all required customer details.';
      return res.redirect('/upload');
    }

    const options = {
      xeroxType: ['single', 'double', 'fourInOne'].includes(req.body.xeroxType) ? req.body.xeroxType : 'single',
      printColor: req.body.printColor === 'color' ? 'color' : 'bw',
      copies: Math.max(parseInt(req.body.copies || '1', 10), 1),
    };

    const files = await analyzeFiles(req.files);

for (let i = 0; i < req.files.length; i++) {
  const uploadedFile = req.files[i];

  const storageInfo = await uploadFileToSupabase(
    uploadedFile,
    req.uploadBatchId
  );

  files[i].storagePath = storageInfo.storagePath;
  files[i].bucket = storageInfo.bucket;
}
    const settings = await getSettings();
    const summary = calculatePrice(files, options, settings);
    const orderId = createOrderId();
    const upiLink = buildUpiLink({
      upiId: settings.upiId,
      shopName: settings.shopName,
      amount: summary.totalAmount,
      orderId,
    });
    const qrDataUrl = await QRCode.toDataURL(upiLink);

    req.session.pendingOrder = {
      orderId,
      customer,
      options,
      files,
      summary,
      upiLink,
    };

    res.render('preview', {
      title: 'Review Order & Pay',
      pendingOrder: req.session.pendingOrder,
      qrDataUrl,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/orders/confirm', async (req, res, next) => {
  try {
    const pendingOrder = req.session.pendingOrder;
    if (!pendingOrder) {
      req.session.error = 'Your order session expired. Please upload again.';
      return res.redirect('/upload');
    }

    const order = await Order.create({
      ...pendingOrder,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
    });

    delete req.session.pendingOrder;

    return res.redirect(`/order/${order.orderId}`);
  } catch (error) {
    next(error);
  }
});

router.get('/order/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).render('error', {
        title: 'Order Not Found',
        message: 'We could not find this order ID.',
      });
    }

    const settings = await getSettings();
    const supportMessage = `Hello ${settings.shopName}, I need help with my Xerox order. Order ID: ${order.orderId}. Name: ${order.customer.name}.`;
    const whatsappLink = buildWhatsAppLink(settings.whatsappNumber, supportMessage);

    res.render('confirmation', {
      title: 'Order Confirmation',
      order,
      whatsappLink,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
