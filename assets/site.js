// Keep the page usable without JavaScript; native video controls are the fallback.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection?.saveData;
const videos = [...document.querySelectorAll('.project-video video')];
const videoState = new Map();

videos.forEach((video) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'media-toggle';
  const state = { visible: false, userPaused: false, userStarted: false };
  videoState.set(video, state);
  const updateButton = () => {
    button.textContent = video.paused ? 'Play ▶' : 'Pause Ⅱ';
    button.setAttribute('aria-label', `${video.paused ? 'Play' : 'Pause'} ${video.getAttribute('aria-label')}`);
    button.toggleAttribute('data-paused', video.paused);
  };
  button.addEventListener('click', () => {
    if (video.paused) {
      state.userPaused = false;
      state.userStarted = true;
      video.play().catch(updateButton);
    } else {
      state.userPaused = true;
      video.pause();
    }
  });
  video.addEventListener('play', updateButton);
  video.addEventListener('pause', updateButton);
  video.parentElement.append(button);
  video.controls = false;
  updateButton();
});

const synchronize = (video) => {
  const state = videoState.get(video);
  if (document.hidden || !state.visible || state.userPaused ||
      ((reducedMotion.matches || saveData) && !state.userStarted)) {
    video.pause();
  } else {
    video.play().catch(() => {});
  }
};
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, intersectionRatio }) => {
      videoState.get(target).visible = intersectionRatio >= 0.2;
      synchronize(target);
    });
  }, { threshold: 0.2 });
  videos.forEach((video) => observer.observe(video));
} // On older browsers, visitors can still explicitly play each video.
document.addEventListener('visibilitychange', () => videos.forEach(synchronize));
reducedMotion.addEventListener('change', () => {
  videos.forEach((video) => { videoState.get(video).userStarted = false; synchronize(video); });
});

const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-5% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('#about, #research, #education').forEach((section) => sectionObserver.observe(section));
}
