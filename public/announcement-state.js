(() => {
  const root = document.documentElement;
  const key = root.dataset.announcementKey;
  if (!key) return;

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('starrybioAnnouncement='));
  const dismissed = cookie
    ? decodeURIComponent(cookie.split('=').slice(1).join('=')) === key
    : false;

  root.dataset.announcementState = dismissed ? 'dismissed' : 'visible';
  if (dismissed) {
    root.style.setProperty('--announcement-clearance', '0px');
    return;
  }

  const connect = () => {
    const banner = document.querySelector('#announcement-banner');
    if (!(banner instanceof HTMLElement)) return false;
    const update = () => {
      const bottom = Math.max(0, banner.getBoundingClientRect().bottom);
      root.style.setProperty('--announcement-clearance', `${Math.ceil(bottom)}px`);
    };
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(banner);
    window.addEventListener('resize', update, { passive: true });
    return true;
  };

  if (!connect()) {
    const mutationObserver = new MutationObserver(() => {
      if (!connect()) return;
      mutationObserver.disconnect();
    });
    mutationObserver.observe(root, { childList: true, subtree: true });
  }
})();
