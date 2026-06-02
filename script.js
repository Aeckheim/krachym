// Loads content.json and populates the page dynamically

// Reliable touch detection — CSS media queries are unreliable on Android Chrome
if (navigator.maxTouchPoints > 0) {
  document.body.classList.add('touch');
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function lighten(hex, amt) {
  return '#' + hex.slice(1).match(/.{2}/g)
    .map(c => Math.min(255, parseInt(c,16) + amt).toString(16).padStart(2,'0')).join('');
}
function darken(hex, amt) { return lighten(hex, -amt); }

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function socialIcon(platform) {
  const icons = {
    instagram: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    facebook: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    spotify: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
    bandcamp: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M0 18.75l7.437-13.5H24l-7.438 13.5z"/></svg>`
  };
  return icons[platform] || '';
}

async function loadContent() {
  const res = await fetch('content.json');
  const c = await res.json();

  // Apply CSS variables from meta
  if (c.meta) {
    const root = document.documentElement;
    if (c.meta.primary_color)    root.style.setProperty('--text', c.meta.primary_color);
    if (c.meta.accent_color)     root.style.setProperty('--accent', c.meta.accent_color);
    if (c.meta.background_color) {
      const bg = c.meta.background_color;
      root.style.setProperty('--bg', bg);
      // Derive bg variants — always slightly lighter/darker blend
      root.style.setProperty('--bg-alt',  lighten(bg, -6));
      root.style.setProperty('--bg-card', lighten(bg, -12));
      // Border uses the text color at low opacity for crispness
      const tc = c.meta.primary_color || '#ffffff';
      root.style.setProperty('--border', tc + '30');
    }
    if (c.meta.font === 'sans')  root.style.setProperty('--font-serif', 'system-ui, sans-serif');
    // Heading scale
    if (c.meta.heading_scale) {
      const scales = { compact: '0.75', normal: '1', large: '1.3', xlarge: '1.6' };
      root.style.setProperty('--heading-scale', scales[c.meta.heading_scale] ?? '1');
    }
    // Section order + 3D depth planes
    // Planes cycle: front(300) > circles(200) > mid(150) > shapes(100) > back(50)
    // → sections alternate between hiding circles, showing them, and going behind everything
    const sectionOrder = (c.meta.section_order && c.meta.section_order.length)
      ? c.meta.section_order
      : ['about', 'releases', 'photos', 'videos', 'live'];
    const depthPlanes = [300, 50, 150, 50, 300]; // front, back, mid, back, front
    if (c.meta.section_order && c.meta.section_order.length) {
      const anchor = document.getElementById('imprint');
      if (anchor) sectionOrder.forEach(id => {
        const el = document.getElementById(id);
        if (el) anchor.before(el);
      });
    }
    sectionOrder.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.position = 'relative';
      el.style.zIndex   = depthPlanes[i % depthPlanes.length];
    });
    // Nav & marquee colors
    if (c.meta.nav_bg || c.meta.nav_color) {
      const nav = document.getElementById('nav');
      if (nav) {
        if (c.meta.nav_bg)    nav.style.background = c.meta.nav_bg;
        if (c.meta.nav_color) {
          nav.style.color = c.meta.nav_color;
          const logo = document.getElementById('nav-name');
          if (logo) logo.style.color = c.meta.nav_color;
          document.querySelectorAll('.nav-links li a').forEach(a => a.style.color = c.meta.nav_color);
        }
      }
      // Hero shows strip uses same colors as nav
      const strip = document.querySelector('.hero-shows-strip');
      if (strip) {
        if (c.meta.nav_bg)    strip.style.background = c.meta.nav_bg;
        if (c.meta.nav_color) strip.style.color = c.meta.nav_color;
      }
    }
    if (c.meta.marquee_bg || c.meta.marquee_color) {
      const bar = document.querySelector('.marquee-bar');
      if (bar) {
        if (c.meta.marquee_bg)   bar.style.background = c.meta.marquee_bg;
        if (c.meta.marquee_color) {
          document.querySelectorAll('.marquee-track span').forEach(s => s.style.color = c.meta.marquee_color);
        }
      }
    }
    // Section colors
    if (c.meta.sections) {
      Object.entries(c.meta.sections).forEach(([id, s]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (s.bg)    el.style.background = s.bg;
        if (s.color) el.style.color = s.color;
      });
    }
    // Effects
    if (c.meta.effects) {
      const fx = c.meta.effects;
      if (fx.checkerboard  === false) document.body.classList.add('no-checkerboard');
      if (fx.flying_shapes === false) { const e = document.querySelector('.flying-shapes'); if (e) e.style.display = 'none'; }
      if (fx.circles       === false) { const e = document.querySelector('.deco-circles');  if (e) e.style.display = 'none'; }
      if (fx.marquee       === false) { const e = document.querySelector('.marquee-bar');   if (e) e.style.display = 'none'; }
      if (fx.glitch        === false) { const e = document.getElementById('hero-name');     if (e) e.classList.add('no-glitch'); }
    }
    // Element effects (fx-* class library)
    if (c.meta.element_effects) {
      const selectors = {
        'hero-name':      '#hero-name',
        'hero-tagline':   '#hero-tagline',
        'section-titles': '.section-title',
        'nav-logo':       '#nav-name',
        'marquee':        '#marquee-track',
        'about-text':     '#about-text',
      };
      Object.entries(c.meta.element_effects).forEach(([elemId, effects]) => {
        const sel = selectors[elemId];
        if (!sel || !effects || !effects.length) return;
        document.querySelectorAll(sel).forEach(el => {
          effects.forEach(fx => el.classList.add('fx-' + fx));
        });
      });
    }
    document.title = c.meta.title || c.artist.name;
    document.getElementById('meta-description').content = c.meta.description || '';
  }

  // Artist name
  const name = c.artist.name;
  document.getElementById('meta-title').textContent = name;
  document.getElementById('nav-name').textContent = name.toLowerCase();
  document.getElementById('hero-name').textContent = name.toLowerCase();
  document.getElementById('footer-name').textContent = name.toLowerCase();
  document.getElementById('hero-tagline').textContent = c.artist.tagline;
  updateGlitch(name);
  updateMarquee(name);
  document.getElementById('about-text').textContent = c.artist.about;

  // Upcoming shows strip after hero
  const todayDate = new Date(); todayDate.setHours(0,0,0,0);
  const upcoming = (c.shows && c.shows.upcoming || [])
    .filter(s => new Date(s.date + 'T00:00:00') >= todayDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcomingEl = document.getElementById('hero-upcoming-shows');
  if (upcomingEl && upcoming.length) {
    const preview = upcoming.slice(0, 2);
    const hasMore = upcoming.length > 2;
    upcomingEl.innerHTML = `
      <div class="hero-shows-strip">
        <span class="hero-shows-label">upcoming</span>
        ${preview.map(s => `
          <a href="#live" class="hero-show-item">
            <span class="hero-show-date">${formatDate(s.date)}</span>
            <span class="hero-show-sep">—</span>
            <span class="hero-show-venue">${s.venue}, ${s.city}</span>
          </a>
        `).join('')}
        ${hasMore ? `<a href="#live" class="hero-shows-more">+${upcoming.length - 2} more →</a>` : ''}
      </div>
    `;
  }

  // Artist photo
  const photoEl = document.getElementById('about-photo');
  if (c.artist.photo) {
    photoEl.src = c.artist.photo;
    photoEl.alt = c.artist.name;
    photoEl.onerror = () => {
      photoEl.parentElement.innerHTML = `<div class="about-photo-placeholder">No photo yet</div>`;
    };
  } else {
    photoEl.parentElement.innerHTML = `<div class="about-photo-placeholder">No photo yet</div>`;
  }

  // Social links (hero + footer)
  const socialHTML = Object.entries(c.social)
    .filter(([, url]) => url)
    .map(([platform, url]) => `<a href="${url}" target="_blank" rel="noopener">${socialIcon(platform)} ${platform}</a>`)
    .join('');
  document.getElementById('social-links').innerHTML = socialHTML;
  document.getElementById('footer-social').innerHTML = socialHTML;

  // Shop link
  const shopLink = c.social.bandcamp || '#';
  document.getElementById('nav-shop').href = shopLink;

  // Photos
  const photoGrid = document.getElementById('photos-grid');
  if (photoGrid && c.photos && c.photos.length) {
    const gdata = encGallery(c.photos.map(p => ({ src: p.src, credit: p.credit || '' })));
    photoGrid.innerHTML = c.photos.map((p, i) =>
      `<img src="${p.src}" alt="${p.alt}" loading="lazy" onclick="openGallery('${gdata}', ${i})" />`
    ).join('');
  }

  // Releases
  const relGrid = document.getElementById('releases-grid');
  relGrid.innerHTML = c.releases.map(r => {
    if (r.description) {
      // Featured layout: cover left, text right
      return `
        <div class="release-featured reveal">
          <a class="release-cover-link" href="${r.link || '#'}" target="_blank" rel="noopener">
            <div class="release-cover-wrap">
              ${r.cover
                ? `<img class="release-cover" src="${r.cover}" alt="${r.title}" onerror="this.outerHTML='<div class=release-cover-placeholder>${r.title}</div>'" />`
                : `<div class="release-cover-placeholder">${r.title}</div>`}
              <div class="release-cover-badge">↗</div>
            </div>
          </a>
          <div class="release-detail reveal-right delay-1">
            <div class="release-title">${r.title}</div>
            <div class="release-meta">${r.year}${r.type ? ' · ' + r.type : ''}</div>
            <p class="release-description">${r.description.replace(/\n/g, '<br>')}</p>
            ${r.bandcamp_embed_id ? `<div class="bandcamp-player"><iframe style="border:0;width:100%;height:330px" src="https://bandcamp.com/EmbeddedPlayer/album=${r.bandcamp_embed_id}/size=large/bgcol=8252fe/linkcol=f5f500/tracklist=true/artwork=small/" seamless></iframe></div>` : (r.link ? `<a class="release-listen-btn" href="${r.link}" target="_blank" rel="noopener">Listen on Bandcamp ↗</a>` : '')}
          </div>
        </div>
      `;
    }
    // Standard card
    return `
      <a class="release-card" href="${r.link || '#'}" target="_blank" rel="noopener">
        <div class="release-cover-wrap">
          ${r.cover
            ? `<img class="release-cover" src="${r.cover}" alt="${r.title}" onerror="this.outerHTML='<div class=release-cover-placeholder>${r.title}</div>'" />`
            : `<div class="release-cover-placeholder">${r.title}</div>`}
        </div>
        <div class="release-info">
          <div class="release-title">${r.title}</div>
          <div class="release-meta">${r.year}${r.type ? ' · ' + r.type : ''}</div>
        </div>
      </a>
    `;
  }).join('');

  // Videos
  const vidGrid = document.getElementById('videos-grid');
  vidGrid.innerHTML = c.videos.map(v => `
    <div class="video-card">
      <div class="video-wrapper">
        <iframe src="https://www.youtube.com/embed/${v.youtube_id}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen loading="lazy"></iframe>
      </div>
      <p class="video-title">${v.title}</p>
    </div>
  `).join('');

  // Shows — split by today's date regardless of which array they're stored in
  const allShows = [...(c.shows.upcoming || []), ...(c.shows.past || [])];
  const showToday = new Date(); showToday.setHours(0,0,0,0);
  const upcomingShows = allShows
    .filter(s => new Date(s.date + 'T00:00:00') >= showToday)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastShows = allShows
    .filter(s => new Date(s.date + 'T00:00:00') < showToday)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  function renderShows(shows, containerId) {
    const el = document.getElementById(containerId);
    if (!shows || shows.length === 0) {
      el.innerHTML = `<p class="no-shows">No shows listed.</p>`;
      return;
    }
    el.innerHTML = shows.map(s => {
      const gdata = encGallery((s.photos || []).map(p => ({ src: p.full || p.thumb, credit: p.credit || '' })));
      const photoCircles = (s.photos || []).map((p, pi) => `<div class="show-photo" onclick="openGallery('${gdata}', ${pi})"><img src="${p.thumb}" alt="${s.venue} ${pi+1}" loading="lazy"></div>`).join('');
      return `
      <div class="show-item">
        <div class="show-date">${formatDate(s.date)}</div>
        <div class="show-info">
          <div class="show-venue-row">
            <span class="show-venue-text">${s.venue}${s.note ? ' <span class="show-note">' + s.note + '</span>' : ''}</span>
            ${photoCircles}
          </div>
          <div class="show-city">${s.city}${s.country ? ', ' + s.country : ''}</div>
        </div>
        <div class="show-tickets">
          ${s.tickets ? `<a href="${s.tickets}" target="_blank" rel="noopener">Tickets</a>` : ''}
        </div>
      </div>
    `;
    }).join('');
  }
  // Upcoming show photos — large images at top of Live section
  const upcomingPhotos = upcomingShows.flatMap(s => (s.photos || []).map(p => ({ src: p.full || p.thumb, thumb: p.thumb || p.full, show: s.venue + ', ' + s.city, credit: p.credit || '' })));
  const upcomingPhotosEl = document.getElementById('upcoming-show-photos');
  if (upcomingPhotosEl && upcomingPhotos.length) {
    const gdata = encGallery(upcomingPhotos.map(p => ({ src: p.src, credit: p.credit })));
    upcomingPhotosEl.innerHTML = `<div class="upcoming-photos-grid reveal">${
      upcomingPhotos.map((p, i) => `<img src="${p.src}" alt="${p.show}" loading="lazy" onclick="openGallery('${gdata}', ${i})" title="${p.show}" />`).join('')
    }</div>`;
  }

  renderShows(upcomingShows, 'shows-upcoming');
  renderShows(pastShows, 'shows-past');

  // Activate show item closest to screen center on scroll (touch devices only)
  const showsPastEl = document.getElementById('shows-past');
  let showsSectionVisible = false;

  const updateActiveShow = () => {
    const items = document.querySelectorAll('#shows-past .show-item');
    if (!items.length) return;
    if (!showsSectionVisible) {
      items.forEach(el => el.classList.remove('active'));
      return;
    }
    const mid = window.innerHeight / 2;
    let closest = null, minDist = Infinity;
    items.forEach(el => {
      const r = el.getBoundingClientRect();
      const dist = Math.abs((r.top + r.bottom) / 2 - mid);
      if (dist < minDist) { minDist = dist; closest = el; }
    });
    items.forEach(el => el.classList.toggle('active', el === closest));
  };

  new IntersectionObserver(entries => {
    showsSectionVisible = entries[0].isIntersecting;
    updateActiveShow();
  }, { threshold: 0.05 }).observe(showsPastEl);

  window.addEventListener('scroll', updateActiveShow, { passive: true });

  // Next gig in marquee — must insert into BOTH halves (animation moves -50% of track width)
  const today = new Date(); today.setHours(0,0,0,0);
  const nextGig = (c.shows.upcoming || [])
    .filter(s => new Date(s.date + 'T00:00:00') >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  if (nextGig) {
    const gigText = `next show: ${formatDate(nextGig.date)} — ${nextGig.venue}, ${nextGig.city}`;
    const gigSpan = `<span class="sep"> ★ </span><span class="marquee-gig">${gigText}</span>`;
    const track = document.getElementById('marquee-track');
    const name2 = document.getElementById('marquee-name2');
    if (track && name2) {
      // Insert at end of first half (before duplicate copy)
      name2.insertAdjacentHTML('beforebegin', gigSpan);
      // Insert at end of second half (at track end)
      track.insertAdjacentHTML('beforeend', gigSpan);
    }
  }

  // Imprint
  const imp = c.imprint;
  document.getElementById('imprint-content').innerHTML = `
    <p>${imp.name}</p>
    <p>${imp.address}</p>
    ${imp.text ? `<p style="margin-top:1rem">${imp.text}</p>` : ''}
    <form class="contact-form" onsubmit="sendContactForm(event,'${imp.email}')">
      <input type="text" name="name" placeholder="Name" required>
      <input type="email" name="from" placeholder="Deine E-Mail" required>
      <textarea name="message" placeholder="Nachricht" rows="4" required></textarea>
      <button type="submit">Senden</button>
    </form>
  `;
}

// Nav scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile nav toggle
document.querySelector('.nav-toggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});



// Scroll reveal (IntersectionObserver)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

function initReveal() {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });
}

