const Settings = require('../models/Settings');

async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

module.exports = { getSettings };
