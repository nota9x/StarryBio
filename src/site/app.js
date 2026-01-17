// --- COOKIE HELPER FUNCTIONS ---
function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
}

function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// --- CORE UI/ANIMATION LOGIC (UNCHANGED) ---
// ... (this section is the same)
const starsContainer = document.querySelector('.stars-container');
const numberOfStars = 200;
const allStars = [];

function setupAnimations() {
  // Defines colors for stars: cool blues, purples, and whites
  const starColors = ['#ffffff', '#ffe9c4', '#d4fbff', '#d4fbff', '#b3cde0'];

  // Create Stars
  for (let i = 0; i < numberOfStars; i++) {
    let star = document.createElement('div');
    star.classList.add('star');

    // Random Position
    let x = Math.random() * 100;
    let y = Math.random() * 100;

    // Random visual properties
    const color = starColors[Math.floor(Math.random() * starColors.length)];
    const size = Math.random() * 2 + 0.5; // 0.5px to 2.5px
    const opacity = Math.random() * 0.5 + 0.3;

    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.backgroundColor = color;
    // star.style.opacity = opacity; // Set in animate loop
    star.style.boxShadow = `0 0 ${size * 2}px ${color}`; // Glow matches color

    // Random Physics
    // depth: 0.1 (far) to 1.0 (near). Affects speed and parallax.
    const depth = Math.random();
    const driftSpeedX = (Math.random() - 0.5) * 0.02 * (depth + 0.5); // Slow drift
    const driftSpeedY = (Math.random() - 0.5) * 0.02 * (depth + 0.5);

    starsContainer.appendChild(star);
    allStars.push({
      element: star,
      baseX: x,
      baseY: y,
      depth,
      driftSpeedX,
      driftSpeedY,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }

  // Shooting Star Logic
  function spawnShootingStar() {
    if (Math.random() > 0.05) {
      // 95% chance to skip (make it rare/special)
      // Check again soon
    } else {
      const shootingStar = document.createElement('div');
      shootingStar.classList.add('shooting-star');

      // Spawn logic: "Across the sky"
      // Pick a start point anywhere on the left edge
      const startY = Math.random() * 100; // 0-100% of screen height
      const startX = -10; // Start off-screen left

      shootingStar.style.left = startX + 'vw';
      shootingStar.style.top = startY + 'vh';

      // Angle: Slight pitch down (2 to 10 degrees)
      const angle = 2 + Math.random() * 8;
      shootingStar.style.setProperty('--angle', angle + 'deg');

      // Random speed/size variation
      const duration = 1.5 + Math.random() * 1.5; // Faster: 1.5s to 3s
      shootingStar.style.animationDuration = duration + 's';

      starsContainer.appendChild(shootingStar);
      setTimeout(() => shootingStar.remove(), duration * 1000);
    }

    // Check frequently, but spawn rarely
    setTimeout(spawnShootingStar, 500);
  }
  setTimeout(spawnShootingStar, 2000);

  // Mouse Parallax & Animation Loop
  let mouseX = 0,
    mouseY = 0;
  let targetMouseX = 0,
    targetMouseY = 0;

  document.body.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX / window.innerWidth - 0.5;
    targetMouseY = e.clientY / window.innerHeight - 0.5;
  });

  let time = 0;
  function animate() {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    time += 1;

    allStars.forEach((star) => {
      // Update Base Position
      star.baseX += star.driftSpeedX;
      star.baseY += star.driftSpeedY;

      // Wrap logic for transform-based drift
      if (star.baseX > 105) star.baseX = -5;
      if (star.baseX < -5) star.baseX = 105;
      if (star.baseY > 105) star.baseY = -5;
      if (star.baseY < -5) star.baseY = 105;

      const parallaxX = mouseX * star.depth * 10; // Increased effect
      const parallaxY = mouseY * star.depth * 10;

      // USE TRANSFORM FOR SMOOTHNESS instead of top/left
      const x = star.baseX + parallaxX;
      const y = star.baseY + parallaxY;

      const twinkleVal = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
      const scale = 1 + twinkleVal * 0.3;
      const opacity = Math.max(0.1, Math.min(1, star.depth + 0.2 + twinkleVal * 0.3));

      // Combine translation and scale into one transform
      star.element.style.transform = `translate3d(${x}vw, ${y}vh, 0) scale(${scale})`;
      star.element.style.opacity = opacity;
    });

    requestAnimationFrame(animate);
  }
  animate();
}

// --- DATA LOADING AND PAGE POPULATION ---
document.addEventListener('DOMContentLoaded', () => {
  setupAnimations();

  if (typeof CONFIG !== 'undefined') {
    populatePage(CONFIG);
    document.body.style.opacity = '1';
  } else {
    console.error('CONFIG object not found.');
  }
});