// Update hero h1 data-text when name loads
function updateGlitch(name) {
  const h1 = document.getElementById('hero-name');
  if (h1) h1.setAttribute('data-text', name.toLowerCase());
}

// Update marquee with artist name
function updateMarquee(name) {
  ['marquee-name', 'marquee-name2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = name.toLowerCase();
  });
}

loadContent().then(() => {
  initReveal();
});

// Cookie banner
(function() {
  const banner = document.getElementById('cookie-banner');
  const btn    = document.getElementById('cookie-accept');
  if (!banner || !btn) return;
  if (localStorage.getItem('cookie-ok')) {
    banner.classList.add('hidden');
    return;
  }
  btn.addEventListener('click', () => {
    localStorage.setItem('cookie-ok', '1');
    banner.classList.add('hidden');
  });
})();

// Circles: staggered scroll-reveal + parallax at different speeds
function initCircles() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const layers = [
    { selector: '.deco-circle-1', vy: 0.55, triggerAt: 60   },
    { selector: '.deco-circle-4', vy: 0.4,  triggerAt: 180  },
    { selector: '.deco-circle-3', vy: 0.25, triggerAt: 340  },
    { selector: '.deco-circle-2', vy: 0.12, triggerAt: 520  },
  ].map(({ selector, vy, triggerAt }) => ({
    el: document.querySelector(selector), vy, triggerAt, shown: false
  }));

  // On mobile: parallax at reduced speeds + fade out after hero
  if (isMobile) {
    layers.forEach(({ el }) => { if (el) el.classList.add('visible'); });
    const hero = document.getElementById('top');
    const circlesEl = document.querySelector('.deco-circles');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const heroH = hero ? hero.offsetHeight : window.innerHeight;
        // Parallax movement at each circle's own speed
        layers.forEach(({ el, vy }) => {
          if (el) el.style.transform = `translateY(${y * vy * 0.5}px)`;
        });
        // Fade out: half visible in videos section, gone after it
        const videosEl = document.getElementById('videos');
        const fadeStart = videosEl ? videosEl.offsetTop : heroH * 3;
        const fadeEnd = videosEl ? videosEl.offsetTop + videosEl.offsetHeight : heroH * 5;
        const fade = Math.max(0, 1 - (y - fadeStart) / (fadeEnd - fadeStart));
        if (circlesEl) circlesEl.style.opacity = Math.min(1, fade);
        ticking = false;
      });
    }, { passive: true });
    return;
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      layers.forEach(({ el, vy, triggerAt, shown }, i) => {
        if (!el) return;
        if (!shown && y >= triggerAt) {
          el.classList.add('visible');
          layers[i].shown = true;
        }
        el.style.transform = `translateY(${y * vy}px)`;
      });
      ticking = false;
    });
  }, { passive: true });
}

