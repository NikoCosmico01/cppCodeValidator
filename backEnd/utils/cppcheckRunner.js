// utils/cppcheckRunner.js
const { spawn } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/config');

class CppcheckRunner {
  constructor() {
    this.cppcheckPath = config.CPPCHECK_PATH;
    this.cachedVersion = null;
  }

  /**
   * Run cppcheck on a File.
   * @param {string} filePath - Path to the file to Check
   * @param {object} options - { std }
   * @returns {Promise<{exitCode: number, xml: string, stdout: string}>}
   */
  run(filePath, options = {}) {
    return new Promise((resolve, reject) => {
      const std = config.ALLOWED_STDS.includes(options.std)
        ? options.std
        : config.DEFAULT_STD;

      const args = [
        '--enable=all',
        `--std=${std}`,
        '--suppress=missingIncludeSystem',
        '--suppress=checkersReport',
        '--xml',
        '--xml-version=2',
        filePath
      ];

      const child = spawn(this.cppcheckPath, args, { windowsHide: true });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, config.ANALYSIS_TIMEOUT_MS);

      child.on('error', (error) => {
        clearTimeout(timer);
        const err = new Error(
          error.code === 'ENOENT'
            ? `cppcheck was not found at "${this.cppcheckPath}". Install it or set CPPCHECK_PATH.`
            : `Failed to execute cppcheck: ${error.message}`
        );
        err.notFound = error.code === 'ENOENT';
        reject(err);
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        if (timedOut) {
          const err = new Error(
            `Analysis exceeded the ${config.ANALYSIS_TIMEOUT_MS / 1000}s time limit`
          );
          err.timeout = true;
          return reject(err);
        }
        resolve({ exitCode: code, xml: stderr, stdout });
      });
    });
  }

  /**
   * Write code to a temp file, run cppcheck, always Clean up.
   * @param {string} code - C++ source to check
   * @param {string} fileName - Display name (sanitized before use)
   * @param {object} options - { std }
   * @returns {Promise<{exitCode: number, xml: string, stdout: string, fileName: string}>}
   */
  async checkCode(code, fileName = 'main.cpp', options = {}) {
    const safeName = this.sanitizeFileName(fileName);
    await fs.mkdir(config.TEMP_DIR, { recursive: true });

    const tempFile = path.join(
      config.TEMP_DIR,
      `${crypto.randomBytes(8).toString('hex')}_${safeName}`
    );

    try {
      await fs.writeFile(tempFile, code, 'utf-8');
      const result = await this.run(tempFile, options);
      return { ...result, fileName: safeName };
    } finally {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  sanitizeFileName(fileName) {
    const base = path.basename(String(fileName)).replace(/[^\w.\-]/g, '_');
    const ext = path.extname(base).toLowerCase();
    if (!base || base.startsWith('.') || !config.ALLOWED_EXTENSIONS.includes(ext)) {
      return 'main.cpp';
    }
    return base;
  }

  /**
   * Get the Installed cppcheck Version (cached after first call).
   * @returns {Promise<string>}
   */
  getVersion() {
    if (this.cachedVersion) return Promise.resolve(this.cachedVersion);

    return new Promise((resolve, reject) => {
      const child = spawn(this.cppcheckPath, ['--version'], { windowsHide: true });
      let output = '';

      child.stdout.on('data', (data) => { output += data.toString(); });
      child.on('error', (error) => {
        const err = new Error(
          error.code === 'ENOENT'
            ? `cppcheck was not found at "${this.cppcheckPath}". Install it or set CPPCHECK_PATH.`
            : error.message
        );
        err.notFound = error.code === 'ENOENT';
        reject(err);
      });
      child.on('close', () => {
        this.cachedVersion = output.trim();
        resolve(this.cachedVersion);
      });
    });
  }
}

module.exports = new CppcheckRunner();
