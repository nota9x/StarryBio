function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value || '')}${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(nameEQ)) {
      return decodeURIComponent(trimmedCookie.substring(nameEQ.length));
    }
  }

  return null;
}

const starsContainer = document.querySelector('.stars-container');
const STAR_COLORS = ['#ffffff', '#ffe9c4', '#d4fbff', '#d4fbff', '#b3cde0'];
const allStars = [];
let starCanvas = null;
let starContext = null;
let starViewportWidth = 0;
let starViewportHeight = 0;
let prefersReducedMotionQuery = null;
let animationFrameId = null;
let shootingStarTimeoutId = null;
let animationStarted = false;

function setupAnimations() {
  if (!starsContainer || animationStarted) return;

  animationStarted = true;
  prefersReducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

  setupStarCanvas();
  configureStarfield();

  window.addEventListener('resize', resizeStarCanvas);

  if (prefersReducedMotionQuery) {
    const handleMotionPreferenceChange = () => configureStarfield();

    if (prefersReducedMotionQuery.addEventListener) {
      prefersReducedMotionQuery.addEventListener('change', handleMotionPreferenceChange);
    } else if (prefersReducedMotionQuery.addListener) {
      prefersReducedMotionQuery.addListener(handleMotionPreferenceChange);
    }
  }

  document.addEventListener('visibilitychange', () => {
    const prefersReducedMotion = prefersReducedMotionQuery && prefersReducedMotionQuery.matches;

    if (document.hidden || prefersReducedMotion) {
      stopStarAnimation();
      stopShootingStars();
    } else {
      startStarAnimation();
      startShootingStars();
    }
  });
}

function setupStarCanvas() {
  starCanvas = document.createElement('canvas');
  starCanvas.className = 'starfield-canvas';
  starCanvas.setAttribute('aria-hidden', 'true');
  starsContainer.prepend(starCanvas);
  starContext = starCanvas.getContext('2d');
  resizeStarCanvas();
}

function configureStarfield() {
  const prefersReducedMotion = prefersReducedMotionQuery && prefersReducedMotionQuery.matches;
  const numberOfStars = prefersReducedMotion ? 80 : 200;

  stopStarAnimation();
  stopShootingStars();
  createStars(numberOfStars);
  renderStars({ updatePositions: false });

  if (prefersReducedMotion) return;

  startShootingStars();
  startStarAnimation();
}

