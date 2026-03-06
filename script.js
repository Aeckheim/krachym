// Loads content.json and populates the page dynamically

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
    photoGrid.innerHTML = c.photos.map(p =>
      `<img src="${p.src}" alt="${p.alt}" loading="lazy" onclick="openLightbox(this.src)" />`
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

  // Shows
  function renderShows(shows, containerId) {
    const el = document.getElementById(containerId);
    if (!shows || shows.length === 0) {
      el.innerHTML = `<p class="no-shows">No shows listed.</p>`;
      return;
    }
    const sorted = containerId === 'shows-past'
      ? [...shows].sort((a, b) => (b.date || '') < (a.date || '') ? -1 : 1)
      : shows;
    el.innerHTML = sorted.map(s => `
      <div class="show-item">
        <div class="show-date">${formatDate(s.date)}</div>
        <div class="show-info">
          <div class="show-venue-row">
            <span class="show-venue-text">${s.venue}${s.note ? ' <span class="show-note">' + s.note + '</span>' : ''}</span>
            ${(s.photos || []).map((p, pi) => `<div class="show-photo" onclick="openLightbox('${p.full || p.thumb}')"><img src="${p.thumb}" alt="${s.venue} ${pi+1}" loading="lazy"></div>`).join('')}
          </div>
          <div class="show-city">${s.city}${s.country ? ', ' + s.country : ''}</div>
        </div>
        <div class="show-tickets">
          ${s.tickets ? `<a href="${s.tickets}" target="_blank" rel="noopener">Tickets</a>` : ''}
        </div>
      </div>
    `).join('');
  }
  renderShows(c.shows.upcoming, 'shows-upcoming');
  renderShows(c.shows.past, 'shows-past');

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

  // On mobile: just reveal, no parallax movement
  if (isMobile) {
    layers.forEach(({ el }) => { if (el) el.classList.add('visible'); });
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

function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightbox-img').src = src;
  lb.style.display = 'flex';
  document.addEventListener('keydown', closeLightboxOnEsc);
}
function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
  document.removeEventListener('keydown', closeLightboxOnEsc);
}
function closeLightboxOnEsc(e) { if (e.key === 'Escape') closeLightbox(); }
