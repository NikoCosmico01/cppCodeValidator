// utils/cppcheckRunner.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class CppcheckRunner {
  constructor() {
    this.cppcheckPath = config.CPPCHECK_PATH;
  }

  /**
   * Run cppcheck on a file
   * @param {string} filePath - Path to file to check
   * @param {object} options - Cppcheck options
   * @returns {Promise<object>} - Results object
   */
  run(filePath, options = {}) {
    return new Promise((resolve, reject) => {
      // Build arguments
      const args = [
        '--enable=all',
        '--suppress=missingIncludeSystem',
        '--xml',
        '--xml-version=2',
        filePath
      ];

      // Add custom arguments if provided
      if (options.enable) {
        args[0] = `--enable=${options.enable}`;
      }
      if (options.suppress) {
        args.push(`--suppress=${options.suppress}`);
      }

      // Spawn cppcheck process
      const cppcheck = spawn(this.cppcheckPath, args);

      let xmlOutput = '';
      let errorOutput = '';
      let stdOutput = '';

      // Capture output
      cppcheck.stdout.on('data', (data) => {
        stdOutput += data.toString();
        if (data.toString().includes('<?xml')) {
          xmlOutput += data.toString();
        }
      });

      cppcheck.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // Handle process completion
      cppcheck.on('close', (code) => {
        resolve({
          exitCode: code,
          xml: xmlOutput,
          stderr: errorOutput,
          stdout: stdOutput,
          success: code === 0
        });
      });

      // Handle errors
      cppcheck.on('error', (error) => {
        reject({
          message: 'Failed to execute cppcheck',
          error: error.message
        });
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        cppcheck.kill();
        reject({
          message: 'Cppcheck timeout exceeded',
          timeout: true
        });
      }, 30000);
    });
  }

  /**
   * Create temporary file and run check
   * @param {string} code - C++ code to check
   * @param {string} fileName - File name
   * @returns {Promise<object>}
   */
  async checkCode(code, fileName = 'temp.cpp') {
    const tempDir = config.TEMP_DIR;
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `${Date.now()}_${fileName}`);

    try {
      // Write code to temp file
      fs.writeFileSync(tempFile, code, 'utf-8');

      // Run cppcheck
      const result = await this.run(tempFile);

      return result;
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }
}

module.exports = new CppcheckRunner();