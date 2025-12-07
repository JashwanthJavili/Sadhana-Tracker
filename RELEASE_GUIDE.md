# 🚀 Automated Version Management

## Quick Release (Recommended)

Just run this command and everything is automated:

```bash
# Windows
release.bat patch "Your change description"

# Or for bigger changes
release.bat minor "Added new feature"
release.bat major "Breaking changes"
```

This will automatically:
1. ✅ Update version in `package.json`
2. ✅ Update version in `version.json`
3. ✅ Add changelog entry with date
4. ✅ Stage all changes
5. ✅ Commit with version message
6. ✅ Push to GitHub

## Alternative: NPM Scripts

```bash
# Update version files only (doesn't commit/push)
npm run version:patch    # 1.0.1 → 1.0.2
npm run version:minor    # 1.0.1 → 1.1.0
npm run version:major    # 1.0.1 → 2.0.0

# Full release (updates, commits, pushes)
npm run release
```

## Manual Method

```bash
# 1. Update version
node scripts/update-version.js patch "Your changes"

# 2. Commit and push
git add .
git commit -m "v1.0.2: Your changes"
git push origin main
```

## Version Types

- **patch** (1.0.1 → 1.0.2): Bug fixes, small improvements
- **minor** (1.0.1 → 1.1.0): New features, no breaking changes  
- **major** (1.0.1 → 2.0.0): Breaking changes, major updates

## Examples

```bash
# Simple patch update
release.bat patch "Fixed navigation bug"

# Feature addition
release.bat minor "Added dark mode"

# Major redesign
release.bat major "Complete UI overhaul"
```

No more manual version updates! 🎉
