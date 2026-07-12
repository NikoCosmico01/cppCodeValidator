# C++ Code Validator

A Full-Stack Web Application for Analyzing C++ code with [cppcheck](https://cppcheck.sourceforge.io/): paste code in the Browser, run static Analysis, and read the Diagnostics in a compiler-style report. Severity spectrum, clickable issues that jump to the offending line, and a local history of past runs.

- **FrontEnd** — React 18, Zustand, plain CSS (no UI framework)
- **BackEnd** — Node.js / Express API that Shells out to `cppcheck` and returns structured JSON

## Features

see [gitHub cppcheck](https://github.com/cppcheck-opensource/cppcheck)

## Prerequisites

- **Node.js 18+** and npm
- **cppcheck** on the Machine, Running the backend:
  - Linux: `sudo apt-get install cppcheck`
  - macOS: `brew install cppcheck`
  - Windows: `winget install Cppcheck.Cppcheck` (or the [installer](https://cppcheck.sourceforge.io/)), then either add it to `PATH` or set `CPPCHECK_PATH` in `backEnd/.env`

## Quick Start

```bash
# Install all Dependencies (npm workspaces)
npm install

# Create .env files (optional)
cp backEnd/.env.example backEnd/.env
cp frontEnd/.env.example frontEnd/.env

# Start Backend (http://localhost:3001) and Frontend (http://localhost:3000) together
npm run dev

# Or start them Individually
npm run dev:backend
npm run dev:frontend
```

## Configuration

### `backEnd/.env`

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | API port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed Frontend origin |
| `CPPCHECK_PATH` | `cppcheck` | Path to the cppcheck binary (resolved via `PATH` by default) |
| `TEMP_DIR` | `backEnd/temp` | Where submitted code is written before analysis |
| `MAX_CODE_SIZE` | `1048576` | Max submission size in bytes (1MB) |
| `ANALYSIS_TIMEOUT_MS` | `30000` | Analysis is killed after this many milliseconds |

### `frontEnd/.env`

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:3001/api` | Base URL of the Backend API |

## API

### `POST /api/check`

Analyze a Piece of C++ code.

```json
{
  "code": "int main() { int x; return x; }",
  "fileName": "main.cpp",
  "std": "c++17"
}
```

Response:

```json
{
  "success": true,
  "fileName": "main.cpp",
  "std": "c++17",
  "exitCode": 0,
  "issues": [
    {
      "id": "uninitvar",
      "severity": "error",
      "message": "Uninitialized variable: x",
      "verbose": null,
      "cwe": 457,
      "file": "main.cpp",
      "line": 1,
      "column": 21
    }
  ],
  "summary": { "total": 1, "error": 1 },
  "raw": "<?xml version=\"1.0\" ... >"
}
```

Errors: `400` invalid input, `413` code too large, `503` cppcheck not installed, `504` analysis timeout.

### `GET /api/health`

`{ "status": "ok", "uptime": 42 }` — liveness of the API process.

### `GET /api/version`

`{ "version": "Cppcheck 2.13" }` — installed cppcheck version (cached; `503` when cppcheck is missing).

## How an Analysis runs

1. The Frontend POSTs code, file name, and standard to `/api/check`.
2. The bBckend sanitizes the file name (base name only, allowed extensions only), writes the code to a Uniquely-named temp file, and spawns:
   `cppcheck --enable=all --std=<std> --suppress=missingIncludeSystem --suppress=checkersReport --xml --xml-version=2 <file>`
3. cppcheck writes its XML report to **stderr**; the Backend parses it into the structured issue list, deletes the temp file, and responds.
4. The Frontend renders the diagnostics, lights up the editor gutter, and stores a summary in history.

## Project Structure

```
├── backEnd/
│   ├── config/config.js          # env-driven configuration
│   ├── controllers/checkController.js  # validation, XML→JSON, responses
│   ├── routes/check.js           # /api routes
│   ├── utils/cppcheckRunner.js   # spawn cppcheck, temp files, timeout
│   └── server.js
├── frontEnd/
│   └── src/
│       ├── components/           # AppContainer, CodeEditor, ResultPanel, SubmissionHistory
│       ├── services/api.js       # fetch wrapper for the API
│       ├── store/codeStore.js    # Zustand store (code, settings, history)
│       └── styles/               # design tokens + per-component CSS
└── package.json                  # npm workspaces + dev scripts
```