initCircles();

// Checkerboard: grows + fades, reappears + shrinks in LIVE section
(function() {
  const el = document.getElementById('checker-bg');
  if (!el) return;
  function update() {
    const y = window.scrollY;
    const liveEl = document.getElementById('live');
    const liveTop = liveEl ? liveEl.offsetTop - 100 : Infinity;
    if (y >= liveTop) {
      const progress = y - liveTop;
      const size = Math.max(20, 300 - progress * 0.2);
      const shrinkProgress = Math.max(0, 1 - (size - 20) / 280);
      const opacity = Math.min(0.9, progress * 0.003) * (1 - shrinkProgress);
      el.style.backgroundSize = `${size}px ${size}px`;
      el.style.backgroundPosition = 'left center';
      el.style.opacity = opacity;
    } else {
      const size = 120 + y * 0.12;
      const opacity = Math.max(0, 1 - y * 0.0006);
      el.style.backgroundSize = `${size}px ${size}px`;
      el.style.backgroundPosition = 'center center';
      el.style.opacity = opacity;
    }
  }
  window.addEventListener('scroll', update, { passive: true });
})();

function sendContactForm(e, toEmail) {
  e.preventDefault();
  const f = e.target;
  const name = f.name.value;
  const from = f.from.value;
  const msg = f.message.value;
  const subject = encodeURIComponent(`Kontakt von ${name}`);
  const body = encodeURIComponent(`Von: ${name} <${from}>\n\n${msg}`);
  window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
}

