// =============================================================================
// STARFIELD BIO CONFIGURATION
// =============================================================================

const CONFIG = {
  // ---------------------------------------------------------------------------
  // 1. SITE IDENTITY
  // ---------------------------------------------------------------------------
  "pageTitle": "StarryBio v2.0",

  // Theme: "midnight" (default) or "bright"
  "theme": "midnight",

  "profile": {
    "name": "Astronaut",
    "title": "Exploring the Digital Universe",
    "image": "assets/images/profile.webp", // Local path OR full URL
  },

  // ---------------------------------------------------------------------------
  // 2. LINKS
  // Icons: Paste an SVG Path (from simpleicons.org) OR a URL to an image.
  // The system automatically detects which one it is.
  // ---------------------------------------------------------------------------
  "links": [
    {
      "text": "GitHub",
      "subtitle": "@nota9x",
      "url": "https://github.com/nota9x",
      "icon": "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
    },
    {
      "text": "Discord",
      "subtitle": "Join the server",
      "url": "https://discord.gg/example",
      "icon": "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z",
    },
    // Example of a custom link type that handles "copy on click"
    {
      "text": "Discord Name",
      "subtitle": "Copy: nota9x#0000",
      "specialType": "copy",       // Logic handled in app.js
      "copyValue": "nota9x#0000",
      "icon": "assets/images/discord.svg" // Example using image path if you don't use SVG
    }
  ],

  // ---------------------------------------------------------------------------
  // 3. SCHEDULE & STATUS
  // All times are in UTC (24-hour format).
  // The system auto-converts these to the visitor's local time.
  // ---------------------------------------------------------------------------
  "status": {
    "enabled": true,
    
    // YOUR timezone. Used only to show "My Time" in the tooltip.
    "ownerTimeZone": "America/New_York", 

    "default": {
      "text": "Offline",
      "color": "#6B7280", // Gray
      "icon": "M20 12h-2v2h2v-2zm-4 0h-2v2h2v-2zm-4 0H8v2h4v-2zm-4 0H4v2h4v-2z" // Example 'sleep' or offline icon
    },

    // Define status types
    "types": {
      "available": {
        "text": "Available",
        "color": "#10B981", // Green
        "icon": "assets/images/online.webp",
        "message": "Online and ready to chat!"
      },
      "busy": {
        "text": "Busy / School",
        "color": "#EF4444", // Red
        "icon": "assets/images/dnd.webp",
        "message": "Focused on work. Replies slow."
      },
      "sleeping": {
        "text": "Sleeping",
        "color": "#6d7684", // Gray
        "icon": "assets/images/idle.webp", // Using idle for sleeping/offline typically
        "message": "Dreaming of electric sheep."
      }
    },

    // Schedule **IN UTC**
    // Days: "weekdays", "weekends", or "daily"
    "schedule": [
      { "status": "sleeping", "days": "daily",    "start": "05:00", "end": "13:00" }, 
      { "status": "busy",     "days": "weekdays", "start": "13:00", "end": "21:00" },
      { "status": "available","days": "weekdays", "start": "21:00", "end": "05:00" }, // Wrap around midnight works
      { "status": "available","days": "weekends", "start": "13:00", "end": "05:00" }
    ]
  },

  "announcement": {
    "enabled": true,
    "text": "Welcome to v2.0!",
    "url": "#"
  },

  "footer": {
    "copyright": "© 2026 a9x Development" // Add your copyright text here
  }
};

