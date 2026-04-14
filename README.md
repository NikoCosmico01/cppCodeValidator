# C++ Code Analyzer

A Full-Stack Web Application for Analyzing and Validating C++ code using cppcheck with a React FrontEnd and Node.JS/Express backEnd.


### Prerequisites
- Node.js 16+
- npm or yarn
- cppcheck installed (`apt-get install cppcheck` on Linux)

### Installation

```bash
# Install all Dependencies
npm run install-all

# Create ENV Files
cp backEnd/.env.example backEnd/.env
cp frontEnd/.env.example frontEnd/.env

# Start both backEnd and frontEnd
npm run dev

# Or start Individually
npm run dev --workspace=backEnd
npm run dev --workspace=frontEnd
```