// Encode a photo gallery [{src, credit}] for safe use inside a single-quoted onclick attribute.
function encGallery(arr) {
  return encodeURIComponent(JSON.stringify(arr)).replace(/'/g, '%27');
}

let _lbGallery = [];
let _lbIndex = 0;

// Open a gallery of photos starting at a given index. `encoded` comes from encGallery().
function openGallery(encoded, index) {
  try { _lbGallery = JSON.parse(decodeURIComponent(encoded)); }
  catch (e) { _lbGallery = []; }
  _lbIndex = index || 0;
  _renderLightbox();
  document.getElementById('lightbox').style.display = 'flex';
  document.addEventListener('keydown', _lbKeyHandler);
}

// Back-compat single-image entry point. `credit` may be plain or encodeURIComponent-encoded.
function openLightbox(src, credit) {
  let c = credit || '';
  try { if (c) c = decodeURIComponent(c); } catch (e) {}
  openGallery(encGallery([{ src: src, credit: c }]), 0);
}

function lightboxStep(dir) {
  if (_lbGallery.length < 2) return;
  _lbIndex = (_lbIndex + dir + _lbGallery.length) % _lbGallery.length;
  _renderLightbox();
}

function _renderLightbox() {
  const item = _lbGallery[_lbIndex] || {};
  document.getElementById('lightbox-img').src = item.src || '';
  const cap = document.getElementById('lightbox-credit');
  if (cap) {
    cap.textContent = item.credit ? '📷 ' + item.credit : '';
    cap.style.display = item.credit ? 'block' : 'none';
  }
  const multi = _lbGallery.length > 1;
  const counter = document.getElementById('lightbox-counter');
  if (counter) {
    counter.textContent = multi ? (_lbIndex + 1) + ' / ' + _lbGallery.length : '';
    counter.style.display = multi ? 'block' : 'none';
  }
  ['lightbox-prev', 'lightbox-next'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.style.display = multi ? 'flex' : 'none';
  });
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
  document.removeEventListener('keydown', _lbKeyHandler);
}

