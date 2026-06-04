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
// - After changing styles or Simple Icons, run:
//   pnpm run build
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
  // - icon: A Simple Icons brand, an SVG path, or an image path.
  //
  // Icon options:
  // 1. Simple Icons brand:
  //    StarryBio downloads these SVGs at build time from the Simple Icons CDN.
  //    Use the brand name you see on simpleicons.org:
  //
  //    "icon": { "simpleIcon": "GitHub" }
  //
  //    Icons are downloaded white by default. Optional color fields:
  //    "icon": { "simpleIcon": "GitHub", "color": "white" }
  //    "icon": { "simpleIcon": "GitHub", "color": "111", "darkColor": "eee" }
  //
  //    If a brand has an unusual slug, add it yourself:
  //    "icon": { "simpleIcon": "Node.js", "slug": "nodedotjs" }
  //
  // 2. SVG path:
  //    Paste only the path data from an icon site such as Simple Icons.
  //    SVG paths usually start with "M".
  //
  // 3. Image path:
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
      "icon": { "simpleIcon": "GitHub" },
    },
    {
      "text": "Discord",
      "subtitle": "Join the server",
      "url": "https://discord.gg/example",
      "icon": { "simpleIcon": "Discord" },
    },
    {
      "text": "Discord Name",
      "subtitle": "Copy: nota9x#0000",
      "specialType": "copy",
      "copyValue": "nota9x#0000",
      "icon": { "simpleIcon": "Discord" },
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
    // - icon: Simple Icons brand, SVG path, or image path.
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
