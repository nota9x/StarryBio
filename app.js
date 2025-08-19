// --- COOKIE HELPER FUNCTIONS ---
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}


// --- CORE UI/ANIMATION LOGIC (UNCHANGED) ---
// ... (this section is the same)
const starsContainer = document.querySelector('.stars-container');
const numberOfStars = 120;
const allStars = [];

function setupAnimations() {
    for (let i = 0; i < numberOfStars; i++) {
        let star = document.createElement('div');
        star.classList.add('star');
        const initialLeft = Math.random() * 100, initialTop = Math.random() * 100;
        const size = Math.random() * 3 + 0.5, duration = Math.random() * 4 + 2, depth = Math.random() * 0.8 + 0.1;
        star.style.left = initialLeft + 'vw'; star.style.top = initialTop + 'vh';
        star.style.width = size + 'px'; star.style.height = size + 'px';
        star.style.animationDuration = duration + 's'; star.style.animationDelay = Math.random() * duration + 's';
        starsContainer.appendChild(star);
        allStars.push({ element: star, initialLeft, initialTop, depth });
    }

    setInterval(() => {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');
        shootingStar.style.left = (Math.random() * 50 - 25) + 'vw';
        shootingStar.style.top = (Math.random() * 50 - 25) + 'vh';
        shootingStar.style.animationDelay = Math.random() * 2 + 's';
        starsContainer.appendChild(shootingStar);
        setTimeout(() => shootingStar.remove(), 3000);
    }, 5000 + Math.random() * 10000);

    let mouseXNorm = 0, mouseYNorm = 0, animationFrameId = null;
    document.body.addEventListener('mousemove', (e) => {
        mouseXNorm = (e.clientX / window.innerWidth) - 0.5;
        mouseYNorm = (e.clientY / window.innerHeight) - 0.5;
        if (!animationFrameId) animationFrameId = requestAnimationFrame(updateStarPositions);
    });
    function updateStarPositions() {
        allStars.forEach(starData => {
            const moveX = mouseXNorm * starData.depth * 40, moveY = mouseYNorm * starData.depth * 25;
            starData.element.style.left = `${starData.initialLeft + (moveX * 0.08)}vw`;
            starData.element.style.top = `${starData.initialTop + (moveY * 0.08)}vh`;
        });
        animationFrameId = null;
    }
}

// --- DATA LOADING AND PAGE POPULATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupAnimations();
    
    // REMOVED: The slow fetch() call is gone.
    // We now use the CONFIG object that was loaded instantly in the HTML head.
    if (typeof CONFIG !== 'undefined') {
        populatePage(CONFIG);
        document.body.style.opacity = '1';
    } else {
        console.error('CONFIG object not found. Make sure config.js is loaded correctly.');
        document.getElementById('profileName').textContent = 'Error';
        document.getElementById('profileTitle').textContent = 'Could not load configuration.';
        document.body.style.opacity = '1';
    }
});

function populatePage(data) {
    document.title = data.pageTitle || 'Links';

    if (data.announcement?.enabled && !getCookie('announcementDismissed')) {
        populateAnnouncement(data.announcement);
    }
    
    populateProfile(data.profile);
    populateLinks(data.links);
    populateFooter(data.footer);

    if (data.statusIndicator?.enabled) {
        initStatusIndicator(data.statusIndicator);
    }
}

function populateProfile(profile) {
    // The main 'src' is set by the fast inline script. This only handles the fallback.
    const profileImg = document.getElementById('profileImage');
    if (profileImg) {
        profileImg.onerror = function() {
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
        bannerLink.addEventListener('animationend', () => {
            bannerLink.remove();
        }, { once: true });
    });

    bannerLink.appendChild(contentWrapper);
    bannerLink.appendChild(closeButton);
    container.appendChild(bannerLink);
}

function populateProfile(profile) {
    document.getElementById('profileImage').src = profile.profileImage;
    document.getElementById('profileImage').onerror = function() {
        this.onerror = null; this.src = profile.profileImageFallback;
    };
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileTitle').textContent = profile.title;
}

function populateLinks(links) {
    const container = document.getElementById('linksContainer');
    container.innerHTML = '';
    links.forEach(linkData => {
        const linkEl = createLinkElement(linkData);
        container.appendChild(linkEl);
        if (linkData.type === 'discord') {
            initializeDiscordCopyButton(linkEl, linkData.subtitleToCopy, linkData.displaySubtitle);
        }
    });
}

function populateFooter(footer) {
    const currentYear = new Date().getFullYear();
    document.getElementById('footerContent').innerHTML = `${footer.textPrefix} ${currentYear} ${footer.textSuffix}`;
}