function _lbKeyHandler(e) {
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') lightboxStep(-1);
  else if (e.key === 'ArrowRight') lightboxStep(1);
}

// Butterfly: tap/click a butterfly to spawn a duplicate at a random spot,
// with a little pop-in animation. The new butterflies then fly freely around
// the screen. Works on PC, Android and iPhone (click fires on tap too).
// Capped so the page can't get flooded.
(function initButterflyClone() {
  const BUTTERFLY_SRC = 'https://sengpielaudio.com/ANSchmetterling01.gif';
  const MAX_BUTTERFLIES = 50;
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const flyers = [];   // butterflies currently flying around
  let count = 0;
  let rafId = null;
  let lastT = 0;

  function spawnButterfly() {
    if (count >= MAX_BUTTERFLIES) return;
    count++;

    // Size matches the CSS (~64px), shrink a bit on small screens.
    const size = window.innerWidth < 600 ? 48 : 64;
    const margin = size;
    const x = margin + Math.random() * Math.max(0, window.innerWidth  - margin * 2);
    const y = margin + Math.random() * Math.max(0, window.innerHeight - margin * 2);

    const b = document.createElement('img');
    b.src = BUTTERFLY_SRC;
    b.alt = '';
    b.className = 'butterfly-clone';
    b.setAttribute('aria-hidden', 'true');
    b.style.width = size + 'px';
    b.style.left = (x - size / 2) + 'px';
    b.style.top  = (y - size / 2) + 'px';
    document.body.appendChild(b);

    if (reduceMotion) return;  // respect users who prefer no motion

    // Once the pop-in finishes, hand the butterfly over to the flight loop.
    b.addEventListener('animationend', function onPop() {
      b.removeEventListener('animationend', onPop);
      b.style.animation = 'none';           // stop the CSS pop animation
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 0.9;
      flyers.push({
        el: b,
        size,
        anchorX: x - size / 2,   // its left/top in px; movement is a transform offset
        anchorY: y - size / 2,
        tx: 0, ty: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
      startFlightLoop();
    });
  }

  // Single shared animation loop drives every flying butterfly (cheap on mobile).
  function startFlightLoop() {
    if (rafId !== null) return;
    lastT = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function tick(now) {
    const dt = Math.min(50, now - lastT) / 16.67;  // ~1 per frame at 60fps
    lastT = now;
    const W = window.innerWidth;
    const H = window.innerHeight;

    for (const f of flyers) {
      // Gentle random steering for an organic, wandering flight.
      f.vx += (Math.random() - 0.5) * 0.18;
      f.vy += (Math.random() - 0.5) * 0.18;
      const sp = Math.hypot(f.vx, f.vy);
      const max = 2.4;
      if (sp > max) { f.vx = f.vx / sp * max; f.vy = f.vy / sp * max; }

      f.tx += f.vx * dt;
      f.ty += f.vy * dt;

      // Bounce off the viewport edges.
      const minX = -f.anchorX, maxX = W - f.size - f.anchorX;
      const minY = -f.anchorY, maxY = H - f.size - f.anchorY;
      if (f.tx < minX) { f.tx = minX; f.vx = Math.abs(f.vx); }
      else if (f.tx > maxX) { f.tx = maxX; f.vx = -Math.abs(f.vx); }
      if (f.ty < minY) { f.ty = minY; f.vy = Math.abs(f.vy); }
      else if (f.ty > maxY) { f.ty = maxY; f.vy = -Math.abs(f.vy); }

      const dir  = f.vx < 0 ? -1 : 1;                       // face flight direction
      const tilt = Math.max(-14, Math.min(14, f.vy * 5));   // tilt up/down a little
      f.el.style.transform =
        `translate(${f.tx}px, ${f.ty}px) scaleX(${dir}) rotate(${tilt}deg)`;
    }

    rafId = requestAnimationFrame(tick);
  }

  // Delegated click handler covers the original flying butterfly and all clones.
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.classList &&
        (t.classList.contains('shape-butterfly') || t.classList.contains('butterfly-clone'))) {
      spawnButterfly();
    }
  });
})();

