import type { StarryBioConfig } from '../src/config/schema';

/*
  StarryBio main settings
  -----------------------
  This file controls the public content, appearance, links, status schedule,
  search/social metadata, generated QR code, generated contact card, and analytics.

  You usually do not need to edit any files in src/ to customize the site.

  How to safely edit this file:
  - Text values must stay inside quotes: 'My Text'
  - Most lines end with a comma. Keep the commas.
  - true means "yes/on". false means "no/off".
  - Do not rename the option names on the left side, like pageTitle or profile.
  - You can change the values on the right side.
  - To temporarily remove an optional line, put // in front of it.
  - To bring back a commented example, remove the // at the start of that line.
  - Local files live in the public folder.
    Example: 'assets/images/profile.svg' means public/assets/images/profile.svg.
  - Full website URLs should usually start with https://.
  - Colors must be hex colors, such as '#10B981', '#fff', or '#ffffff'.
  - Dates use ISO format, such as '2026-06-15T12:00:00Z'.
  - Times in schedules use 24-hour HH:MM format, such as '09:30' or '21:00'.

  After editing, run:
  pnpm run validate

  It will check this file and tell you if you made a syntax error, as well as how to fix it.
*/

const config = {
  /*
    pageTitle
    What it does:
    - Sets the text shown in the browser tab.
    - Can be used as a fallback title for search/social metadata.

    What to put here:
    - A short site name, person name, brand name, or page title.

    Examples:
    - 'Jane Doe'
    - 'Avery Links'
    - 'StarryBio v3.0'
  */
  pageTitle: 'StarryBio v3.0',

  /*
    favicon
    What it does:
    - Sets the small icon shown in the browser tab, bookmarks, and some browser history views.

    What to put here:
    - A path to an image under public/.
    - Common formats: .svg, .png, .ico.

    Example:
    - 'assets/images/favicon.svg' points to public/assets/images/favicon.svg.
  */
  favicon: 'assets/images/favicon.svg',

  /*
    theme
    What it does:
    - Controls the site's overall visual mood: colors, background, button style, and animation feel.
    - This is the fastest way to make the page look different without editing CSS.

    Simple version:
    - If you only want to choose a preset, you can replace this whole object with:
      theme: 'midnight',

    Detailed version:
    - Keep the object below when you want to control preset, dark/light mode,
      button style, background, and animation intensity separately.
  */
  theme: {
    /*
      preset
      What it does:
      - Chooses the base color palette and personality of the page.
      - Other theme settings can adjust the preset.

      Allowed values:
      - 'nebula': purple space feeling; good for creative or dreamy pages.
      - 'midnight': dark blue/gray feeling; good general default.
      - 'aurora': green accent feeling; good for fresh/active branding.
      - 'eclipse': warm dark feeling; good for softer dark pages.
      - 'cosmic-gold': gold accent feeling; good for premium/project pages.
      - 'minimal': cleaner and simpler; good when you want less visual noise.
      - 'terminal': command-line style; good for developer/hacker profiles.
      - 'bright': old legacy value; currently treated like 'midnight'.

      Safe thing to try:
      - Change only this value first, then preview the site.
    */
    preset: 'midnight',

    /*
      accent
      What it does:
      - Overrides the preset's main accent color.
      - The accent may be used for highlights, focus states, active details, and metadata.

      When to use it:
      - Use this when you like a preset but want your own brand color.

      Format:
      - Must be a hex color, like '#7ddf9b' or '#a78bfa'.

      Note:
      - This line is commented out, so it is currently inactive.
      - Remove the // at the start of the next line to turn it on.
    */
    // accent: '#7ddf9b',

    /*
      mode
      What it does:
      - Chooses dark or light color mode.

      Allowed values:
      - 'dark': dark background with lighter text.
      - 'light': light background with darker text.

      Tip:
      - Some presets naturally look better in one mode than the other.
    */
    mode: 'dark',

    /*
      buttonStyle
      What it does:
      - Changes how link buttons/cards look.

      Allowed values:
      - 'glass': translucent/glassy look; good with space backgrounds.
      - 'solid': stronger filled buttons; easiest to read.
      - 'outline': bordered buttons; lighter visual weight.
      - 'minimal': very simple; good for clean pages.
      - 'terminal': command-line inspired; best with terminal theme/layout.
    */
    buttonStyle: 'glass',

    /*
      background
      What it does:
      - Chooses the page background style behind the profile and links.

      Allowed values:
      - 'starfield': animated stars; signature StarryBio look.
      - 'gradient': smoother color background.
      - 'minimal': quiet/simple background.

      Tip:
      - If the page feels too busy, try 'minimal' or lower animationIntensity.
    */
    background: 'starfield',

    /*
      animationIntensity
      What it does:
      - Controls how much decorative movement the theme uses.
      - This does not remove the content; it only changes motion/decorative effects.

      Allowed values:
      - 'none': no decorative animation.
      - 'subtle': small amount of motion.
      - 'normal': default amount of motion.
      - 'high': more noticeable motion.

      Tip:
      - Use 'subtle' if the page should feel calmer.
      - Use 'none' for a very static/professional page.
    */
    animationIntensity: 'normal',
  },

  /*
    layout
    What it does:
    - Controls how the profile, featured cards, and link sections are arranged.
    - It does not change the actual text or links.
  */
  layout: {
    /*
      mode
      What it does:
      - Chooses the main page structure.

      Allowed values:
      - 'centered': profile and links in a centered column; best all-purpose choice.
      - 'split-screen': profile on one side and links on the other; good on desktop.
      - 'profile-card': makes the profile area feel more like a card.
      - 'compact': tighter spacing; good when you have many links.
      - 'creator-grid': more grid-based; good for creators with varied content.
      - 'portfolio': better for showcasing work/projects.
      - 'terminal': command-line inspired structure.

      Tip:
      - If you are unsure, use 'centered'.
    */
    mode: 'centered',

    /*
      linkStyle
      What it does:
      - Controls the shape and visual treatment of regular links.

      Allowed values:
      - 'cards': larger clickable areas; good when links have subtitles/descriptions.
      - 'buttons': more traditional button-like links.
      - 'minimal': cleaner list-like links.
      - 'terminal': command-line inspired links.
    */
    linkStyle: 'cards',

    /*
      profilePosition
      What it does:
      - Controls where the profile appears when the layout supports multiple positions.

      Allowed values:
      - 'top': profile appears above links.
      - 'left': profile appears to the left on wider screens.

      Note:
      - Some layouts may visually ignore this if that placement does not apply.
    */
    profilePosition: 'top',

    /*
      featuredPosition
      What it does:
      - Controls where featured cards appear compared with regular link sections.

      Allowed values:
      - 'above-links': featured cards show before regular links.
      - 'below-links': featured cards show after regular links.

      Use 'above-links' for:
      - Current launch, newest video, important project, booking link, or shop.

      Use 'below-links' for:
      - Secondary highlights that should not distract from the main links.
    */
    featuredPosition: 'above-links',
  },

  /*
    animation
    What it does:
    - Gives extra numeric control over the background animation.
    - This works alongside theme.animationIntensity.

    Values:
    - 0 means none of that specific effect.
    - 0.5 means half as much as normal.
    - 1 means normal.
    - 2 means twice as much as normal.

    Tip:
    - If a computer or phone feels slow while viewing the page, lower these values.
  */
  animation: {
    /*
      starMultiplier
      What it does:
      - Controls how many background stars are drawn compared with the normal amount.
    */
    starMultiplier: 1,

    /*
      shootingStarMultiplier
      What it does:
      - Controls how many shooting-star streaks appear compared with the normal amount.
    */
    shootingStarMultiplier: 1,
  },

  /*
    profile
    What it does:
    - Controls the main identity block on the page.
    - Visitors usually see this before they choose a link.
  */
  profile: {
    /*
      name
      What it does:
      - The main name/title shown on the profile card.

      Good choices:
      - Your real name, display name, brand name, band name, project name, or company name.
    */
    name: 'Astronaut',

    /*
      description
      What it does:
      - Short subtitle shown under the name.

      Good choices:
      - One sentence or phrase explaining who you are or what this page is for.

      Examples:
      - 'Designer, developer, and maker.'
      - 'Bookings, socials, and latest projects.'
      - 'Exploring the Digital Universe'
    */
    description: 'Exploring the Digital Universe',

    /*
      image
      What it does:
      - Profile picture, logo, avatar, or main visual.

      What to put here:
      - A path to an image under public/.
      - Square images usually work best.
      - Common formats: .svg, .png, .jpg, .webp.
    */
    image: 'assets/images/profile.svg',

    /*
      layout
      What it does:
      - Controls whether the profile image/text stack vertically or sit side-by-side.

      Allowed values:
      - 'vertical': image above text or stacked layout.
      - 'horizontal': image beside text when space allows.
    */
    layout: 'vertical',
  },

  /*
    featured
    What it does:
    - Adds one or more larger highlight cards.
    - These are separate from normal links and are meant for important items.

    Use featured cards for:
    - New project
    - Latest video
    - Shop/product
    - Portfolio piece
    - Booking page
    - Important announcement

    To remove all featured cards:
    featured: [],

    To add another featured card:
    - Copy everything from { to } inside the list below.
    - Paste it after the existing card.
    - Put a comma between cards.

    Optional visibility controls for each featured card:
    - enabled: false
      Hides the card without deleting it.
    - visibleFrom: '2026-06-15T12:00:00Z'
      The card appears only after that date/time.
    - visibleUntil: '2026-07-01T12:00:00Z'
      The card disappears after that date/time.
  */
  featured: [
    {
      /*
        title
        What it does:
        - Main text on the featured card.
      */
      title: 'StarryBio',

      /*
        description
        What it does:
        - Supporting text explaining why someone should click.
        - Keep it short so the card stays clean.
      */
      description: 'A self-hosted animated link-in-bio template for static-first sites.',

      /*
        url
        What it does:
        - Destination opened when the card is clicked.

        Allowed formats:
        - 'https://example.com'
        - 'http://example.com'
        - '/internal-page'

        For featured cards, use a real destination. '#' is not allowed here.
      */
      url: 'https://github.com/nota9x/StarryBio',

      /*
        image
        What it does:
        - Optional image shown on the featured card.

        Remove this line if:
        - You want a text-only featured card.
      */
      image: 'assets/images/profile.svg',

      /*
        badge
        What it does:
        - Small label shown on the featured card.

        Examples:
        - 'New'
        - 'Featured'
        - 'Now Open'
        - 'Open Source'
      */
      badge: 'Open Source',

      /*
        icon
        What it does:
        - Small icon shown with the card.

        Ways to set an icon:
        - Simple Icons brand:
          icon: { simpleIcon: 'GitHub' }

        - Simple Icons with a specific slug if lookup needs help:
          icon: { simpleIcon: 'Node.js', slug: 'nodedotjs' }

        - Local image file:
          icon: 'assets/images/my-icon.svg'

        - Advanced:
          You can also add color, darkColor, viewbox, or size inside the icon object.
      */
      icon: { simpleIcon: 'GitHub' },
    },
  ],

  /*
    sections
    What it does:
    - Groups normal links under headings.
    - This is the main list of buttons visitors click.

    You can have one section or many.

    Common section ideas:
    - Socials
    - Projects
    - Music
    - Videos
    - Contact
    - Shop
    - Support Me

    To hide a whole section:
    - Set enabled: false

    To hide only one link:
    - Add enabled: false inside that link.

    Optional visibility controls for sections and individual links:
    - enabled: false
      Hides it without deleting it.
    - visibleFrom: '2026-06-15T12:00:00Z'
      Shows it after that date/time.
    - visibleUntil: '2026-07-01T12:00:00Z'
      Hides it after that date/time.
  */
  sections: [
    {
      /*
        title
        What it does:
        - Heading for this group of links.
      */
      title: 'Socials',

      /*
        description
        What it does:
        - Optional short explanation under the section title.

        Remove this line if:
        - You only want the section heading.
      */
      description: 'Find me around the web.',

      /*
        enabled
        What it does:
        - Turns this section on or off.

        Allowed values:
        - true: show this section.
        - false: hide this section.
      */
      enabled: true,

      /*
        links
        What it does:
        - List of clickable items in this section.

        To add a link:
        - Copy one whole link object from { to }.
        - Paste it inside this links list.
        - Change label, subtitle, url, and icon.
      */
      links: [
        {
          /*
            label
            What it does:
            - Main text on the link button/card.
          */
          label: 'GitHub',

          /*
            subtitle
            What it does:
            - Smaller helper text shown with the link.

            Good uses:
            - Username
            - Short call to action
            - What the visitor will find there
          */
          subtitle: '@nota9x',

          /*
            url
            What it does:
            - Destination opened when the visitor clicks the link.

            Allowed formats:
            - 'https://github.com/example'
            - 'mailto:hello@example.com'
            - 'tel:+15551234567'
            - '/local-page'
            - '#section-name'

            Important:
            - Normal links need a url.
            - Copy links use specialType: 'copy' and copyValue instead.
          */
          url: 'https://github.com/nota9x',

          /*
            icon
            What it does:
            - Optional visual symbol for the link.

            For popular brands:
            - Use { simpleIcon: 'BrandName' }
            - Examples: 'GitHub', 'Discord', 'YouTube', 'Instagram', 'TikTok', 'Spotify'

            For local custom icons:
            - Use a file path like 'assets/images/my-icon.svg'
          */
          icon: { simpleIcon: 'GitHub' },
        },
        {
          label: 'Discord',
          subtitle: 'Join the server',
          url: 'https://discord.gg/example',
          icon: { simpleIcon: 'Discord' },
        },
        {
          label: 'Discord Name',
          subtitle: 'Copy: nota9x#0000',

          /*
            specialType
            What it does:
            - Changes this item from a normal link into a copy button.

            Allowed value:
            - 'copy'

            When specialType is 'copy':
            - The visitor clicks the item.
            - The site copies copyValue to their clipboard.
            - The item does not need a url.

            Good uses:
            - Discord username
            - Email address
            - Promo code
            - Game tag
            - Wallet address
          */
          specialType: 'copy',

          /*
            copyValue
            What it does:
            - The exact text copied to the visitor's clipboard.

            Important:
            - Required when specialType is 'copy'.
          */
          copyValue: 'nota9x#0000',

          icon: { simpleIcon: 'Discord' },
        },
      ],
    },
  ],

  /*
    status
    What it does:
    - Shows an availability widget, such as Available, Busy, Sleeping, or Offline.
    - The schedule chooses which status is active at different times.

    If you do not want a status widget:
    - Set enabled: false.

    Important:
    - Each schedule item uses a status name.
    - That status name must exist under types.
  */
  status: {
    /*
      enabled
      What it does:
      - Turns the status widget on or off.
    */
    enabled: true,

    /*
      ownerTimeZone
      What it does:
      - Tells the site what timezone your schedule is based on.
      - Also helps show your local time correctly.

      Format:
      - Use an IANA timezone name.

      Examples:
      - 'America/New_York'
      - 'America/Chicago'
      - 'America/Los_Angeles'
      - 'Europe/London'
      - 'Europe/Paris'
      - 'Asia/Tokyo'
      - 'Australia/Sydney'
    */
    ownerTimeZone: 'America/New_York',

    /*
      showLocalTime
      What it does:
      - Shows the owner's local time.

      Allowed values:
      - true: visitors can see your current local time.
      - false: hide your local time.
    */
    showLocalTime: true,

    /*
      showVisitorTime
      What it does:
      - Shows the visitor's own local time in the status UI.

      Allowed values:
      - true: show visitor time.
      - false: hide visitor time.

      Tip:
      - This is useful for international audiences.
    */
    showVisitorTime: false,

    /*
      showNextAvailable
      What it does:
      - Shows when the schedule says you will next be available.

      Allowed values:
      - true: show next available time.
      - false: hide next available time.
    */
    showNextAvailable: true,

    /*
      responseText
      What it does:
      - Adds a friendly expectation message near the status.

      Examples:
      - 'Usually replies within a few hours'
      - 'Email is best for business inquiries'
      - 'Replies may be slower on weekends'
    */
    responseText: 'Usually replies within a few hours',

    /*
      default
      What it does:
      - Fallback status used if no schedule rule matches.
      - Also useful as the safe "offline" state.
    */
    default: {
      /*
        text
        What it does:
        - Label visitors see for the fallback status.
      */
      text: 'Offline',

      /*
        color
        What it does:
        - Status color for the fallback status.

        Format:
        - Hex color, like '#6B7280'.
      */
      color: '#6B7280',

      /*
        icon
        What it does:
        - Optional icon for the fallback status.

        Accepted icon formats:
        - Local image path: 'assets/images/offline.webp'
        - Simple Icons object: { simpleIcon: 'Discord' }
        - SVG path string, like the current value below.
      */
      icon: 'M20 12h-2v2h2v-2zm-4 0h-2v2h2v-2zm-4 0H8v2h4v-2zm-4 0H4v2h4v-2z',
    },

    /*
      types
      What it does:
      - Defines all named statuses the schedule can use.
      - You can add your own, such as studying, streaming, working, or vacation.

      How to add a new status:
      working: {
        text: 'Working',
        color: '#3B82F6',
        icon: 'assets/images/dnd.webp',
        message: 'Currently focused on work.',
      },

      Then use it in the schedule:
      { status: 'working', days: 'weekdays', start: '09:00', end: '17:00' }
    */
    types: {
      available: {
        // Text visitors see for this status.
        text: 'Available',

        // Status color. Must be a hex color.
        color: '#10B981',

        // Optional image/icon for this status.
        icon: 'assets/images/online.webp',

        // Optional longer explanation shown in status details.
        message: 'Online and ready to chat!',
      },
      busy: {
        text: 'Busy / School',
        color: '#EF4444',
        icon: 'assets/images/dnd.webp',
        message: 'Focused on work. Replies slow.',
      },
      sleeping: {
        text: 'Sleeping',
        color: '#6d7684',
        icon: 'assets/images/idle.webp',
        message: 'Dreaming of electric sheep.',
      },
    },

    /*
      schedule
      What it does:
      - Chooses which status is active at which times.

      Each schedule item has:
      - status: must match one of the names in types above.
      - days: which days the rule applies to.
      - start: starting time.
      - end: ending time.

      days allowed values:
      - 'daily': every day.
      - 'weekdays': Monday through Friday.
      - 'weekends': Saturday and Sunday.

      Time format:
      - Use 24-hour HH:MM.
      - '00:00' means midnight.
      - '05:00' means 5:00 AM.
      - '13:00' means 1:00 PM.
      - '21:00' means 9:00 PM.
      - '23:59' means 11:59 PM.

      Overnight ranges:
      - It is okay for end to be earlier than start.
      - Example: start '21:00', end '05:00' means 9 PM through 5 AM.

      Tip:
      - Put more specific rules before broad rules if their times overlap.
    */
    schedule: [
      { status: 'sleeping', days: 'daily', start: '05:00', end: '13:00' },
      { status: 'busy', days: 'weekdays', start: '13:00', end: '21:00' },
      { status: 'available', days: 'weekdays', start: '21:00', end: '05:00' },
      { status: 'available', days: 'weekends', start: '13:00', end: '05:00' },
    ],
  },

  /*
    announcement
    What it does:
    - Shows a small announcement/banner on the page.

    Use it for:
    - Launch notices
    - Booking availability
    - Store status
    - New video/project
    - Temporary message
  */
  announcement: {
    /*
      enabled
      What it does:
      - Turns the announcement on or off.
    */
    enabled: true,

    /*
      text
      What it does:
      - The message shown in the announcement.
    */
    text: 'Welcome to v3.0!',

    /*
      url
      What it does:
      - Optional destination when visitors click the announcement.

      Allowed formats:
      - 'https://example.com'
      - '/local-page'
      - '#'

      Use '#':
      - When the announcement should not lead anywhere important.
    */
    url: '#',
  },

  /*
    seo
    What it does:
    - Controls search engine metadata and social sharing previews.
    - These settings may affect how links look when shared on social platforms.

    Tip:
    - These values can be similar to profile.name and profile.description,
      but they can be more search-friendly.
  */
  seo: {
    /*
      title
      What it does:
      - Title used for search results and social previews.

      Good choice:
      - Person/brand name plus a short descriptor.
    */
    title: 'StarryBio v3.0',

    /*
      description
      What it does:
      - Description used for search results and social previews.

      Tip:
      - Keep it readable and concise.
      - Around 150 characters or fewer is often a good target.
    */
    description: 'A premium animated link-in-bio template for builders and creators.',

    /*
      image
      What it does:
      - Preview image used when the site is shared.

      Format:
      - Usually starts with / because it is a public website path.
      - Example: '/assets/images/profile.svg'
    */
    image: '/assets/images/profile.svg',

    /*
      canonicalUrl
      What it does:
      - The main official URL for this site.
      - Helps search engines understand the correct public address.
      - Used as the default QR code URL if qr.url is not set.

      Example:
      - 'https://yourdomain.com'
    */
    canonicalUrl: 'https://a9x.pro',

    /*
      themeColor
      What it does:
      - Color some browsers use for mobile browser UI and social preview accents.

      Format:
      - Hex color, like '#7ddf9b'.
    */
    themeColor: '#7ddf9b',
  },

  /*
    ogImage
    What it does:
    - Optionally generates a social sharing image during build.
    - "OG" means Open Graph, a standard many social platforms use for previews.

    When to enable:
    - Enable if you want the build to create a dedicated share image.

    When to leave disabled:
    - Leave disabled if you already have your own image or do not need one.
  */
  ogImage: {
    /*
      enabled
      What it does:
      - true generates the image during build.
      - false skips generation.
    */
    enabled: false,

    /*
      output
      What it does:
      - File path where the generated image is saved.

      Tip:
      - Keep this inside public/ so the built site can serve it.
    */
    output: 'public/og.png',

    /*
      title and subtitle
      What they do:
      - Text placed on the generated social image.
    */
    title: 'StarryBio v3.0',
    subtitle: 'A premium animated link-in-bio template.',
  },

  /*
    qr
    What it does:
    - Optionally generates a QR code image during build.
    - The homepage can show/download this generated QR code.

    Good uses:
    - Business cards
    - Posters
    - Event signage
    - Sharing your link-in-bio page in person
  */
  qr: {
    /*
      enabled
      What it does:
      - true generates the QR image.
      - false skips QR generation.
    */
    enabled: true,

    /*
      url
      What it does:
      - Optional custom URL for the QR code.

      If omitted:
      - The QR code uses seo.canonicalUrl.

      To use a different URL:
      - Remove the // from the next line and edit the value.
    */
    // url: 'https://a9x.pro',

    /*
      output
      What it does:
      - File path where the generated QR image is saved.

      Tip:
      - Keep this inside public/.
    */
    output: 'public/qr.png',
  },

  /*
    analytics
    What it does:
    - Adds visitor analytics/tracking if you choose a provider.
    - By default, no analytics script is loaded.

    Privacy note:
    - Analytics may send visitor data to another service.
    - Only enable analytics if you understand and accept that provider's privacy behavior.

    Allowed providers:
    - 'none': no analytics.
    - 'cloudflare': Cloudflare Web Analytics. Requires token.
    - 'google': Google Analytics 4. Requires measurementId.
    - 'plausible': Plausible Analytics. Requires domain.
    - 'umami': Umami Analytics. Requires websiteId and scriptSrc.
    - 'custom': custom analytics script. Requires scriptSrc.

    Common examples:
    - analytics: { provider: 'none' }
    - analytics: { provider: 'cloudflare', token: 'abc123' }
    - analytics: { provider: 'google', measurementId: 'G-XXXXXXXXXX' }
    - analytics: { provider: 'google', measurementId: 'G-XXXXXXXXXX', sendPageView: false }
    - analytics: { provider: 'plausible', domain: 'example.com' }
    - analytics: { provider: 'umami', websiteId: 'abc123', scriptSrc: 'https://analytics.example.com/script.js' }
    - analytics: { provider: 'custom', scriptSrc: 'https://example.com/analytics.js' }

    Advanced Google options:
    - scriptSrc: custom Google script URL if needed.
    - sendPageView: false if you do not want the default page view sent automatically.
    - config: extra Google config values.

    Advanced custom analytics options:
    - dataAttributes: extra data-* attributes for the script tag.
  */
  analytics: {
    provider: 'none',
  },

  /*
    contactCard
    What it does:
    - Optionally generates a .vcf contact card during build.
    - Visitors can download it and add you to their contacts.

    When enabled is true:
    - name is required.
    - At least one of email, phone, or website is required.

    Good uses:
    - Freelancer contact card
    - Business contact card
    - Creator booking/contact information
  */
  contactCard: {
    /*
      enabled
      What it does:
      - true generates and shows the contact card download.
      - false skips contact card generation.
    */
    enabled: false,

    /*
      output
      What it does:
      - File path where the generated contact card is saved.

      Tip:
      - Keep this inside public/.
    */
    output: 'public/contact.vcf',

    /*
      name
      What it does:
      - Name saved in the visitor's contacts app.
    */
    name: 'Astronaut',

    /*
      website
      What it does:
      - Website saved in the contact card.
    */
    website: 'https://a9x.pro',

    /*
      Optional contact fields.
      Remove the // before a line to use it.

      email:
      - Email address saved in the contact card.

      phone:
      - Phone number saved in the contact card.
      - Include country code if this is public/international.

      organization:
      - Company, group, team, or brand name.

      title:
      - Role or job title, such as 'Designer' or 'Founder'.
    */
    // email: 'hello@example.com',
    // phone: '+15551234567',
    // organization: 'My Company',
    // title: 'Creator',
  },

  /*
    footer
    What it does:
    - Controls the small footer text at the bottom of the page.
  */
  footer: {
    /*
      copyright
      What it does:
      - Text displayed in the footer.

      Special placeholder:
      - {year} is automatically replaced with the current year.

      Examples:
      - '© {year} Jane Doe'
      - '© {year} My Brand'
      - 'Made by Jane'
    */
    copyright: '© {year} a9x Development',
  },
} satisfies StarryBioConfig;

export default config;
