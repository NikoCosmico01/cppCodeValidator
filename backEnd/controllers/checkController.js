// controllers/checkController.js
const cppcheckRunner = require('../utils/cppcheckRunner');
const xml2js = require('xml2js');

class CheckController {
  /**
   * Check C++ code
   */
  async checkCode(req, res) {
    try {
      const { code, fileName = 'main.cpp' } = req.body;

      // Validate input
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Code is required'
        });
      }

      if (code.length > 1048576) {
        return res.status(400).json({
          success: false,
          message: 'Code exceeds maximum size (1MB)'
        });
      }

      // Run cppcheck
      const result = await cppcheckRunner.checkCode(code, fileName);

      // Parse XML output
      const parser = new xml2js.Parser();
      let parsedResults = null;

      if (result.xml) {
        try {
          parsedResults = await parser.parseStringPromise(result.xml);
        } catch (parseError) {
          console.error('XML parse error:', parseError);
        }
      }

      // Format response
      return res.json({
        success: result.exitCode === 0,
        exitCode: result.exitCode,
        fileName: fileName,
        results: {
          raw: result.xml,
          parsed: parsedResults,
          errors: result.stderr
        }
      });
    } catch (error) {
      console.error('Error in checkCode:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        timeout: error.timeout || false
      });
    }
  }

  /**
   * Health check endpoint
   */
  health(req, res) {
    res.json({
      status: 'OK',
      message: 'Cppcheck server is running'
    });
  }

  /**
   * Get cppcheck version
   */
  async version(req, res) {
    try {
      const { spawn } = require('child_process');
      const cppcheck = spawn(require('../config/config').CPPCHECK_PATH, ['--version']);

      let version = '';
      cppcheck.stdout.on('data', (data) => {
        version += data.toString();
      });

      cppcheck.on('close', () => {
        res.json({
          version: version.trim()
        });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CheckController();