function populatePage(data) {
  // Set Theme
  document.documentElement.setAttribute('data-theme', data.theme || 'midnight');

  document.title = data.pageTitle || 'Starfield Bio';

  if (data.announcement?.enabled) {
    // Simple check: if text exists, show it.
    populateAnnouncement(data.announcement);
  }

  populateProfile(data.profile);
  populateLinks(data.links);
  populateFooter(data.footer);

  if (data.status?.enabled) {
    initStatusIndicator(data.status);
  }
}

function populateProfile(profile) {
  // The main 'src' is set by the fast inline script. This only handles the fallback.
  const profileImg = document.getElementById('profileImage');
  if (profileImg) {
    profileImg.onerror = function () {
      this.onerror = null;
      this.src = profile.profileImageFallback;
    };
  }

  document.getElementById('profileName').textContent = profile.name;
  document.getElementById('profileTitle').textContent = profile.title;
}

function populateAnnouncement(announcement) {
  const container = document.getElementById('announcement-banner-container');
  if (!container) return;

  const bannerLink = document.createElement(announcement.url ? 'a' : 'div');
  bannerLink.id = 'announcement-banner';
  if (announcement.url) {
    bannerLink.href = announcement.url;
    bannerLink.target = '_blank';
    bannerLink.rel = 'noopener noreferrer';
  }

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'announcement-content';
  contentWrapper.innerHTML = `
        <svg class="announcement-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.74 18.5L14.16 4.42C13.12 2.53 10.88 2.53 9.84 4.42L2.26 18.5C1.22 20.39 2.96 22 4.42 22H19.58C21.04 22 22.78 20.39 21.74 18.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M12 9V13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M12 17H12.01" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <span class="announcement-text">${announcement.text}</span>
    `;

  const closeButton = document.createElement('button');
  closeButton.id = 'announcement-close-btn';
  closeButton.setAttribute('aria-label', 'Dismiss announcement');
  closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // MODIFIED: Set a cookie that expires in 7 days
    setCookie('announcementDismissed', 'true', 7);

    bannerLink.classList.add('closing');
    bannerLink.addEventListener(
      'animationend',
      () => {
        bannerLink.remove();
      },
      { once: true }
    );
  });

  bannerLink.appendChild(contentWrapper);
  bannerLink.appendChild(closeButton);
  container.appendChild(bannerLink);
}

function populateProfile(profile) {
  const imgEl = document.getElementById('profileImage');
  if (imgEl) {
    imgEl.src = profile.image || '';
    imgEl.onerror = () => {
      imgEl.style.display = 'none';
    };
  }
  document.getElementById('profileName').textContent = profile.name;
  document.getElementById('profileTitle').textContent = profile.title;
}

function populateLinks(links) {
  const container = document.getElementById('linksContainer');
  container.innerHTML = '';
  links.forEach((linkData) => {
    const linkEl = createLinkElement(linkData);
    container.appendChild(linkEl);

    // Handle special "copy" type
    if (linkData.specialType === 'copy' && linkData.copyValue) {
      initializeCopyButton(linkEl, linkData.copyValue, linkData.subtitle);
    }
  });
}

function populateFooter(footer) {
  const currentYear = new Date().getFullYear();
  // footer.copyright can contain {year} placeholder if desired, or just simple text
  document.getElementById('footerContent').textContent =
    footer.copyright || `© ${currentYear} Starfield Bio`;
}

function createLinkElement(linkData) {
  const isLink = linkData.url && linkData.url !== '#';
  const tag = isLink ? 'a' : 'button';
  const linkEl = document.createElement(tag);

  if (isLink) {
    linkEl.href = linkData.url;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
  }
  linkEl.className = 'link-button';

  if (linkData.specialType === 'copy') {
    linkEl.classList.add('copy-button-active'); // Marker class
  }

  const iconHtml = getIconHtml(linkData.icon);

  linkEl.innerHTML = `
        ${iconHtml}
        <div class="button-text-wrapper">
            <span class="button-main-text">${linkData.text}</span>
            <span class="button-subtitle">${linkData.subtitle || ''}</span>
        </div>`;
  return linkEl;
}