function createStars(numberOfStars) {
  allStars.length = 0;

  for (let i = 0; i < numberOfStars; i++) {
    const depth = Math.random();

    allStars.push({
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      depth,
      driftSpeedX: (Math.random() - 0.5) * 0.02 * (depth + 0.5),
      driftSpeedY: (Math.random() - 0.5) * 0.02 * (depth + 0.5),
      size: Math.random() * 2 + 0.5,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }
}

function resizeStarCanvas() {
  if (!starCanvas || !starContext) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  starViewportWidth = window.innerWidth;
  starViewportHeight = window.innerHeight;
  starCanvas.width = Math.ceil(starViewportWidth * dpr);
  starCanvas.height = Math.ceil(starViewportHeight * dpr);
  starContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  renderStars({ updatePositions: false });
}

function startShootingStars() {
  if (shootingStarTimeoutId !== null || !starsContainer) return;

  const spawnShootingStar = () => {
    shootingStarTimeoutId = null;

    if (!document.hidden && Math.random() <= 0.05) {
      const shootingStar = document.createElement('div');
      shootingStar.classList.add('shooting-star');

      const duration = 1.5 + Math.random() * 1.5;
      shootingStar.style.left = '-10vw';
      shootingStar.style.top = `${Math.random() * 100}vh`;
      shootingStar.style.setProperty('--angle', `${2 + Math.random() * 8}deg`);
      shootingStar.style.animationDuration = `${duration}s`;

      starsContainer.appendChild(shootingStar);
      window.setTimeout(() => shootingStar.remove(), duration * 1000);
    }

    shootingStarTimeoutId = window.setTimeout(spawnShootingStar, 500);
  };

  shootingStarTimeoutId = window.setTimeout(spawnShootingStar, 2000);
}

function stopShootingStars() {
  if (shootingStarTimeoutId !== null) {
    window.clearTimeout(shootingStarTimeoutId);
    shootingStarTimeoutId = null;
  }

  if (!starsContainer) return;

  for (const shootingStar of starsContainer.querySelectorAll('.shooting-star')) {
    shootingStar.remove();
  }
}

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;
let animationTime = 0;

document.body.addEventListener('mousemove', (event) => {
  targetMouseX = event.clientX / window.innerWidth - 0.5;
  targetMouseY = event.clientY / window.innerHeight - 0.5;
});

function startStarAnimation() {
  if (animationFrameId !== null || !starContext) return;

  const animate = () => {
    if (document.hidden) {
      animationFrameId = null;
      return;
    }

    renderStars({ updatePositions: true });
    animationFrameId = requestAnimationFrame(animate);
  };

  animationFrameId = requestAnimationFrame(animate);
}

function stopStarAnimation() {
  if (animationFrameId === null) return;

  cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
}

function renderStars({ updatePositions }) {
  if (!starContext) return;

  starContext.clearRect(0, 0, starViewportWidth, starViewportHeight);

  if (updatePositions) {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    animationTime += 1;
  }

  for (const star of allStars) {
    if (updatePositions) {
      star.baseX += star.driftSpeedX;
      star.baseY += star.driftSpeedY;

      if (star.baseX > 105) star.baseX = -5;
      if (star.baseX < -5) star.baseX = 105;
      if (star.baseY > 105) star.baseY = -5;
      if (star.baseY < -5) star.baseY = 105;
    }

    const parallaxX = mouseX * star.depth * 10;
    const parallaxY = mouseY * star.depth * 10;
    const twinkleVal = Math.sin(animationTime * star.twinkleSpeed + star.twinklePhase);
    const scale = updatePositions ? 1 + twinkleVal * 0.3 : 1;
    const opacity = updatePositions
      ? Math.max(0.1, Math.min(1, star.depth + 0.2 + twinkleVal * 0.3))
      : Math.max(0.25, star.depth);
    const x = ((star.baseX + parallaxX) / 100) * starViewportWidth;
    const y = ((star.baseY + parallaxY) / 100) * starViewportHeight;
    const radius = (star.size * scale) / 2;

    starContext.globalAlpha = opacity;
    starContext.fillStyle = star.color;
    starContext.shadowBlur = star.size * 2;
    starContext.shadowColor = star.color;
    starContext.beginPath();
    starContext.arc(x, y, radius, 0, Math.PI * 2);
    starContext.fill();
  }

  starContext.globalAlpha = 1;
  starContext.shadowBlur = 0;
}

document.addEventListener('DOMContentLoaded', () => {
  setupAnimations();

  if (typeof CONFIG !== 'undefined') {
    populatePage(CONFIG);
  }

  document.body.style.opacity = '1';
});

const DEFAULT_SIMPLE_ICON_COLOR = 'fff';

function populatePage(data) {
  document.documentElement.setAttribute('data-theme', data.theme || 'midnight');
  document.title = data.pageTitle || 'Starfield Bio';

  if (data.favicon) {
    populateFavicon(data.favicon);
  }

  if (data.announcement?.enabled && data.announcement.text) {
    populateAnnouncement(data.announcement);
  }

  populateProfile(data.profile || {});
  populateLinks(Array.isArray(data.links) ? data.links : []);
  populateFooter(data.footer || {});

  if (data.status?.enabled) {
    initStatusIndicator(data.status);
  }
}

function populateProfile(profile) {
  const imgEl = document.getElementById('profileImage');
  if (imgEl) {
    imgEl.src = profile.image || '';
    imgEl.onerror = () => {
      imgEl.style.display = 'none';
    };
  }

  const card = document.querySelector('.profile-card');
  const textContent = document.querySelector('.profile-text-content');
  if (card && textContent) {
    card.classList.toggle('layout-horizontal', profile.layout === 'horizontal');
  }

  const nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.textContent = profile.name || '';

  const descEl = document.getElementById('profileDescription');
  if (descEl) descEl.textContent = profile.description || '';
}

function populateAnnouncement(announcement) {
  if (getCookie('announcementDismissed') === 'true') return;

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

  contentWrapper.appendChild(
    createSvgElement({
      className: 'announcement-icon',
      viewBox: '0 0 24 24',
      fill: 'none',
      paths: [
        {
          d: 'M21.74 18.5L14.16 4.42C13.12 2.53 10.88 2.53 9.84 4.42L2.26 18.5C1.22 20.39 2.96 22 4.42 22H19.58C21.04 22 22.78 20.39 21.74 18.5Z',
          stroke: 'white',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        {
          d: 'M12 9V13',
          stroke: 'white',
          strokeWidth: '2',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        {
          d: 'M12 17H12.01',
          stroke: 'white',
          strokeWidth: '2.5',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
      ],
    })
  );

  const announcementText = document.createElement('span');
  announcementText.className = 'announcement-text';
  announcementText.textContent = announcement.text;
  contentWrapper.appendChild(announcementText);

  const closeButton = document.createElement('button');
  closeButton.id = 'announcement-close-btn';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Dismiss announcement');
  closeButton.appendChild(createCloseIcon());

  closeButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    setCookie('announcementDismissed', 'true', 7);

    bannerLink.classList.add('closing');
    bannerLink.addEventListener('animationend', () => bannerLink.remove(), { once: true });
  });

  bannerLink.appendChild(contentWrapper);
  bannerLink.appendChild(closeButton);
  container.appendChild(bannerLink);
}

function populateLinks(links) {
  const container = document.getElementById('linksContainer');
  if (!container) return;

  container.replaceChildren();

  for (const linkData of links) {
    const linkEl = createLinkElement(linkData);
    container.appendChild(linkEl);

    if (linkData.specialType === 'copy' && linkData.copyValue) {
      initializeCopyButton(linkEl, linkData.copyValue, linkData.subtitle);
    }
  }
}

function populateFooter(footer) {
  const container = document.getElementById('footerContent');
  if (!container) return;

  const currentYear = new Date().getFullYear();
  const copyright = footer.copyright || `© ${currentYear} Starfield Bio`;
  container.textContent = copyright.replace('{year}', currentYear);
}

function createLinkElement(linkData) {
  const isLink = linkData.url && linkData.url !== '#';
  const linkEl = document.createElement(isLink ? 'a' : 'button');

  if (isLink) {
    linkEl.href = linkData.url;
    linkEl.target = '_blank';
    linkEl.rel = 'noopener noreferrer';
  } else {
    linkEl.type = 'button';
  }

  linkEl.className = 'link-button';

  if (linkData.specialType === 'copy') {
    linkEl.classList.add('copy-button-active');
  }

  const iconEl = createIconElement(linkData.icon);
  if (iconEl) {
    linkEl.appendChild(iconEl);
  }

  const textWrapper = document.createElement('div');
  textWrapper.className = 'button-text-wrapper';

  const mainText = document.createElement('span');
  mainText.className = 'button-main-text';
  mainText.textContent = linkData.text || '';

  const subtitle = document.createElement('span');
  subtitle.className = 'button-subtitle';
  subtitle.textContent = linkData.subtitle || '';

  textWrapper.appendChild(mainText);
  textWrapper.appendChild(subtitle);
  linkEl.appendChild(textWrapper);

  return linkEl;
}

function populateFavicon(faviconUrl) {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.href = faviconUrl;

  const ext = faviconUrl.split('.').pop().toLowerCase();
  const mimeTypes = {
    ico: 'image/x-icon',
    png: 'image/png',
    svg: 'image/svg+xml',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  };

  if (mimeTypes[ext]) {
    link.type = mimeTypes[ext];
  } else {
    link.removeAttribute('type');
  }
}

function createIconElement(iconStr) {
  const iconSource = resolveIconSource(iconStr);
  if (!iconSource) return null;

  const pathData = getSvgPathData(iconSource);
  if (pathData) {
    return createSvgElement({
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      paths: [{ d: pathData }],
    });
  }

  const wrapper = document.createElement('span');
  wrapper.className = 'link-button-icon-wrapper';

  const icon = document.createElement('span');
  icon.className = 'link-button-icon';
  setMaskedIcon(icon, iconSource, 'currentColor');

  wrapper.appendChild(icon);
  return wrapper;
}

function getSvgPathData(iconStr) {
  if (typeof iconStr !== 'string') return '';

  const trimmedIcon = iconStr.trim();

  if (trimmedIcon.toUpperCase().startsWith('M')) {
    return trimmedIcon;
  }

  if (trimmedIcon.startsWith('<path')) {
    const match = trimmedIcon.match(/\sd=(["'])(.*?)\1/i);
    return match ? match[2] : '';
  }

  return '';
}

function resolveIconSource(iconConfig) {
  if (!iconConfig) return '';

  if (typeof iconConfig === 'string') {
    return iconConfig;
  }

  const simpleIconPath = getSimpleIconAssetPath(iconConfig);
  return simpleIconPath || '';
}

function getSimpleIconAssetPath(iconConfig) {
  const spec = normalizeSimpleIconSpec(iconConfig);
  if (!spec) return '';

  return `assets/icons/simple-icons/${getSimpleIconFilename(spec)}`;
}

function normalizeSimpleIconSpec(iconConfig) {
  if (!iconConfig || typeof iconConfig !== 'object' || Array.isArray(iconConfig)) {
    return null;
  }

  const brand = getString(iconConfig.simpleIcon) || getString(iconConfig.brand);
  const slug = getString(iconConfig.slug) || (brand ? brandNameToSimpleIconSlug(brand) : '');

  if (!brand && !slug) {
    return null;
  }

  return {
    slug,
    color: normalizeColor(iconConfig.color) || DEFAULT_SIMPLE_ICON_COLOR,
    darkColor: normalizeColor(iconConfig.darkColor),
    viewbox: getString(iconConfig.viewbox),
    size: getString(iconConfig.size),
  };
}

function getSimpleIconFilename(spec) {
  const parts = [spec.slug];

  if (spec.color) parts.push(spec.color);
  if (spec.darkColor) parts.push(spec.darkColor);
  if (spec.viewbox) parts.push(`viewbox-${spec.viewbox}`);
  if (spec.size) parts.push(`size-${spec.size}`);

  return `${parts.map(sanitizeFilenamePart).join('--')}.svg`;
}

function brandNameToSimpleIconSlug(brandName) {
  return brandName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/đ/g, 'd')
    .replace(/ħ/g, 'h')
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/\./g, 'dot')
    .replace(/&/g, 'and')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]/g, '');
}

function normalizeColor(color) {
  const value = getString(color);
  if (!value) return '';

  return value.startsWith('#') ? value.slice(1) : value;
}

function getString(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

function sanitizeFilenamePart(value) {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

function setMaskedIcon(element, iconUrl, color) {
  element.style.backgroundColor = color;
  element.style.webkitMaskImage = iconUrl ? `url('${cssEscapeUrl(iconUrl)}')` : 'none';
  element.style.maskImage = iconUrl ? `url('${cssEscapeUrl(iconUrl)}')` : 'none';
}

function cssEscapeUrl(url) {
  return String(url).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function initializeCopyButton(buttonElement, textToCopy, originalSubtitle) {
  if (!buttonElement) return;

  const subtitleElement = buttonElement.querySelector('.button-subtitle');

  buttonElement.addEventListener('click', (event) => {
    event.preventDefault();

    if (buttonElement.classList.contains('animating') || !navigator.clipboard) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (!subtitleElement) return;

      const oldText = subtitleElement.textContent;
      buttonElement.classList.add('animating', 'fading-out');

      window.setTimeout(() => {
        subtitleElement.textContent = 'Copied!';
        buttonElement.classList.add('show-copied-feedback');
        buttonElement.classList.remove('fading-out');

        window.setTimeout(() => {
          buttonElement.classList.add('fading-out');

          window.setTimeout(() => {
            subtitleElement.textContent = originalSubtitle || oldText;
            buttonElement.classList.remove('show-copied-feedback', 'fading-out', 'animating');
          }, 300);
        }, 2000);
      }, 300);
    });
  });
}

function initStatusIndicator(statusConfig) {
  const normalizedStatusConfig = normalizeStatusConfig(statusConfig);

  if (!document.getElementById('status-indicator-container')) {
    createStatusHtml();
  }

  const elements = {
    icon: document.getElementById('status-indicator-icon'),
    tooltipStatus: document.getElementById('tooltip-status'),
    tooltipTime: document.getElementById('tooltip-time'),
    tooltipAvailability: document.getElementById('tooltip-availability'),
  };

  if (!elements.icon) return;

  populateScheduleModal(normalizedStatusConfig);

  function updateLoop() {
    const currentStatus = determineCurrentStatus(normalizedStatusConfig);
    const statusDef =
      normalizedStatusConfig.types[currentStatus] || normalizedStatusConfig.default || {};
    const defaultStatus = normalizedStatusConfig.default || {};

    const color = statusDef.color || defaultStatus.color || '#6B7280';
    const text = statusDef.text || defaultStatus.text || 'Offline';
    const iconPath = resolveIconSource(statusDef.icon || defaultStatus.icon || '');
    const message = statusDef.message || '';
    const iconPathData = getSvgPathData(iconPath);

    if (iconPathData) {
      const svgData = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'><path d='${iconPathData}'/></svg>`;
      const maskUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;

      setMaskedIcon(elements.icon, maskUrl, color);
      elements.icon.style.backgroundImage = 'none';
    } else {
      setMaskedIcon(elements.icon, iconPath, color);
      elements.icon.style.backgroundImage = 'none';
    }

    if (elements.tooltipStatus) elements.tooltipStatus.textContent = text;

    if (elements.tooltipAvailability) {
      elements.tooltipAvailability.textContent = message;
      elements.tooltipAvailability.classList.toggle('hidden', !message);
    }

    if (elements.tooltipTime) {
      elements.tooltipTime.textContent = getOwnerTime(normalizedStatusConfig.ownerTimeZone);
    }
  }

  window.setInterval(updateLoop, 1000);
  updateLoop();
}

function getOwnerTime(timeZone) {
  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  try {
    return new Date().toLocaleTimeString('en-US', { ...options, timeZone });
  } catch {
    return new Date().toLocaleTimeString('en-US', options);
  }
}

function normalizeStatusConfig(config) {
  const types = config.types || {};
  const defaultStatus = config.default || {
    text: 'Offline',
    color: '#6B7280',
    icon: '',
  };
  const ownerTimeZone = isValidTimeZone(config.ownerTimeZone) ? config.ownerTimeZone : undefined;
  const schedule = normalizeSchedule(config.schedule, types);

  if (config.ownerTimeZone && !ownerTimeZone) {
    console.warn(
      `[StarryBio] Invalid status.ownerTimeZone "${config.ownerTimeZone}". Falling back to the visitor's local time.`
    );
  }

  return {
    ...config,
    default: defaultStatus,
    ownerTimeZone,
    schedule,
    types,
  };
}

function normalizeSchedule(schedule, types) {
  if (!Array.isArray(schedule)) {
    console.warn('[StarryBio] status.schedule must be an array. Falling back to default status.');
    return [];
  }

  return schedule.reduce((validItems, item, index) => {
    const normalizedItem = normalizeScheduleItem(item, types, index);
    if (normalizedItem) validItems.push(normalizedItem);
    return validItems;
  }, []);
}

function normalizeScheduleItem(item, types, index) {
  if (!item || typeof item !== 'object') {
    console.warn(`[StarryBio] Ignoring schedule item ${index}: expected an object.`);
    return null;
  }

  if (!isValidScheduleDay(item.days)) {
    console.warn(
      `[StarryBio] Ignoring schedule item ${index}: days must be "daily", "weekdays", or "weekends".`
    );
    return null;
  }

  if (!item.status || !types[item.status]) {
    console.warn(`[StarryBio] Ignoring schedule item ${index}: unknown status "${item.status}".`);
    return null;
  }

  const startMins = parseTimeToMinutes(item.start);
  const endMins = parseTimeToMinutes(item.end);

  if (startMins === null || endMins === null || startMins === endMins) {
    console.warn(
      `[StarryBio] Ignoring schedule item ${index}: start and end must be different HH:MM values.`
    );
    return null;
  }

  return {
    ...item,
    startMins,
    endMins,
    wrapsMidnight: startMins > endMins,
  };
}

function isValidScheduleDay(days) {
  return days === 'daily' || days === 'weekdays' || days === 'weekends';
}

function isValidTimeZone(timeZone) {
  if (!timeZone) return false;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function createStatusHtml() {
  const profileImageWrapper = document.querySelector('.profile-image-wrapper');
  if (!profileImageWrapper) return;

  const container = document.createElement('div');
  container.id = 'status-indicator-container';

  const icon = document.createElement('div');
  icon.id = 'status-indicator-icon';

  const tooltip = document.createElement('div');
  tooltip.id = 'status-tooltip';

  const tooltipStatus = document.createElement('div');
  tooltipStatus.id = 'tooltip-status';
  tooltipStatus.className = 'font-bold text-sm mb-1 text-center';

  const timeRow = document.createElement('div');
  timeRow.className = 'flex items-center justify-center gap-1.5 text-xs text-slate-300';

  const clockIcon = createSvgElement({
    className: 'status-clock-icon w-3.5 h-3.5 opacity-70',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    paths: [
      {
        d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '2',
      },
    ],
  });

  const tooltipTime = document.createElement('span');
  tooltipTime.id = 'tooltip-time';
  tooltipTime.className = 'font-mono opacity-90';

  const tooltipAvailability = document.createElement('div');
  tooltipAvailability.id = 'tooltip-availability';
  tooltipAvailability.className =
    'text-[0.65rem] italic text-amber-300/90 mt-1.5 pt-1.5 border-t border-white/10 text-center hidden';

  timeRow.appendChild(clockIcon);
  timeRow.appendChild(tooltipTime);
  tooltip.appendChild(tooltipStatus);
  tooltip.appendChild(timeRow);
  tooltip.appendChild(tooltipAvailability);
  container.appendChild(icon);
  container.appendChild(tooltip);
  profileImageWrapper.appendChild(container);

  const modal = document.getElementById('status-modal');
  const closeBtn = document.getElementById('status-modal-close');
  const overlay = document.getElementById('status-modal-overlay');

  if (modal) {
    container.addEventListener('click', () => modal.classList.remove('hidden'));
  }

  if (modal && closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  if (modal && overlay) {
    overlay.addEventListener('click', () => modal.classList.add('hidden'));
  }
}

function determineCurrentStatus(config, now = new Date()) {
  const utcDay = now.getUTCDay();
  const currentUtcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  for (const item of config.schedule || []) {
    if (scheduleItemMatchesNow(item, utcDay, currentUtcMinutes)) {
      return item.status;
    }
  }

  return 'default';
}

function scheduleItemMatchesNow(item, utcDay, currentUtcMinutes) {
  if (!item.wrapsMidnight) {
    return appliesToUtcDay(item.days, utcDay) && isInMinuteRange(currentUtcMinutes, item);
  }

  if (currentUtcMinutes >= item.startMins) {
    return appliesToUtcDay(item.days, utcDay);
  }

  const previousUtcDay = (utcDay + 6) % 7;
  return currentUtcMinutes < item.endMins && appliesToUtcDay(item.days, previousUtcDay);
}

function isInMinuteRange(currentUtcMinutes, item) {
  return currentUtcMinutes >= item.startMins && currentUtcMinutes < item.endMins;
}

function appliesToUtcDay(days, utcDay) {
  if (days === 'daily') return true;

  const isWeekend = utcDay === 0 || utcDay === 6;
  return days === 'weekends' ? isWeekend : !isWeekend;
}

function parseTimeToMinutes(timeStr) {
  if (typeof timeStr !== 'string') return null;

  const match = timeStr.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

function populateScheduleModal(config) {
  const weekdayList = document.getElementById('weekday-schedule-list');
  const weekendList = document.getElementById('weekend-schedule-list');

  const titleEl = document.getElementById('status-modal-title');
  if (titleEl) titleEl.textContent = 'Schedule';

  const weekdayTitleEl = document.getElementById('status-modal-weekday-title');
  if (weekdayTitleEl) weekdayTitleEl.textContent = 'Weekdays';

  const weekendTitleEl = document.getElementById('status-modal-weekend-title');
  if (weekendTitleEl) weekendTitleEl.textContent = 'Weekends';

  if (weekdayList) weekdayList.replaceChildren();
  if (weekendList) weekendList.replaceChildren();

  for (const item of config.schedule || []) {
    const scheduleItem = createScheduleItemElement(item, config);
    if (!scheduleItem) continue;

    if (item.days === 'daily') {
      if (weekdayList) weekdayList.appendChild(scheduleItem.cloneNode(true));
      if (weekendList) weekendList.appendChild(scheduleItem);
    } else if (item.days === 'weekdays' && weekdayList) {
      weekdayList.appendChild(scheduleItem);
    } else if (item.days === 'weekends' && weekendList) {
      weekendList.appendChild(scheduleItem);
    }
  }
}

function createScheduleItemElement(item, config) {
  const statusDef = config.types?.[item.status];
  if (!statusDef) return null;

  const listItem = document.createElement('li');
  listItem.className =
    'flex items-center justify-between p-3 border-b border-white/10 last:border-0';

  const statusWrapper = document.createElement('div');
  statusWrapper.className = 'flex items-center gap-3';

  const colorDot = document.createElement('div');
  colorDot.className = 'w-3 h-3 rounded-full';
  colorDot.style.backgroundColor = statusDef.color || '#6B7280';

  const label = document.createElement('span');
  label.className = 'font-medium text-slate-200';
  label.textContent = statusDef.text || item.status;

  const timeRange = document.createElement('span');
  timeRange.className = 'text-sm text-slate-400 font-mono';
  timeRange.textContent = formatUtcRangeToLocal(item);

  statusWrapper.appendChild(colorDot);
  statusWrapper.appendChild(label);
  listItem.appendChild(statusWrapper);
  listItem.appendChild(timeRange);

  return listItem;
}

function formatUtcRangeToLocal(item) {
  const d1 = new Date();
  const [h1, m1] = item.start.split(':');
  d1.setUTCHours(h1, m1, 0, 0);

  const d2 = new Date();
  const [h2, m2] = item.end.split(':');
  d2.setUTCHours(h2, m2, 0, 0);

  if (item.wrapsMidnight) {
    d2.setUTCDate(d2.getUTCDate() + 1);
  }

  const timeOpt = { hour: 'numeric', minute: '2-digit', hour12: true };
  const startTime = d1.toLocaleTimeString([], timeOpt);
  const endTime = d2.toLocaleTimeString([], timeOpt);
  const crossesLocalDay = getLocalDateKey(d1) !== getLocalDateKey(d2);

  return crossesLocalDay ? `${startTime} - ${endTime} (next day)` : `${startTime} - ${endTime}`;
}

function getLocalDateKey(date) {
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function createCloseIcon() {
  const svg = createSvgElement({
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    paths: [],
  });

  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('stroke-width', '3');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const firstLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  firstLine.setAttribute('x1', '18');
  firstLine.setAttribute('y1', '6');
  firstLine.setAttribute('x2', '6');
  firstLine.setAttribute('y2', '18');

  const secondLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  secondLine.setAttribute('x1', '6');
  secondLine.setAttribute('y1', '6');
  secondLine.setAttribute('x2', '18');
  secondLine.setAttribute('y2', '18');

  svg.appendChild(firstLine);
  svg.appendChild(secondLine);

  return svg;
}

function createSvgElement({ className, viewBox, fill, stroke, paths }) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  if (className) svg.setAttribute('class', className);
  if (fill) svg.setAttribute('fill', fill);
  if (stroke) svg.setAttribute('stroke', stroke);

  for (const pathDefinition of paths) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathDefinition.d);

    if (pathDefinition.stroke) path.setAttribute('stroke', pathDefinition.stroke);
    if (pathDefinition.strokeWidth) path.setAttribute('stroke-width', pathDefinition.strokeWidth);
    if (pathDefinition.strokeLinecap)
      path.setAttribute('stroke-linecap', pathDefinition.strokeLinecap);
    if (pathDefinition.strokeLinejoin) {
      path.setAttribute('stroke-linejoin', pathDefinition.strokeLinejoin);
    }

    svg.appendChild(path);
  }

  return svg;
}
