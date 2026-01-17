# ✨ StarryBio v2.0

A mesmerizing, starry-themed link-in-bio page powered by Cloudflare Workers.

## Features

- **Deep Space Animation**: Interactive starfield with shooting stars and parallax depth.
- **Fully Configurable**: Edit `src/site/config.js` to change your profile, links, icons, and schedule.
- **Smart Scheduling**: Define your availability in UTC, and visitors automatically see it in their local time.
- **Status Icons**: Support for both monochromatic SVG masks and full-color images.
- **Cloudflare Worker**: Edge-hosted for speed and scalability.

## Setup

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Generate Styles**:
    The project uses Tailwind CSS. You must generate the static CSS file before running the server.

    ```bash
    npm run build:css
    ```

    > **Note:** For real-time CSS updates during development, run `npm run watch:css` in a separate terminal.

3.  **Development**:
    Start the local development server:

    ```bash
    npm run start
    ```

4.  **Deployment**:
    Deploy to Cloudflare:
    ```bash
    npx wrangler deploy
    ```

## Configuration

Navigate to `src/site/config.js`.

- **Profile**: Update name, title, and images.
- **Links**: Add buttons with SVG paths (from [SimpleIcons](https://simpleicons.org)) or Image URLs.
- **Status**: Set your `ownerTimeZone`, define your `schedule` (in UTC), and point to your custom status icons.
- **Announcement**: Configure the banner text, URL, and enable/disable it.
- **Footer**: Custom copyright text.

## Styling

To customize colors or styles beyond the config, modify `src/site/input.css` and re-run `npm run build:css`.

## Project Structure

- `src/worker.ts`: Main Worker logic (routing, headers).
- `src/site/`: Static assets (HTML, CSS, JS, Images).
- `wrangler.jsonc`: Cloudflare configuration.
