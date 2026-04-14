// config/config.js
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CPPCHECK_PATH: process.env.CPPCHECK_PATH || '/usr/bin/cppcheck',
  TEMP_DIR: process.env.TEMP_DIR || './temp',
  MAX_FILE_SIZE: 1048576, // 1MB
  ALLOWED_EXTENSIONS: ['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp']
};
