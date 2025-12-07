# Prettier Configuration

This project uses Prettier for consistent code formatting across all workspaces.

## Configuration Files

### `.prettierrc` (Root)
The main Prettier configuration file with workspace-specific overrides:

- **Frontend (React/Next.js)**: Double quotes, no semicolons
- **Backend (NestJS)**: Single quotes, semicolons
- **Shared**: Single quotes, semicolons
- **Common**: 2-space indentation, 80 character line width, trailing commas

### `.prettierignore`
Excludes build outputs, dependencies, and generated files from formatting.

## Usage

### Format All Files
```bash
# From project root
npm run format

# Check formatting without making changes
npm run format:check
```

### Format Specific Workspace
```bash
# Backend only
npm run format -w backend

# Frontend only
npm run format -w frontend
```

### Format Single File
```bash
# Using local prettier
./node_modules/.bin/prettier --write path/to/file.ts
```

## IDE Integration

### WebStorm/IntelliJ IDEA
1. Go to **Settings/Preferences** → **Languages & Frameworks** → **JavaScript** → **Prettier**
2. Set **Prettier package**: `{project-root}/node_modules/prettier`
3. Enable **On save** or **On Reformat Code** options
4. The IDE will automatically detect `.prettierrc` and `.prettierignore`

### VS Code
Install the Prettier extension and add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Pre-commit Hook (Optional)

To ensure all committed code is formatted, you can add a pre-commit hook using Husky:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,md}": "prettier --write"
  }
}
```

## Formatting Rules Summary

| Rule | Frontend | Backend/Shared |
|------|----------|----------------|
| Semicolons | No | Yes |
| Quotes | Double | Single |
| Tab Width | 2 spaces | 2 spaces |
| Print Width | 80 chars | 80 chars |
| Trailing Commas | All | All |
| Arrow Parens | Always | Always |
| Bracket Spacing | Yes | Yes |

## Installing Dependencies

After pulling the latest changes, install Prettier:

```bash
# Install all dependencies including Prettier
npm install

# Or install in specific workspace
npm install -w frontend
npm install -w backend
```

