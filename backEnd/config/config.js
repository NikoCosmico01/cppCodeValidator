require('dotenv').config();
const path = require('path');

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  CPPCHECK_PATH: process.env.CPPCHECK_PATH || 'cppcheck',

  TEMP_DIR: process.env.TEMP_DIR || path.join(__dirname, '..', 'temp'),

  MAX_CODE_SIZE: parseInt(process.env.MAX_CODE_SIZE, 10) || 1048576, // 1MB
  ANALYSIS_TIMEOUT_MS: parseInt(process.env.ANALYSIS_TIMEOUT_MS, 10) || 30000,

  ALLOWED_EXTENSIONS: ['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp'],
  ALLOWED_STDS: ['c++03', 'c++11', 'c++14', 'c++17', 'c++20', 'c++23', 'c89', 'c99', 'c11'],
  DEFAULT_STD: 'c++17'
};
