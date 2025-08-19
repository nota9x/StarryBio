// This is the main configuration file for your link-in-bio page.
// Fill in the values below to customize your site.
// Make sure to keep the structure (curly braces, commas, quotes) intact.

const CONFIG = {
  // ---------------------------------------------------------------------------
  // 1. GENERAL SITE SETTINGS
  // ---------------------------------------------------------------------------

  "pageTitle": "", // The title that appears in the browser tab. Example: "John Doe's Links"

  // ---------------------------------------------------------------------------
  // 2. ANNOUNCEMENT BANNER
  // ---------------------------------------------------------------------------
  
  "announcement": {
    "enabled": false, // Set to `true` to show the banner, `false` to hide it.
    "text": "",       // The text you want to display in the banner. Example: "New project just launched! 🚀"
    "url": ""         // The full URL the banner should link to. Example: "https://github.com/your-repo"
  },

  // ---------------------------------------------------------------------------
  // 3. PROFILE SECTION
  // ---------------------------------------------------------------------------

  "profile": {
    "name": "", // Your name or username.
    "title": "", // A short bio or title. Example: "Software Developer | Cat Enthusiast"
    
    // The main image for your profile. 
    // It's best to use a local path to an image in your `assets/images/` folder.
    "profileImage": "", // Example: "assets/images/my-photo.webp"

    // A backup image URL in case the main one fails to load.
    // This should be a full URL to an image hosted online.
    "profileImageFallback": "" // Example: "https://your-image-host.com/photo.jpg"
  },

  // ---------------------------------------------------------------------------
  // 4. STATUS INDICATOR
  // This feature shows your current availability based on a schedule.
  // ---------------------------------------------------------------------------

  "statusIndicator": {
    "enabled": false, // Set to `true` to show the status indicator, `false` to hide it.
    
    // Find your timezone here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    "displayTimeZone": "America/New_York", // Example: "Europe/London", "Asia/Tokyo"

    // This is the status that will be shown if no other schedule matches.
    "defaultStatus": "home", // Must match one of the keys in the "statuses" object below (e.g., "home").

    // Define your different statuses here. You can add, remove, or edit these.
    // The key (e.g., "home", "school") is used to link to the schedule below.
    "statuses": {
      "home": { // This is the status key.
        "label": "Available",       // The text that appears in the tooltip and schedule modal.
        "color": "#23A559",         // The color of the status dot. (Hex color code)
        "icon": "online",           // The icon to use. Must match a key in the "icons" object below.
        "availabilityMessage": "Online and available to chat!" // A short message for the tooltip.
      },
      "school": {
        "label": "Busy",
        "color": "#F23F43",
        "icon": "dnd",
        "availabilityMessage": "Currently busy, will reply later."
      },
      "sleep": {
        "label": "Sleeping",
        "color": "#80848E",
        "icon": "offline",
        "availabilityMessage": "Will reply in the morning."
      }
      // You can add more statuses here, like "gaming", "working", etc.
    },

    // Provide paths to your status icon images.
    // These should be local paths to images in your `assets/images/` folder.
    "icons": {
      "online": "assets/images/online.webp",
      "idle": "assets/images/idle.webp",
      "dnd": "assets/images/dnd.webp",
      "offline": "assets/images/offline.webp"
    },

    // Define your schedule here. Time is in 24-hour format and UTC.
    // Use a UTC time converter to find the correct times for your timezone.
    "schedule": {
      "weekdays": [
        // Example: From 3:00 AM UTC to 11:00 AM UTC on weekdays, show the "sleep" status.
        { "status": "sleep", "startUTC": "03:00", "endUTC": "11:00" },
        { "status": "school", "startUTC": "11:45", "endUTC": "19:00" }
      ],
      "weekends": [
        { "status": "sleep", "startUTC": "04:00", "endUTC": "13:00" }
      ]
    },

    // Text for the tooltip that appears when hovering over the status indicator.
    "tooltip": {
      "localTimeLabel": "My Local Time:"
    },

    // Text for the schedule pop-up modal.
    "modalConfig": {
      "title": "My Schedule",
      "weekdayTitle": "Weekdays",
      "weekendTitle": "Weekends"
    }
  },

  // ---------------------------------------------------------------------------
  // 5. LINKS SECTION
  // Add all your social media and other links here.
  // ---------------------------------------------------------------------------

  "links": [
    // You can add as many links as you want. Copy and paste the structure below.
    // To reorder links, just move the entire block of code for that link.

    /* --- Example of a Standard Link ---
    {
      "mainText": "My Website",                  // The main, bold text for the link button.
      "displaySubtitle": "john-doe.com",        // The smaller text that appears below the main text.
      "url": "https://john-doe.com",            // The full URL the button should link to.
      "targetBlank": true,                      // Set to `true` to open in a new tab, `false` to open in the same tab.
      "iconSVGPath": "..."                      // The SVG path data for the icon. Find paths on sites like simpleicons.org.
    },
    */

    /* --- Example of a Discord Link with Copy Functionality ---
    {
      "type": "discord",                        // Special type to enable the copy-on-click feature.
      "mainText": "Discord",
      "subtitleToCopy": "johndoe#1234",          // The username that will be copied to the clipboard.
      "displaySubtitle": "johndoe#1234",        // The username shown on the button.
      "iconSVGPath": "..."                      // Discord icon SVG path.
    },
    */

    /* --- Example of a Link using an Image instead of an SVG Path ---
    {
      "mainText": "My Shop",
      "displaySubtitle": "Buy my cool stuff!",
      "url": "https://my-shop.com",
      "targetBlank": true,
      "iconImageURL": "assets/images/shop-icon.webp" // Path to a local image in `assets/images/`.
    },
    */
  ],

  // ---------------------------------------------------------------------------
  // 6. FOOTER SECTION
  // ---------------------------------------------------------------------------

  "footer": {
    "textPrefix": "©", // Text that appears before the year.
    "textSuffix": ""   // Text that appears after the year. Example: "John Doe"
  }
};
