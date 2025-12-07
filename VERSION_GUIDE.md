# Version Management Guide

## Current Version: 1.0.0

This guide explains how to manage versions in the Sadhana Sanga application.

## Version Format

We use **Semantic Versioning** (semver): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes or major new features (e.g., 1.0.0 → 2.0.0)
- **MINOR**: New features, backwards-compatible (e.g., 1.0.0 → 1.1.0)
- **PATCH**: Bug fixes, small improvements (e.g., 1.0.0 → 1.0.1)

## How to Update Version

### 1. Update package.json
```json
{
  "version": "1.1.0"
}
```

### 2. Update version.json
```json
{
  "version": "1.1.0",
  "buildDate": "2025-12-09",
  "changelog": [
    {
      "version": "1.1.0",
      "date": "2025-12-09",
      "changes": [
        "Add your new features here",
        "List all changes in this version"
      ]
    }
  ]
}
```

### 3. Commit and Push
```bash
git add .
git commit -m "Release v1.1.0: Your commit message"
git push origin main
```

## Where Version is Displayed

1. **About Page**: Shows version dynamically from `version.json`
2. **GitHub Commits**: Version in commit messages for tracking
3. **Package.json**: Standard npm version field

## Version History

### v1.0.0 (2025-12-08)
- Initial release with version tracking
- Gender-based respectful addressing (Prabhuji/Mataji)
- Auto-redirect after onboarding
- Gender field in Settings
- UI consistency improvements
- Mobile-responsive design

## Best Practices

1. **Update version for EVERY push** to production
2. **Document changes** in version.json changelog
3. **Use meaningful commit messages** with version number
4. **Test thoroughly** before incrementing version
5. **Keep changelog** up-to-date for users

## Example Workflow

```bash
# 1. Make your changes
# 2. Update version.json (increment PATCH: 1.0.0 → 1.0.1)
# 3. Update package.json version
# 4. Commit with version
git commit -m "v1.0.1: Fixed gender display bug in settings"
# 5. Push to production
git push origin main
```

## Checking Current Version

Users can see the current version in:
- **About page** (bottom of page)
- Shows: Version number + Build date
- Format: "Sadhana Sanga v1.0.0" and "Build Date: 2025-12-08"
