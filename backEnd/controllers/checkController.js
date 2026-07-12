const xml2js = require('xml2js');
const cppcheckRunner = require('../utils/cppcheckRunner');
const config = require('../config/config');

const SEVERITIES = ['error', 'warning', 'style', 'performance', 'portability', 'information'];

async function parseIssues(xml, displayName) {
  if (!xml || !xml.includes('<results')) return [];

  const parsed = await new xml2js.Parser().parseStringPromise(xml);
  const errors = parsed?.results?.errors?.[0]?.error || [];

  return errors.map((entry) => {
    const attrs = entry.$ || {};
    const location = entry.location?.[0]?.$ || {};
    return {
      id: attrs.id || 'unknown',
      severity: SEVERITIES.includes(attrs.severity) ? attrs.severity : 'information',
      message: attrs.msg || '',
      verbose: attrs.verbose && attrs.verbose !== attrs.msg ? attrs.verbose : null,
      cwe: attrs.cwe ? Number(attrs.cwe) : null,
      file: location.file ? displayName : null,
      line: location.line ? Number(location.line) : null,
      column: location.column ? Number(location.column) : null
    };
  });
}

function summarize(issues) {
  const summary = { total: issues.length };
  for (const severity of SEVERITIES) {
    const count = issues.filter((issue) => issue.severity === severity).length;
    if (count > 0) summary[severity] = count;
  }
  return summary;
}

class CheckController {
  async checkCode(req, res) {
    try {
      const { code, fileName = 'main.cpp', std } = req.body;

      if (typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Code is required'
        });
      }

      if (Buffer.byteLength(code, 'utf-8') > config.MAX_CODE_SIZE) {
        return res.status(413).json({
          success: false,
          message: `Code exceeds the maximum size (${Math.round(config.MAX_CODE_SIZE / 1024)}KB)`
        });
      }

      if (std !== undefined && !config.ALLOWED_STDS.includes(std)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported standard "${std}". Allowed: ${config.ALLOWED_STDS.join(', ')}`
        });
      }

      const result = await cppcheckRunner.checkCode(code, fileName, { std });
      const issues = await parseIssues(result.xml, result.fileName);

      return res.json({
        success: true,
        fileName: result.fileName,
        std: std || config.DEFAULT_STD,
        exitCode: result.exitCode,
        issues,
        summary: summarize(issues),
        raw: result.xml
      });
    } catch (error) {
      console.error('Error in checkCode:', error.message);
      const status = error.notFound ? 503 : error.timeout ? 504 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Internal server error',
        timeout: Boolean(error.timeout)
      });
    }
  }

  health(req, res) {
    res.json({
      status: 'ok',
      uptime: Math.round(process.uptime())
    });
  }

  async version(req, res) {
    try {
      const version = await cppcheckRunner.getVersion();
      res.json({ version });
    } catch (error) {
      res.status(error.notFound ? 503 : 500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CheckController();
