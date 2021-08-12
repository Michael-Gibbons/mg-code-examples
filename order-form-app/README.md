# Order Form App

## Deployment

To deploy to production, you'll first need to add a remote for the production server's git repository:

```bash
git remote add live REDACTED
```

For deploying, push the `production` branch to the new `live` remote (make sure you have added your key in cPanel > SSH Access and authorized it):

```bash
git push live production
```

After you push, cPanel will run the commands in `.cpanel.yml` for the actual deployment, which will install any dependencies, run a new build, copy the updated app files to the directory serving the app, and restart the Node process to pick up the new changes.
