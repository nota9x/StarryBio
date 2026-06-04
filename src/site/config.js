// =============================================================================
// STARRYBIO CONFIGURATION
// =============================================================================
//
// This is the main file most users need to edit.
//
// How to edit safely:
// - Change the text inside quotes, for example "Astronaut".
// - Keep the property names exactly the same, for example "pageTitle".
// - Keep commas between items.
// - Paths are relative to src/site/. For example:
//   "assets/images/profile.webp" means src/site/assets/images/profile.webp.
// - After changing styles or assets, run:
//   pnpm run build:css
//   pnpm run start
//
// If the page stops loading after an edit, check your browser console. The most
// common cause is a missing comma, quote, or closing brace.

const CONFIG = {
  // ---------------------------------------------------------------------------
  // 1. SITE IDENTITY
  // ---------------------------------------------------------------------------
  //
  // pageTitle:
  // The text shown in the browser tab and search/link previews.
  //
  // favicon:
  // The small icon shown in the browser tab.
  // Supported file types: ico, png, svg, jpg, jpeg, gif, webp.
  // Replace this path with your own uploaded file, or leave it blank:
  // "favicon": "",
  //
  // theme:
  // Available options:
  // - "midnight": dark starry default
  // - "bright": brighter blue theme
  "pageTitle": "StarryBio v2.0",
  "favicon": "assets/images/favicon.webp",
  "theme": "midnight",

  // ---------------------------------------------------------------------------
  // 2. PROFILE CARD
  // ---------------------------------------------------------------------------
  //
  // name:
  // Your display name. Shorter names fit best.
  //
  // description:
  // A short subtitle under your name. One sentence works well.
  //
  // image:
  // Your profile picture. Upload an image to src/site/assets/images/ and update
  // the path below. Square images look best because the site crops it as a circle.
  // Supported file types: webp, png, jpg, jpeg, gif, svg.
  //
  // layout:
  // Available options:
  // - "vertical": image above text, best for most link-in-bio pages
  // - "horizontal": image beside text on larger screens
  "profile": {
    "name": "Astronaut",
    "description": "Exploring the Digital Universe",
    "image": "assets/images/profile.webp",
    "layout": "vertical",
  },

  // ---------------------------------------------------------------------------
  // 3. LINKS
  // ---------------------------------------------------------------------------
  //
  // Each object in this list creates one button.
  //
  // Basic link fields:
  // - text: The main button label.
  // - subtitle: Smaller helper text under the main label. Use "" to hide it.
  // - url: The destination. Use a full URL, such as "https://github.com/you".
  // - icon: Either an SVG path or an image path.
  //
  // Icon options:
  // 1. SVG path:
  //    Paste only the path data from an icon site such as Simple Icons.
  //    SVG paths usually start with "M".
  //
  // 2. Image path:
  //    Use a local file such as "assets/images/icon.webp", or an external URL.
  //    Local images should be placed inside src/site/assets/images/.
  //
  // Copy button:
  // Add "specialType": "copy" and "copyValue": "text to copy".
  // Copy buttons do not need a url.
  //
  // To add another link:
  // Copy one whole object, paste it below another object, then edit the values.
  "links": [
    {
      "text": "GitHub",
      "subtitle": "@nota9x",
      "url": "https://github.com/nota9x",
      "icon": "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
    },
    {
      "text": "Discord",
      "subtitle": "Join the server",
      "url": "https://discord.gg/example",
      "icon": "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z",
    },
    {
      "text": "Discord Name",
      "subtitle": "Copy: nota9x#0000",
      "specialType": "copy",
      "copyValue": "nota9x#0000",
      "icon": "assets/images/discord.svg",
    },
  ],

  // ---------------------------------------------------------------------------
  // 4. STATUS AND SCHEDULE
  // ---------------------------------------------------------------------------
  //
  // This feature shows a small status icon on your profile image. Visitors can
  // click it to see your schedule converted into their local time.
  //
  // enabled:
  // - true: show the status icon and schedule
  // - false: hide the status feature entirely
  //
  // ownerTimeZone:
  // Your real timezone. This is used only for the "your time" clock in the
  // tooltip. Use an IANA timezone name such as:
  // - "America/New_York"
  // - "America/Los_Angeles"
  // - "Europe/London"
  // - "Asia/Tokyo"
  //
  // Time conversion:
  // Schedule times below must be written in UTC, not your local time.
  // Use 24-hour HH:MM format only. Examples:
  // - "05:00" means 5:00 AM UTC
  // - "13:30" means 1:30 PM UTC
  // - "21:00" means 9:00 PM UTC
  //
  // Helpful conversion examples:
  // - New York during Eastern Standard Time: local time + 5 hours = UTC
  // - New York during Eastern Daylight Time: local time + 4 hours = UTC
  // - Los Angeles during Pacific Standard Time: local time + 8 hours = UTC
  // - Los Angeles during Pacific Daylight Time: local time + 7 hours = UTC
  //
  // Day rules:
  // - "daily": every day
  // - "weekdays": Monday through Friday, based on UTC days
  // - "weekends": Saturday and Sunday, based on UTC days
  //
  // Midnight ranges:
  // A range like "21:00" to "05:00" is valid. It means the status starts at
  // 21:00 UTC and continues through midnight until 05:00 UTC the next day.
  "status": {
    "enabled": true,

    "ownerTimeZone": "America/New_York",

    // default:
    // Used when no schedule item matches the current time.
    "default": {
      "text": "Offline",
      "color": "#6B7280",
      "icon": "M20 12h-2v2h2v-2zm-4 0h-2v2h2v-2zm-4 0H8v2h4v-2zm-4 0H4v2h4v-2z",
    },

    // types:
    // Define every status name that you want to use in the schedule.
    //
    // Each status can have:
    // - text: Label shown to visitors.
    // - color: Hex color for SVG mask icons and schedule dots.
    // - icon: SVG path or image path.
    // - message: Optional helper text in the status tooltip. Use "" to hide it.
    "types": {
      "available": {
        "text": "Available",
        "color": "#10B981",
        "icon": "assets/images/online.webp",
        "message": "Online and ready to chat!",
      },
      "busy": {
        "text": "Busy / School",
        "color": "#EF4444",
        "icon": "assets/images/dnd.webp",
        "message": "Focused on work. Replies slow.",
      },
      "sleeping": {
        "text": "Sleeping",
        "color": "#6d7684",
        "icon": "assets/images/idle.webp",
        "message": "Dreaming of electric sheep.",
      },
    },

    // schedule:
    // The first matching item wins, so put more specific items before broad ones.
    //
    // Required fields:
    // - status: Must match one of the names in "types" above.
    // - days: "daily", "weekdays", or "weekends".
    // - start: UTC start time in HH:MM format.
    // - end: UTC end time in HH:MM format.
    "schedule": [
      { "status": "sleeping", "days": "daily", "start": "05:00", "end": "13:00" },
      { "status": "busy", "days": "weekdays", "start": "13:00", "end": "21:00" },
      { "status": "available", "days": "weekdays", "start": "21:00", "end": "05:00" },
      { "status": "available", "days": "weekends", "start": "13:00", "end": "05:00" },
    ],
  },

  // ---------------------------------------------------------------------------
  // 5. ANNOUNCEMENT BANNER
  // ---------------------------------------------------------------------------
  //
  // Shows a dismissible banner at the top of the page.
  //
  // enabled:
  // - true: show the banner
  // - false: hide the banner
  //
  // text:
  // The message visitors see.
  //
  // url:
  // Optional. If set, the banner becomes clickable.
  // Use "#" for no real destination, or "" to make it a non-link banner.
  "announcement": {
    "enabled": true,
    "text": "Welcome to v2.0!",
    "url": "#",
  },

  // ---------------------------------------------------------------------------
  // 6. FOOTER
  // ---------------------------------------------------------------------------
  //
  // copyright:
  // Text shown at the bottom of the card.
  // You can use {year} if you want the current year inserted automatically.
  // Example: "© {year} Your Name"
  "footer": {
    "copyright": "© 2026 a9x Development",
  },
};
