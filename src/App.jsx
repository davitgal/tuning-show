import { useEffect, useMemo, useState } from 'react';
import {
  dict,
  countdownLabels,
  statVals,
  statLabels,
  nominations,
  schedule,
  visitorHear,
  visitorInterest,
  visitorVisited,
  // partners, // Правка 2: секция партнёров временно скрыта
  socials,
  faqList,
  EVENT_TIME,
} from './content';
import fireGradientBg from './assets/images/fire-gradient-bg.jpg';
import frameBadgeYellow from './assets/images/frame-badge-yellow.png';
import carCutout from './assets/images/car-cutout.png';

const pad = (n) => String(n).padStart(2, '0');

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useViewport() {
  const [vw, setVw] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return vw;
}

export default function App() {
  const [lang, setLang] = useState('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const [tab, setTab] = useState('participant');
  const [sent, setSent] = useState(false);

  const now = useNow();
  const vw = useViewport();
  const isMobile = vw < 1100;
  const isDesktop = vw >= 1100;
  const t = dict[lang];

  const diff = Math.max(0, EVENT_TIME - now);
  const s = Math.floor(diff / 1000);
  const cl = countdownLabels[lang];
  const countdown = [
    { value: pad(Math.floor(s / 86400)), label: cl[0] },
    { value: pad(Math.floor((s % 86400) / 3600)), label: cl[1] },
    { value: pad(Math.floor((s % 3600) / 60)), label: cl[2] },
    { value: pad(s % 60), label: cl[3] },
  ];

  const navItems = t.nav.map((label, i) => ({
    label,
    href: ['#about', '#nominations', '#program', '#partners', '#faq'][i],
  }));
  const stats = statVals.map((value, i) => ({ value, label: statLabels[lang][i] }));
  const noms = nominations.map((n, i) => ({ num: pad(i + 1), title: n[lang] }));
  const scheduleItems = schedule.map((item) => ({
    time: item.time,
    title: item[lang].title,
    desc: item[lang].desc,
  }));
  const faqs = faqList[lang];

  const marqueeItems = useMemo(() => {
    const base = [
      'TUNING SHOW',
      t.heroDate.toUpperCase(),
      'GARAGE MALL, YEREVAN',
      lang === 'en' ? '11 NOMINATIONS' : lang === 'ru' ? '11 НОМИНАЦИЙ' : '11 ԱՆՎԱՆԱԿԱՐԳԵՐ',
    ];
    return Array(4).fill(base).flat();
  }, [lang, t.heroDate]);

  function submitForm(e) {
    e.preventDefault();
    setSent(true);
  }

  function switchTab(next) {
    setTab(next);
    setSent(false);
  }

  return (
    <div className="page">
      <Header
        t={t}
        lang={lang}
        setLang={setLang}
        isDesktop={isDesktop}
        isMobile={isMobile}
        navItems={navItems}
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
      />

      {menuOpen && isMobile && (
        <MobileMenu t={t} navItems={navItems} onClose={() => setMenuOpen(false)} />
      )}

      <Hero t={t} bgImage={fireGradientBg} carImage={carCutout} />

      <Marquee items={marqueeItems} />

      <About t={t} stats={stats} />

      <Countdown t={t} bgImage={fireGradientBg} countdown={countdown} />

      <Nominations t={t} noms={noms} badgeImage={frameBadgeYellow} />

      <Program t={t} scheduleItems={scheduleItems} />

      <Apply
        t={t}
        lang={lang}
        tab={tab}
        sent={sent}
        switchTab={switchTab}
        submitForm={submitForm}
        noms={noms}
      />

      <BecomePartner t={t} switchTab={switchTab} />

      {/* Правка 2: витрина логотипов партнёров скрыта временно — вернём, когда появятся логотипы */}
      {/* <Partners t={t} partners={partners} /> */}

      <Location t={t} />

      <FAQ t={t} faqs={faqs} faqOpen={faqOpen} setFaqOpen={setFaqOpen} />

      <Terms t={t} />

      <Footer t={t} socials={socials} />

      {isMobile && <StickyMobileCTA t={t} />}
    </div>
  );
}

function Header({ t, lang, setLang, isDesktop, isMobile, navItems, menuOpen, toggleMenu }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#top" className="logo">
          <span className="logo-text">
            TUNING<span className="logo-accent">SHOW</span>
          </span>
          <span className="logo-sub">Garage Mall · Yerevan</span>
        </a>

        {isDesktop && (
          <nav className="nav">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <div className="header-actions">
          <div className="lang-switch">
            {['am', 'en', 'ru'].map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={'lang-btn' + (lang === code ? ' lang-btn--active' : '')}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          {isDesktop && (
            <a href="#apply" className="btn btn--primary">
              {t.cta1}
            </a>
          )}
          {isMobile && (
            <button onClick={toggleMenu} aria-label="Menu" className="menu-toggle">
              <span className="menu-bar" />
              <span className="menu-bar" />
              <span className="menu-bar menu-bar--accent" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ t, navItems, onClose }) {
  return (
    <div className="mobile-menu">
      <div className="mobile-menu-top">
        <button onClick={onClose} aria-label="Close" className="mobile-menu-close">
          ✕
        </button>
      </div>
      <nav className="mobile-nav">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={onClose} className="mobile-nav-link">
            {item.label}
          </a>
        ))}
      </nav>
      <a href="#apply" onClick={onClose} className="mobile-menu-cta">
        {t.cta1}
      </a>
    </div>
  );
}

function Hero({ t, bgImage, carImage }) {
  return (
    <section id="top" className="hero" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="pulse-dot" />
            <span>{t.heroKicker}</span>
          </div>

          <h1 className="hero-title">
            <span>TUNING</span>
            <span>SHOW</span>
          </h1>

          <div className="hero-date-row">
            <div className="hero-date">{t.heroDate}</div>
            <div className="hero-diamond" />
            <div className="hero-location">Garage Mall · Yerevan</div>
          </div>

          <p className="hero-sub">{t.heroSub}</p>

          <div className="hero-ctas">
            <a href="#apply" className="btn btn--dark">
              {t.cta1}
            </a>
            <a href="#partners" className="btn btn--outline-dark">
              <span className="btn-skew">{t.cta2}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="hero-car">
        <img src={carImage} alt="" />
      </div>
    </section>
  );
}

function Marquee({ items }) {
  return (
    <div className="marquee">
      <div className="marquee-track">
        {items.map((text, i) => (
          <span key={i} className="marquee-item">
            {text}
            <span className="marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

function About({ t, stats }) {
  return (
    <section id="about" className="section about">
      <div className="about-grid">
        <div>
          <div className="eyebrow">01 — {t.secAbout}</div>
          <h2 className="section-title">{t.aboutHead}</h2>
          <p className="section-text">{t.aboutText}</p>
        </div>
        <div className="stats-grid">
          {stats.map((st, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-bar" />
              <div className="stat-value">{st.value}</div>
              <div className="stat-label">{st.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Countdown({ t, bgImage, countdown }) {
  return (
    <section className="countdown" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="countdown-inner">
        <div className="eyebrow eyebrow--dark">{t.secCount}</div>
        <div className="countdown-units">
          {countdown.map((u, i) => (
            <div key={i} className="countdown-unit">
              <div className="countdown-value">{u.value}</div>
              <div className="countdown-label">{u.label}</div>
            </div>
          ))}
        </div>
        <a href="#apply" className="btn btn--dark">
          {t.cta1}
        </a>
      </div>
    </section>
  );
}

function Nominations({ t, noms, badgeImage }) {
  return (
    <section id="nominations" className="section">
      <div className="section-head">
        <div className="section-head-left">
          <img src={badgeImage} alt="" className="badge-icon" />
          <div>
            <div className="eyebrow">02 — {t.secNoms}</div>
            <h2 className="section-title">{t.nomsHead}</h2>
          </div>
        </div>
        <div className="section-head-note">{t.nomsSub}</div>
      </div>
      <div className="noms-grid">
        {noms.map((n) => (
          <div key={n.num} className="nom-card">
            <div className="nom-num">{n.num}</div>
            <div className="nom-title">{n.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Program({ t, scheduleItems }) {
  return (
    <section id="program" className="section section--panel">
      <div className="section-inner">
        <div className="eyebrow">03 — {t.secProgram}</div>
        <h2 className="section-title">{t.programHead}</h2>
        <div className="schedule-list">
          {scheduleItems.map((s, i) => (
            <div key={i} className="schedule-row">
              <div className="schedule-time">{s.time}</div>
              <div>
                <div className="schedule-title">{s.title}</div>
                <div className="schedule-desc">{s.desc}</div>
              </div>
            </div>
          ))}
          <div className="schedule-rule" />
        </div>
        <div className="schedule-note">// {t.scheduleNote}</div>
      </div>
    </section>
  );
}

function Apply({ t, lang, tab, sent, switchTab, submitForm, noms }) {
  return (
    <section id="apply" className="section section--narrow">
      <div className="eyebrow eyebrow--center">04 — {t.secApply}</div>
      <h2 className="section-title section-title--center">{t.applyHead}</h2>

      <div className="tabs">
        <button
          onClick={() => switchTab('participant')}
          className={'tab-btn' + (tab === 'participant' ? ' tab-btn--active' : '')}
        >
          {t.tabParticipant}
        </button>
        <button
          onClick={() => switchTab('visitor')}
          className={'tab-btn' + (tab === 'visitor' ? ' tab-btn--active' : '')}
        >
          {t.tabVisitor}
        </button>
        <button
          onClick={() => switchTab('partner')}
          className={'tab-btn' + (tab === 'partner' ? ' tab-btn--active' : '')}
        >
          {t.tabPartner}
        </button>
      </div>

      {tab === 'participant' && (
        <div className="notice">
          <div className="notice-icon">!</div>
          <div>
            <div className="notice-head">{t.noticeHead}</div>
            <div className="notice-body">{t.noticeBody}</div>
          </div>
        </div>
      )}

      {tab === 'visitor' && (
        <div className="notice notice--soft">
          <div className="notice-icon">i</div>
          <div>
            <div className="notice-body">{t.visitorIntro}</div>
          </div>
        </div>
      )}

      {sent && (
        <div className="thanks">
          <div className="thanks-title">{tab === 'partner' ? t.thanksPartner : t.thanks}</div>
          <div className="thanks-sub">{tab === 'partner' ? t.thanksPartnerSub : t.thanksSub}</div>
        </div>
      )}

      {!sent && tab === 'participant' && (
        <form className="form-grid" onSubmit={submitForm}>
          <Field label={t.fName} required>
            <input type="text" placeholder="—" required />
          </Field>
          <Field label={t.fPhone} required>
            <input type="tel" placeholder="—" required />
          </Field>
          <Field label={t.fAge} required>
            <input type="number" min="16" max="100" placeholder="25" required />
          </Field>
          <Field label={t.fEmail} suffix={`(${t.optional})`}>
            <input type="email" placeholder="—" />
          </Field>
          <Field label={t.fMake} required>
            <input type="text" placeholder="—" required />
          </Field>
          <Field label={t.fModel} required>
            <input type="text" placeholder="—" required />
          </Field>
          <Field label={t.fYear} required>
            <input type="number" min="1950" max="2026" placeholder="2015" required />
          </Field>
          <Field label={t.fPlate} required>
            <input type="text" placeholder="—" required />
          </Field>
          <Field label={t.fNom} required full>
            <select required defaultValue="">
              <option value="" disabled>
                —
              </option>
              {noms.map((n) => (
                <option key={n.num} value={n.title}>
                  {n.title}
                </option>
              ))}
            </select>
          </Field>
          <label className="field field--full">
            <span className="field-label">
              {t.fUpload} <span className="required-mark">*</span>
            </span>
            <div className="upload-box">
              <div className="upload-arrow">↑</div>
              <div className="upload-cta">{t.fUploadCta}</div>
              <div className="upload-hint">{t.fUploadHint}</div>
              <input type="file" accept="image/*" multiple className="upload-input" required />
            </div>
          </label>
          <label className="consent field--full">
            <input type="checkbox" required />
            <span>
              {t.fTerms}{' '}
              <a href="#terms" className="consent-link">
                {t.fTermsLink}
              </a>
            </span>
          </label>
          <button type="submit" className="btn btn--gradient form-submit">
            {t.fSubmit}
          </button>
        </form>
      )}

      {!sent && tab === 'visitor' && (
        <form className="form-grid" onSubmit={submitForm}>
          <Field label={t.fName} required>
            <input type="text" placeholder="—" required />
          </Field>
          <Field label={t.fPhone} required>
            <input type="tel" placeholder="—" required />
          </Field>
          <Field label={t.fCity} required>
            <input type="text" placeholder="—" required />
          </Field>
          <Field label={t.fParty} required>
            <input type="number" min="1" max="20" placeholder="2" required />
          </Field>
          <Field label={t.fEmail} suffix={`(${t.optional})`}>
            <input type="email" placeholder="—" />
          </Field>
          <Field label={t.fOccupation} suffix={`(${t.optional})`}>
            <input type="text" placeholder="—" />
          </Field>
          <Field label={t.fHear} required full>
            <select required defaultValue="">
              <option value="" disabled>
                —
              </option>
              {visitorHear[lang].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.fVisited} required full>
            <select required defaultValue="">
              <option value="" disabled>
                —
              </option>
              {visitorVisited[lang].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <div className="field field--full">
            <span className="field-label">{t.fInterest}</span>
            <div className="checkbox-grid">
              {visitorInterest[lang].map((o) => (
                <label key={o} className="check-item">
                  <input type="checkbox" name="interest" value={o} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="consent field--full">
            <input type="checkbox" required />
            <span>{t.fConsent}</span>
          </label>
          <button type="submit" className="btn btn--gradient form-submit">
            {t.fSubmit}
          </button>
        </form>
      )}

      {!sent && tab === 'partner' && (
        <form className="form-grid" onSubmit={submitForm}>
          <Field label={t.fCompany} required>
            <input type="text" placeholder="—" required />
          </Field>
          <Field label={t.fContact} required>
            <input type="text" placeholder="—" required />
          </Field>
          <Field label={t.fPosition} suffix={`(${t.optional})`}>
            <input type="text" placeholder="—" />
          </Field>
          <Field label={t.fPhone} required>
            <input type="tel" placeholder="—" required />
          </Field>
          <Field label={t.fEmail} required>
            <input type="email" placeholder="—" required />
          </Field>
          <Field label={t.fWebsite} suffix={`(${t.optional})`}>
            <input type="text" placeholder="—" />
          </Field>
          <Field label={t.fPartnerIdea} suffix={`(${t.optional})`} full>
            <textarea rows="3" placeholder="—" />
          </Field>
          <label className="field field--full">
            <span className="field-label">
              {t.fPartnerDeck} <span className="field-suffix">({t.optional})</span>
            </span>
            <div className="upload-box">
              <div className="upload-arrow">↑</div>
              <div className="upload-cta">{t.fUploadCta}</div>
              <div className="upload-hint">{t.fPartnerDeckHint}</div>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx"
                className="upload-input"
              />
            </div>
          </label>
          <button type="submit" className="btn btn--gradient form-submit">
            {t.fSubmitPartner}
          </button>
        </form>
      )}
    </section>
  );
}

function Field({ label, required, suffix, full, children }) {
  return (
    <label className={'field' + (full ? ' field--full' : '')}>
      <span className="field-label">
        {label} {required && <span className="required-mark">*</span>}
        {suffix && <span className="field-suffix"> {suffix}</span>}
      </span>
      {children}
    </label>
  );
}

function Partners({ t, partners }) {
  return (
    <section id="partners" className="section section--panel">
      <div className="section-inner">
        <div className="eyebrow">05 — {t.secPartners}</div>
        <h2 className="section-title">{t.partnersHead}</h2>

        <div className="title-sponsor">
          <div>
            <div className="title-sponsor-label">{t.titleSponsor}</div>
            <div className="title-sponsor-placeholder">{t.titleSponsorPlaceholder}</div>
          </div>
        </div>

        <div className="partners-grid">
          {partners.map((p, i) => (
            <div key={i} className="partner-card">
              <span>{p.name}</span>
            </div>
          ))}
        </div>

        <a href="#apply" className="btn btn--outline-accent">
          {t.partnerCta}
        </a>
      </div>
    </section>
  );
}

function BecomePartner({ t, switchTab }) {
  return (
    <section id="partners" className="section section--panel">
      <div className="section-inner">
        <div className="eyebrow">05 — {t.secPartners}</div>
        <h2 className="section-title">{t.partnerLeadHead}</h2>
        <p className="section-text partner-lead-sub">{t.partnerLeadSub}</p>

        <div className="partner-why-head">{t.partnerWhyHead}</div>
        <div className="partner-why-grid">
          {t.partnerWhy.map((b, i) => (
            <div key={i} className="partner-why-card">
              <div className="partner-why-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="partner-why-text">{b}</div>
            </div>
          ))}
        </div>

        <div className="partner-how">
          <div className="partner-how-head">{t.partnerHowHead}</div>
          <p className="section-text">{t.partnerHowText}</p>
        </div>

        <a href="#apply" onClick={() => switchTab('partner')} className="btn btn--outline-accent">
          {t.partnerCta}
        </a>
      </div>
    </section>
  );
}

function Terms({ t }) {
  return (
    <section id="terms" className="section section--narrow">
      <div className="eyebrow">08 — {t.secTerms}</div>
      <h2 className="section-title">{t.termsHead}</h2>
      <div className="terms-intro">{t.termsIntro}</div>
      <ul className="terms-list">
        {t.termsList.map((item, i) => (
          <li key={i} className="terms-item">
            <span className="terms-arrow">→</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Location({ t }) {
  return (
    <section id="location" className="section">
      <div className="eyebrow">06 — {t.secLocation}</div>
      <div className="location-grid">
        <div>
          <h2 className="section-title">Garage Mall</h2>
          <div className="location-list">
            <div className="location-item">
              <span className="location-arrow">→</span>
              <span>{t.locAddress}</span>
            </div>
            <div className="location-item">
              <span className="location-arrow">→</span>
              <span>{t.locParking}</span>
            </div>
            <div className="location-item">
              <span className="location-arrow">→</span>
              <span>{t.locHours}</span>
            </div>
            <div className="location-item">
              <span className="location-arrow">→</span>
              <span>{t.locFree}</span>
            </div>
          </div>
          <a
            href="https://yandex.com/maps/-/CTRL5YyM"
            target="_blank"
            rel="noreferrer"
            className="btn btn--outline-accent"
          >
            {t.locDirections}
          </a>
        </div>
        <div className="map-embed">
          <iframe
            title="Garage Mall map"
            src="https://maps.google.com/maps?q=40.209819,44.463787&z=16&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

function FAQ({ t, faqs, faqOpen, setFaqOpen }) {
  return (
    <section id="faq" className="section section--panel">
      <div className="section-inner section-inner--narrow">
        <div className="eyebrow">07 — {t.secFaq}</div>
        <h2 className="section-title">{t.faqHead}</h2>
        <div className="faq-list">
          {faqs.map((f, i) => {
            const open = faqOpen === i;
            return (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setFaqOpen(open ? -1 : i)}
                  className="faq-question"
                >
                  <span>{f.q}</span>
                  <span className="faq-sign">{open ? '–' : '+'}</span>
                </button>
                {open && <div className="faq-answer">{f.a}</div>}
              </div>
            );
          })}
          <div className="faq-rule" />
        </div>
      </div>
    </section>
  );
}

function Footer({ t, socials }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              TUNING<span className="logo-accent">SHOW</span>
            </div>
            <p className="footer-tag">{t.footTag}</p>
          </div>
          <div>
            <div className="footer-heading">{t.footContact}</div>
            <div className="footer-contact">
              <a href="mailto:hello@tuningshow.am">hello@tuningshow.am</a>
              <a href="tel:+37400000000">+374 00 000 000</a>
            </div>
          </div>
          <div>
            <div className="footer-heading">{t.footFollow}</div>
            <div className="footer-socials">
              {socials.map((so) => (
                <a key={so} href="#" className="social-btn">
                  {so}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Tuning Show · Garage Mall, Yerevan</span>
          <a href="#">{t.footPrivacy}</a>
        </div>
      </div>
    </footer>
  );
}

function StickyMobileCTA({ t }) {
  return (
    <div className="sticky-cta">
      <a href="#nominations" className="btn btn--outline-accent sticky-cta-btn">
        {t.secNoms}
      </a>
      <a href="#apply" className="btn btn--gradient sticky-cta-btn sticky-cta-btn--primary">
        {t.cta1}
      </a>
    </div>
  );
}