// Reactive cursor: a pixel block that trails the mouse with easing and grows
// over clickable elements. Desktop only (skips touch + reduced-motion users).
(function initReactiveCursor() {
  const fine   = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let dx = mx, dy = my;   // dot — follows quickly
  let rx = mx, ry = my;   // ring — lags further behind

  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function loop() {
    dx += (mx - dx) * 0.28;
    dy += (my - dy) * 0.28;
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    dot.style.transform  = `translate(${dx}px, ${dy}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();

  // Grow the cursor over interactive things
  const hoverSel = 'a, button, input, textarea, .photos-grid img, .show-photo, ' +
                   '.upcoming-photos-grid img, .video-card, .release-card, ' +
                   '.release-cover-link, .shape-butterfly, .butterfly-clone';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest && e.target.closest(hoverSel)) {
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest && e.target.closest(hoverSel)) {
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
    }
  });
})();

// About section: interactive Perlin-noise displacement ("goo") that melts the
// content based on where the mouse is. Mouse X/Y drive the noise frequency,
// Y also drives how hard it gets mushed. Eases back to crisp when you leave.
(function initAboutGoo() {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const section   = document.getElementById('about');
  const container = section && section.querySelector('.container');
  const turb = document.getElementById('about-turb');
  const disp = document.getElementById('about-disp');
  if (!section || !container || !turb || !disp) return;

  let active = false, raf = null;
  let curScale = 0, tgtScale = 0;
  let curFx = 0.01, tgtFx = 0.01;
  let curFy = 0.01, tgtFy = 0.01;

  function onMove(e) {
    const r = section.getBoundingClientRect();
    const mx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const my = Math.min(1, Math.max(0, (e.clientY - r.top)  / r.height));
    tgtFx = 0.006 + mx * 0.05;   // horizontal position → noise frequency X
    tgtFy = 0.006 + my * 0.05;   // vertical position   → noise frequency Y
    tgtScale = 35 + my * 90;     // lower in the section = more brutal mush
  }
  function loop() {
    curScale += (tgtScale - curScale) * 0.12;
    curFx    += (tgtFx    - curFx)    * 0.12;
    curFy    += (tgtFy    - curFy)    * 0.12;
    disp.setAttribute('scale', curScale.toFixed(2));
    turb.setAttribute('baseFrequency', curFx.toFixed(4) + ' ' + curFy.toFixed(4));
    if (active || curScale > 0.4) {
      raf = requestAnimationFrame(loop);
    } else {
      curScale = 0;
      disp.setAttribute('scale', '0');
      container.classList.remove('distorting');
      raf = null;
    }
  }
  section.addEventListener('mouseenter', () => {
    active = true;
    container.classList.add('distorting');
    if (!raf) raf = requestAnimationFrame(loop);
  });
  section.addEventListener('mousemove', onMove, { passive: true });
  section.addEventListener('mouseleave', () => {
    active = false;
    tgtScale = 0;
    if (!raf) raf = requestAnimationFrame(loop);
  });
})();

// Per-section grain dampening: ease the global grain down while the Releases
// section is centred in view (0.8 everywhere else, 0.2 over Releases).
(function initReleasesGrain() {
  const grain    = document.getElementById('grain');
  const releases = document.getElementById('releases');
  if (!grain || !releases) return;
  const STRONG = '0.8';   // matches the default #grain opacity
  const SOFT   = '0.2';
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { grain.style.opacity = e.isIntersecting ? SOFT : STRONG; });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  obs.observe(releases);
})();

// Scroll progress bar: a thin glitch-coloured bar that fills as you scroll.
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (window.scrollY || h.scrollTop) / max : 0;
    bar.style.width = (pct * 100) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Lo-fi 3D cubes: clicking one cycles the whole page's colour palette.
(function initPaletteCubes() {
  const root = document.documentElement;
  const palettes = [
    { body:'#f40006', sectionBg:'#8252fe', sectionText:'#f5f500', accent:'#07fae8', navBg:'#8252fe', navText:'#f5f500' },
    { body:'#0a0aff', sectionBg:'#f5f500', sectionText:'#000000', accent:'#ff2600', navBg:'#000000', navText:'#f5f500' },
    { body:'#00f0ff', sectionBg:'#ff2600', sectionText:'#ffffff', accent:'#0a0aff', navBg:'#000000', navText:'#00f0ff' },
    { body:'#000000', sectionBg:'#f5f500', sectionText:'#000000', accent:'#ff2600', navBg:'#f5f500', navText:'#000000' },
    { body:'#f5f500', sectionBg:'#000000', sectionText:'#f5f500', accent:'#00f0ff', navBg:'#000000', navText:'#f5f500' },
    { body:'#ff2600', sectionBg:'#00f0ff', sectionText:'#000000', accent:'#8252fe', navBg:'#000000', navText:'#00f0ff' },
  ];
  const SECTIONS = ['about', 'releases', 'photos', 'videos'];
  let idx = 0;

  // ── Contrast guard: guarantees text stays legible on its background ──
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function relLum(hex) {
    const a = hexToRgb(hex).map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(fg, bg) {
    const L1 = relLum(fg), L2 = relLum(bg);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }
  // Keep the styled colour when it reads well enough; otherwise swap to the
  // black/white that contrasts best with the background.
  function readable(fg, bg, min) {
    if (contrast(fg, bg) >= (min || 3)) return fg;
    return relLum(bg) > 0.4 ? '#000000' : '#ffffff';
  }

  function applyPalette(p) {
    const bodyText = readable(p.sectionText, p.body);
    const secText  = readable(p.sectionText, p.sectionBg);
    const navText  = readable(p.navText, p.navBg);
    root.style.setProperty('--bg', p.body);
    root.style.setProperty('--bg-alt', p.body);
    root.style.setProperty('--bg-card', p.body);
    root.style.setProperty('--text', bodyText);
    root.style.setProperty('--accent', p.accent);
    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.background = p.sectionBg; el.style.color = secText; }
    });
    const live = document.getElementById('live');
    if (live) { live.style.background = p.body; live.style.color = bodyText; }
    const nav = document.getElementById('nav');
    if (nav) { nav.style.background = p.navBg; nav.style.color = navText; }
    const navName = document.getElementById('nav-name');
    if (navName) navName.style.color = navText;
    document.querySelectorAll('.nav-links li a').forEach(a => a.style.color = navText);
    const strip = document.querySelector('.hero-shows-strip');
    if (strip) { strip.style.background = p.navBg; strip.style.color = navText; }
    const bar = document.querySelector('.marquee-bar');
    if (bar) bar.style.background = p.navBg;
    document.querySelectorAll('.marquee-track span').forEach(s => s.style.color = navText);
  }

  // ── Page "collapse into pieces" toggle (driven by the cyan cube) ──
  let collapsed = false;
  function collapseTargets() {
    const skip = new Set(['blobs', 'checker-bg', 'grain', 'scroll-progress', 'lightbox']);
    return Array.from(document.body.children).filter(el => {
      const t = el.tagName;
      if (t === 'SCRIPT' || t === 'STYLE' || t === 'svg' || t === 'SVG') return false;
      if (el.classList.contains('flying-shapes')) return false;   // keep the cubes
      if (el.id && skip.has(el.id)) return false;                 // keep ambient layers
      return true;
    });
  }

  // Cubes glide (top/left/opacity) independently of their spin (transform).
  const cubes = Array.from(document.querySelectorAll('.lofi-obj'));
  cubes.forEach(c => {
    c.dataset.top  = c.style.top;
    c.dataset.left = c.style.left;
    c.style.transition = 'top .8s cubic-bezier(.5,0,.2,1), left .8s cubic-bezier(.5,0,.2,1), margin .8s ease, opacity .5s ease';
  });

  function toggleCollapse() {
    collapsed = !collapsed;

    // 1) Scatter (or restore) the page content blocks
    const targets = collapseTargets();
    const n = targets.length;
    targets.forEach((el, i) => {
      el.style.transition = 'transform .8s cubic-bezier(.55,-0.25,.6,1), opacity .8s ease';
      el.style.transitionDelay = (collapsed ? i * 0.05 : (n - 1 - i) * 0.045) + 's';
      if (collapsed) {
        const dir = (i % 2 === 0) ? 1 : -1;
        const tx  = (Math.random() * 50 - 25);
        const rot = (20 + Math.random() * 55) * dir;
        el.style.transform = `translate(${tx}vw, 125vh) rotate(${rot}deg) scale(.55)`;
        el.style.opacity = '0';
      } else {
        el.style.transform = '';
        el.style.opacity = '';
      }
    });

    // 2) The cyan cube glides to screen centre; the others fade out
    cubes.forEach(c => {
      const isHero = c.classList.contains('js-collapse');
      if (collapsed) {
        if (isHero) {
          c.style.top = '50%';
          c.style.left = '50%';
          c.style.margin = 'calc(var(--s) / -2) 0 0 calc(var(--s) / -2)';
          c.style.zIndex = '500';
        } else {
          c.style.opacity = '0';
          c.style.pointerEvents = 'none';
        }
      } else {
        if (isHero) {
          c.style.top = c.dataset.top;
          c.style.left = c.dataset.left;
          c.style.margin = '';
          c.style.zIndex = '';
        } else {
          c.style.opacity = '';
          c.style.pointerEvents = '';
        }
      }
    });
  }

  document.querySelectorAll('.lofi-obj').forEach(obj => {
    obj.addEventListener('click', (e) => {
      e.stopPropagation();
      obj.classList.add('pop');
      setTimeout(() => obj.classList.remove('pop'), 460);
      if (obj.classList.contains('js-collapse')) {
        toggleCollapse();                          // cyan cube: collapse / rebuild
      } else {
        idx = (idx + 1) % palettes.length;         // other cubes: cycle palette
        applyPalette(palettes[idx]);
      }
    });
  });
})();
