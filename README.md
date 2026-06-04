# ✨ StarryBio v2.0

A mesmerizing, starry-themed link-in-bio page powered by Cloudflare Workers.

Demo: [a9x.pro](https://a9x.pro)

## Features

- **Deep Space Animation**: Interactive starfield with shooting stars and parallax depth.
- **Fully Configurable**: Edit `src/site/config.js` to change your profile, links, icons, and schedule.
- **Smart Scheduling**: Define your availability in UTC, and visitors automatically see it in their local time.
- **Status Icons**: Support for both monochromatic SVG masks and full-color images.
- **Cloudflare Worker**: Edge-hosted for speed and scalability.

## Setup

This project uses pnpm and Wrangler 4, which requires a current Node.js release. Node.js 20.3 or newer is recommended.

1.  **Install Dependencies**:

    ```bash
    pnpm install
    ```

2.  **Generate Styles**:
    The project uses Tailwind CSS. You must generate the static CSS file before running the server.

    ```bash
    pnpm run build:css
    ```

    > **Note:** For real-time CSS updates during development, run `pnpm run watch:css` in a separate terminal.

3.  **Development**:
    Start the local development server:

    ```bash
    pnpm run start
    ```

4.  **Deployment**:
    Deploy to Cloudflare:

    ```bash
    pnpm run deploy
    ```

    You can also run `pnpm exec wrangler deploy` directly after generating `src/site/style.css`.

## Configuration

Navigate to `src/site/config.js`.

- **Profile**: Update name, description, image path, and layout.
- **Links**: Add buttons with SVG paths (from [SimpleIcons](https://simpleicons.org)) or Image URLs.
- **Status**: Set your `ownerTimeZone`, define your `schedule` (in UTC), and point to your custom status icons.
- **Announcement**: Configure the banner text, URL, and enable/disable it.
- **Footer**: Custom copyright text.

The example config points to common customizable assets such as a profile image and favicon. Add those files under `src/site/assets/images/`, or update the paths in `config.js` to match your own hosted images.

## Styling

To customize colors or styles beyond the config, modify `src/site/input.css` and re-run `pnpm run build:css`.

To check the Worker TypeScript without deploying, run:

```bash
pnpm run typecheck
```

## Project Structure

- `src/worker.ts`: Main Worker logic (routing, headers).
- `src/site/`: Static assets (HTML, CSS, JS, Images).
- `wrangler.jsonc`: Cloudflare configuration.