function createLinkElement(linkData) {
    const linkButton = document.createElement(linkData.url && linkData.url !== '#' ? 'a' : 'button');
    if (linkData.url && linkData.url !== '#') linkButton.href = linkData.url;
    
    linkButton.className = 'link-button';
    if (linkData.id) linkButton.id = linkData.id;
    if (linkData.title) linkButton.title = linkData.title;

    if (linkData.targetBlank) {
        linkButton.target = '_blank';
        linkButton.rel = 'noopener noreferrer';
    }
    if (linkData.type === 'discord') {
        linkButton.classList.add('discord-copy-button');
    }

    let iconHtml = '';
    if (linkData.iconSVGPath) {
        iconHtml = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="${linkData.iconSVGPath}"/></svg>`;
    } else if (linkData.iconImageURL) {
        const classes = (linkData.iconClasses || ['link-button-icon']).join(' ');
        iconHtml = `<span class="link-button-icon-wrapper"><img src="${linkData.iconImageURL}" alt="${linkData.iconAltText || ''}" class="${classes}"></span>`;
    }

    linkButton.innerHTML = `
        ${iconHtml}
        <div class="button-text-wrapper">
            <span class="button-main-text">${linkData.mainText}</span>
            <span class="button-subtitle">${linkData.displaySubtitle || ''}</span>
        </div>`;
    return linkButton;
}

function initializeDiscordCopyButton(buttonElement, usernameToCopy, originalSubtitleText) {
    if (!buttonElement) return;

    const subtitleElement = buttonElement.querySelector('.button-subtitle');
    const subtitleFadeDuration = 200;
    const iconFadeDuration = 300;
    const copiedMessageTotalDuration = 2000;
    let timeoutId1, timeoutId2, timeoutId3, timeoutId4;

    buttonElement.addEventListener('click', (e) => {
        e.preventDefault();
        clearTimeout(timeoutId1); clearTimeout(timeoutId2);
        clearTimeout(timeoutId3); clearTimeout(timeoutId4);

        buttonElement.classList.remove('fading-out-checkmark', 'copied');

        navigator.clipboard.writeText(usernameToCopy)
            .then(() => {
                if (subtitleElement) {
                    const originalFontWeight = "400";
                    const currentOpacity = window.getComputedStyle(subtitleElement).opacity || "0.9";
                    subtitleElement.style.opacity = '0';
                    timeoutId1 = setTimeout(() => {
                        subtitleElement.textContent = 'Username Copied!';
                        subtitleElement.style.fontWeight = 'bold';
                        subtitleElement.style.opacity = currentOpacity;
                        buttonElement.classList.add('copied');
                        buttonElement.classList.remove('fading-out-checkmark');
                        const revertStartTime = copiedMessageTotalDuration - Math.max(subtitleFadeDuration, iconFadeDuration);
                        timeoutId2 = setTimeout(() => {
                            subtitleElement.style.opacity = '0';
                            buttonElement.classList.add('fading-out-checkmark');
                            timeoutId3 = setTimeout(() => {
                                subtitleElement.textContent = originalSubtitleText;
                                subtitleElement.style.fontWeight = originalFontWeight;
                                subtitleElement.style.opacity = currentOpacity;
                                buttonElement.classList.remove('copied', 'fading-out-checkmark');
                            }, Math.max(subtitleFadeDuration, iconFadeDuration));
                        }, revertStartTime);
                    }, subtitleFadeDuration);
                }
            })
            .catch(err => {
                console.error('Failed to copy username: ', err);
                if (subtitleElement) {
                    const originalFontWeight = "400";
                    const currentOpacity = window.getComputedStyle(subtitleElement).opacity || "0.9";
                    subtitleElement.style.opacity = '0';
                    timeoutId4 = setTimeout(() => {
                        subtitleElement.textContent = 'Copy Failed!';
                        subtitleElement.style.fontWeight = 'bold';
                        subtitleElement.style.color = '#FF8A8A';
                        subtitleElement.style.opacity = currentOpacity;
                        setTimeout(() => {
                            subtitleElement.style.opacity = '0';
                            setTimeout(() => {
                                subtitleElement.textContent = originalSubtitleText;
                                subtitleElement.style.fontWeight = originalFontWeight;
                                subtitleElement.style.color = '#A0A8C0'; // Revert color
                                subtitleElement.style.opacity = currentOpacity;
                            }, subtitleFadeDuration);
                        }, copiedMessageTotalDuration - subtitleFadeDuration);
                    }, subtitleFadeDuration);
                }
            });
    });
}

// --- STATUS INDICATOR AND SCHEDULING LOGIC ---

function initStatusIndicator(config) {
    const profileImageWrapper = document.querySelector('.profile-image-wrapper');
    if (!profileImageWrapper) return;

    profileImageWrapper.insertAdjacentHTML('beforeend', `
        <div id="status-indicator-container">
            <div id="status-indicator-icon"></div>
            <div id="status-tooltip">
                <div id="tooltip-status" class="font-bold text-base mb-1"></div>
                <div class="text-xs text-slate-300 flex items-center gap-2">
                    <span id="tooltip-time-label"></span>
                    <span id="tooltip-time" class="font-mono"></span>
                </div>
                <div id="tooltip-availability" class="text-xs italic text-amber-300 mt-2"></div>
            </div>
        </div>
    `);
    
    const elements = {
        icon: document.getElementById('status-indicator-icon'),
        tooltipStatus: document.getElementById('tooltip-status'),
        tooltipTimeLabel: document.getElementById('tooltip-time-label'),
        tooltipTime: document.getElementById('tooltip-time'),
        tooltipAvailability: document.getElementById('tooltip-availability'),
        modal: document.getElementById('status-modal'),
        modalOverlay: document.getElementById('status-modal-overlay'),
        modalClose: document.getElementById('status-modal-close'),
        indicatorContainer: document.getElementById('status-indicator-container'),
    };

    populateScheduleModal(config);
    elements.indicatorContainer.addEventListener('click', () => elements.modal.classList.remove('hidden'));
    elements.modalClose.addEventListener('click', () => elements.modal.classList.add('hidden'));
    elements.modalOverlay.addEventListener('click', () => elements.modal.classList.add('hidden'));

    let lastStatusKey = null;
    function updateLoop() {
        const currentStatusKey = getCurrentStatusKey(config);
        
        if (currentStatusKey !== lastStatusKey) {
            const statusDetails = config.statuses[currentStatusKey];
            const iconUrl = config.icons[statusDetails.icon];

            elements.icon.style.backgroundColor = statusDetails.color;
            elements.icon.style.webkitMaskImage = `url('${iconUrl}')`;
            elements.icon.style.maskImage = `url('${iconUrl}')`;

            elements.tooltipStatus.textContent = statusDetails.label;

            if (statusDetails.availabilityMessage) {
                elements.tooltipAvailability.textContent = statusDetails.availabilityMessage;
                elements.tooltipAvailability.style.display = 'block';
            } else {
                elements.tooltipAvailability.style.display = 'none';
            }
            lastStatusKey = currentStatusKey;
        }

        elements.tooltipTimeLabel.textContent = config.tooltip.localTimeLabel;
        elements.tooltipTime.textContent = new Date().toLocaleTimeString('en-US', {
            timeZone: config.displayTimeZone,
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    }

    updateLoop();
    setInterval(updateLoop, 1000);
}

function getCurrentStatusKey(config) {
    const now = new Date();
    const utcDay = now.getUTCDay(); // 0=Sun, 6=Sat
    const utcTime = now.getUTCHours() + now.getUTCMinutes() / 60;
    
    const isWeekend = (utcDay === 0 || utcDay === 6);
    const schedule = isWeekend ? config.schedule.weekends : config.schedule.weekdays;

    for (const entry of schedule) {
        const start = parseFloat(entry.startUTC.replace(':', '.'));
        const end = parseFloat(entry.endUTC.replace(':', '.'));
        if (start > end) {
            if (utcTime >= start || utcTime < end) return entry.status;
        } else {
            if (utcTime >= start && utcTime < end) return entry.status;
        }
    }
    return config.defaultStatus;
}

function populateScheduleModal(config) {
    document.getElementById('status-modal-title').textContent = config.modalConfig.title;
    document.getElementById('status-modal-weekday-title').textContent = config.modalConfig.weekdayTitle;
    document.getElementById('status-modal-weekend-title').textContent = config.modalConfig.weekendTitle;

    const weekdayList = document.getElementById('weekday-schedule-list');
    const weekendList = document.getElementById('weekend-schedule-list');
    
    const formatTime = (utcTimeStr) => {
        const [hour, minute] = utcTimeStr.split(':');
        const date = new Date();
        date.setUTCHours(parseInt(hour), parseInt(minute), 0, 0);
        return date.toLocaleTimeString('en-US', { 
            timeZone: config.displayTimeZone,
            hour: 'numeric', minute: '2-digit', hour12: true 
        });
    };
    
    const createLi = (entry) => {
        const status = config.statuses[entry.status];
        return `<li class="flex items-center justify-between p-3">
            <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full" style="background-color: ${status.color};"></div>
                <span class="font-medium">${status.label}</span>
            </div>
            <span class="text-sm text-slate-300">${entry.timeRange}</span>
        </li>`;
    };
    
    const processSchedule = (schedule) => schedule.map(e => ({
        ...e,
        timeRange: `${formatTime(e.startUTC)} - ${formatTime(e.endUTC)}`
    }));

    const weekdaySchedule = processSchedule(config.schedule.weekdays);
    weekdaySchedule.push({ status: config.defaultStatus, timeRange: "All other times" });
    weekdayList.innerHTML = weekdaySchedule.map(createLi).join('');

    const weekendSchedule = processSchedule(config.schedule.weekends);
    weekendSchedule.push({ status: config.defaultStatus, timeRange: "All other times" });
    weekendList.innerHTML = weekendSchedule.map(createLi).join('');
}