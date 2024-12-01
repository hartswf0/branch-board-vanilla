# branch-board-vanilla
Branch board vanilla

## GitHub Pages Deployment

### Troubleshooting Path Issues

If your site looks different when deployed to GitHub Pages:

1. Ensure all asset paths are relative:
   - Use `href="src/styles/main.css"` instead of `href="/src/styles/main.css"`
   - Use `src="src/scripts/main.js"` instead of `src="/src/scripts/main.js"`

2. Verify that all referenced files (SVGs, images) exist in the correct relative locations

### Deployment Steps

1. Go to your repository Settings
2. Navigate to Pages section
3. Select "main" branch as source
4. Ensure root directory is selected

### Common Gotchas

- Remove any live-server specific scripts before deployment
- Check browser developer tools for any 404 errors on resources
- Use relative paths consistently