// Helper to determine if string is SVG path or Image URL
function getIconHtml(iconStr) {
  if (!iconStr) return '';

  // Simple heuristic: If it starts with 'M' (path command) or '<' (svg tag), treat as SVG.
  // Otherwise treat as image (http..., assets/..., etc)
  const isSvgPath = iconStr.trim().startsWith('M') || iconStr.trim().startsWith('<path');

  if (isSvgPath) {
    // Returns an SVG containing the path
    return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="${iconStr}"/>
        </svg>`;
  } else {
    // Image tag
    return `<span class="link-button-icon-wrapper"><img src="${iconStr}" alt="icon" class="link-button-icon"></span>`;
  }
}

// Generic Copy Logic
function initializeCopyButton(buttonElement, textToCopy, originalSubtitle) {
  if (!buttonElement) return;
  const subtitleElement = buttonElement.querySelector('.button-subtitle');

  buttonElement.addEventListener('click', (e) => {
    e.preventDefault();

    // Prevent clicking while animating
    if (buttonElement.classList.contains('animating')) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (subtitleElement) {
        const oldText = subtitleElement.textContent;
        buttonElement.classList.add('animating');

        // 1. Fade Out
        buttonElement.classList.add('fading-out');

        setTimeout(() => {
          // 2. Switch Content (Fast, while invisible)
          subtitleElement.textContent = 'Copied!';
          buttonElement.classList.add('show-copied-feedback');

          // 3. Fade In
          buttonElement.classList.remove('fading-out');

          // 4. Wait, then Reverse
          setTimeout(() => {
            // 5. Fade Out again
            buttonElement.classList.add('fading-out');

            setTimeout(() => {
              // 6. Revert Content
              subtitleElement.textContent = originalSubtitle || oldText;
              buttonElement.classList.remove('show-copied-feedback');

              // 7. Fade In original
              buttonElement.classList.remove('fading-out');
              buttonElement.classList.remove('animating');
            }, 300); // Transition time
          }, 2000); // Display time
        }, 300); // Transition time
      }
    });
  });
}

// --- STATUS INDICATOR AND SCHEDULING LOGIC ---

// --- STATUS INDICATOR AND SCHEDULING LOGIC ---

function initStatusIndicator(statusConfig) {
  if (!document.getElementById('status-indicator-container')) {
    createStatusHtml(statusConfig);
  }

  const elements = {
    icon: document.getElementById('status-indicator-icon'),
    tooltipStatus: document.getElementById('tooltip-status'),
    tooltipTimeLabel: document.getElementById('tooltip-time-label'),
    tooltipTime: document.getElementById('tooltip-time'),
    tooltipAvailability: document.getElementById('tooltip-availability'),
    modal: document.getElementById('status-modal'),
  };

  // Populate Modal with LOCALLY converted times
  populateScheduleModal(statusConfig);

  // Update Loop
  function updateLoop() {
    const currentStatus = determineCurrentStatus(statusConfig);

    // Update Icon & Color
    let statusDef = statusConfig.types[currentStatus] || statusConfig.default;

    // Fallback if specific status type is missing color/text
    const color = statusDef.color || statusConfig.default.color;
    const text = statusDef.text || statusConfig.default.text;
    const iconPath = statusDef.icon || statusConfig.default.icon;
    const message = statusDef.message || '';

    // Detect if icon is SVG Path or Image URL
    const isSvgPath = iconPath.trim().startsWith('M') || iconPath.trim().startsWith('<');

    if (isSvgPath) {
      // SVG Path: Use Mask + Background Color
      let maskUrl = iconPath;
      if (iconPath.startsWith('M')) {
        const svgData = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='${iconPath}'/></svg>`;
        maskUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
      }

      elements.icon.style.backgroundColor = color;
      elements.icon.style.webkitMaskImage = `url('${maskUrl}')`;
      elements.icon.style.maskImage = `url('${maskUrl}')`;
      elements.icon.style.backgroundImage = 'none';
    } else {
      // Image URL: Use Background Image (Full Color)
      elements.icon.style.backgroundColor = 'transparent'; // Show image colors, not tint
      elements.icon.style.webkitMaskImage = 'none';
      elements.icon.style.maskImage = 'none';
      elements.icon.style.backgroundImage = `url('${iconPath}')`;
      elements.icon.style.backgroundSize = 'contain';
      elements.icon.style.backgroundRepeat = 'no-repeat';
      elements.icon.style.backgroundPosition = 'center';
    }

    if (elements.tooltipStatus) elements.tooltipStatus.textContent = text;

    if (elements.tooltipAvailability) {
      if (message) {
        elements.tooltipAvailability.textContent = message;
        elements.tooltipAvailability.classList.remove('hidden');
      } else {
        elements.tooltipAvailability.classList.add('hidden');
      }
    }

    // Owner's Time
    // We use the timezone from config to show "Owner's Time"
    const now = new Date();
    const ownerTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: statusConfig.ownerTimeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (elements.tooltipTime) elements.tooltipTime.textContent = ownerTimeStr;
  }

  setInterval(updateLoop, 1000);
  updateLoop();
}

