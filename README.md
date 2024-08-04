# delete-unused-forks

Check all of the projects you've forked and get interactive prompts for deleting those that you never created PRs for.

What it looks like in action:

```
> npm start

> delete-unused-forks@1.0.0 start
> tsx .

Fetching list of forks...
Found 39.
Fetching PR info for acpi_call...
4 PRs found.
Fetching PR info for amplitude-dev-center...
1 PR found.
Fetching PR info for appmetrics-dash...
2 PRs found.
Fetching PR info for bandcamp-player...
No PRs found.
? Do you want to delete bandcamp-player? ( https://github.com/s-h-a-d-o-w/bandcamp-player ) (y/N)
```

## How to run

Requires node.js.

1. **Double-check my code!** It's simple and deleting repos automatically is obviously serious stuff. Which is maybe why github doesn't offer anything like this via the UI.
2. Clone this repo.
3. Create a `.env` file containing `GITHUB_USERNAME` and `GITHUB_TOKEN` with appropriate values. **The token has to have admin write permissions if you actually want to delete repos!**
4. `npm install`
5. `npm start`