function createStatusHtml(config) {
  const profileImageWrapper = document.querySelector('.profile-image-wrapper');
  if (!profileImageWrapper) return;

  // 1. Insert structure into profile card
  profileImageWrapper.insertAdjacentHTML(
    'beforeend',
    `
       <div id="status-indicator-container">
           <div id="status-indicator-icon"></div>
           <div id="status-tooltip">
               <div id="tooltip-status" class="font-bold text-sm mb-1 text-center"></div>
               <div class="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                   <svg class="status-clock-icon w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <span id="tooltip-time" class="font-mono opacity-90"></span>
               </div>
               <div id="tooltip-availability" class="text-[0.65rem] italic text-amber-300/90 mt-1.5 pt-1.5 border-t border-white/10 text-center hidden"></div>
           </div>
       </div>
   `
  );

  // 2. Elements
  const container = document.getElementById('status-indicator-container');
  const modal = document.getElementById('status-modal');
  const closeBtn = document.getElementById('status-modal-close');
  const overlay = document.getElementById('status-modal-overlay');

  // Event listeners for modal
  container.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  overlay.addEventListener('click', () => modal.classList.add('hidden'));
}

// Check current time against schedule (All calculations in UTC)
function determineCurrentStatus(config) {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0 (Sun) - 6 (Sat)
  const currentUtcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const isWeekend = utcDay === 0 || utcDay === 6;

  // Find matching schedule item
  for (const item of config.schedule) {
    // Does this item apply to today?
    let applies = false;
    if (item.days === 'daily') applies = true;
    if (item.days === 'weekends' && isWeekend) applies = true;
    if (item.days === 'weekdays' && !isWeekend) applies = true;

    if (!applies) continue;

    // Parse Start/End (HH:MM) to minutes
    const startMins = parseTime(item.start);
    const endMins = parseTime(item.end);

    // Handle wrap-around (e.g. 21:00 to 05:00)
    if (startMins > endMins) {
      // range crosses midnight
      if (currentUtcMinutes >= startMins || currentUtcMinutes < endMins) {
        return item.status;
      }
    } else {
      // standard range
      if (currentUtcMinutes >= startMins && currentUtcMinutes < endMins) {
        return item.status;
      }
    }
  }

  return 'default';
}

function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function populateScheduleModal(config) {
  const weekdayList = document.getElementById('weekday-schedule-list');
  const weekendList = document.getElementById('weekend-schedule-list');

  // Set Static Titles
  const titleEl = document.getElementById('status-modal-title');
  if (titleEl) titleEl.textContent = 'Schedule';

  const weekdayTitleEl = document.getElementById('status-modal-weekday-title');
  if (weekdayTitleEl) weekdayTitleEl.textContent = 'Weekdays';

  const weekendTitleEl = document.getElementById('status-modal-weekend-title');
  if (weekendTitleEl) weekendTitleEl.textContent = 'Weekends';

  // Clear lists
  if (weekdayList) weekdayList.innerHTML = '';
  if (weekendList) weekendList.innerHTML = '';

  // Process items.
  // KEY: We want to convert the UTC Start/End times to the VISITOR'S local time.

  config.schedule.forEach((item) => {
    const itemHtml = createScheduleItemHtml(item, config);

    if (item.days === 'daily') {
      if (weekdayList) weekdayList.innerHTML += itemHtml;
      if (weekendList) weekendList.innerHTML += itemHtml;
    } else if (item.days === 'weekdays') {
      if (weekdayList) weekdayList.innerHTML += itemHtml;
    } else if (item.days === 'weekends') {
      if (weekendList) weekendList.innerHTML += itemHtml;
    }
  });
}

function createScheduleItemHtml(item, config) {
  const statusDef = config.types[item.status];
  if (!statusDef) return '';

  // Convert UTC time string "HH:MM" to Local Time String
  const localRange = formatUtcRangeToLocal(item.start, item.end);

  return `
    <li class="flex items-center justify-between p-3 border-b border-white/10 last:border-0">
        <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" style="background-color: ${statusDef.color};"></div>
            <span class="font-medium text-slate-200">${statusDef.text}</span>
        </div>
        <span class="text-sm text-slate-400 font-mono">${localRange}</span>
    </li>
    `;
}

function formatUtcRangeToLocal(utcStart, utcEnd) {
  // Create date objects for today at those UTC times
  const d1 = new Date();
  const [h1, m1] = utcStart.split(':');
  d1.setUTCHours(h1, m1, 0, 0);

  const d2 = new Date();
  const [h2, m2] = utcEnd.split(':');
  d2.setUTCHours(h2, m2, 0, 0);

  // Format to local string
  const timeOpt = { hour: 'numeric', minute: '2-digit', hour12: true };
  return `${d1.toLocaleTimeString([], timeOpt)} - ${d2.toLocaleTimeString([], timeOpt)}`;
}
