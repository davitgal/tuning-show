import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseReady, BUCKETS } from './supabase';

const SECTIONS = [
  {
    key: 'participant',
    label: 'Participants',
    table: 'participant_requests',
    bucket: BUCKETS.participantPhotos,
    columns: [
      { k: 'full_name', h: 'Name' },
      { k: 'phone', h: 'Phone' },
      { k: 'vehicle_make', h: 'Make' },
      { k: 'vehicle_model', h: 'Model' },
      { k: 'nomination', h: 'Nomination' },
    ],
    fileField: 'photos',
    fileLabel: 'Photos',
  },
  {
    key: 'visitor',
    label: 'Visitors',
    table: 'visitor_requests',
    columns: [
      { k: 'full_name', h: 'Name' },
      { k: 'phone', h: 'Phone' },
      { k: 'city', h: 'City' },
      { k: 'party_size', h: 'Party' },
      { k: 'heard_about', h: 'Source' },
    ],
  },
  {
    key: 'partner',
    label: 'Partners',
    table: 'partner_requests',
    bucket: BUCKETS.partnerDecks,
    columns: [
      { k: 'company', h: 'Company' },
      { k: 'contact_person', h: 'Contact' },
      { k: 'phone', h: 'Phone' },
      { k: 'email', h: 'Email' },
    ],
    fileField: 'deck',
    fileLabel: 'Deck',
  },
];

const STATUSES = ['new', 'handled', 'rejected'];

export default function Admin() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabaseReady) {
      setReady(true);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabaseReady) return <AdminShell><NotConfigured /></AdminShell>;
  if (!ready) return <AdminShell><div className="admin-muted">Loading…</div></AdminShell>;
  if (!session) return <AdminShell><AdminLogin /></AdminShell>;
  return <Dashboard email={session.user?.email} />;
}

function AdminShell({ children }) {
  return (
    <div className="admin">
      <div className="admin-center">
        <div className="admin-brand">
          TUNING<span className="admin-brand-accent">SHOW</span> · ADMIN
        </div>
        {children}
      </div>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="admin-card">
      <p className="admin-muted">
        Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_ANON_KEY</code>, then rebuild.
      </p>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setBusy(false);
  }

  return (
    <form className="admin-card admin-login" onSubmit={submit}>
      <label className="admin-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      </label>
      <label className="admin-field">
        <span>Password</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {error && <div className="admin-error">{error}</div>}
      <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

function Dashboard({ email }) {
  const [active, setActive] = useState(SECTIONS[0].key);
  const section = useMemo(() => SECTIONS.find((s) => s.key === active), [active]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from(section.table)
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    setRows(data || []);
    setLoading(false);
  }, [section.table]);

  useEffect(() => {
    load();
    setOpenId(null);
  }, [load]);

  async function setStatus(row, status) {
    const { error: err } = await supabase.from(section.table).update({ status }).eq('id', row.id);
    if (!err) setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status } : r)));
  }

  const counts = rows.filter((r) => r.status === 'new').length;

  return (
    <div className="admin">
      <header className="admin-top">
        <div className="admin-brand">
          TUNING<span className="admin-brand-accent">SHOW</span> · ADMIN
        </div>
        <div className="admin-top-right">
          <span className="admin-muted admin-email">{email}</span>
          <button className="admin-btn" onClick={() => supabase.auth.signOut()}>
            Log out
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={'admin-tab' + (s.key === active ? ' admin-tab--active' : '')}
            onClick={() => setActive(s.key)}
          >
            {s.label}
          </button>
        ))}
        <button className="admin-btn admin-refresh" onClick={load} disabled={loading}>
          {loading ? '…' : '↻ Refresh'}
        </button>
      </nav>

      <div className="admin-meta">
        {loading ? 'Loading…' : `${rows.length} total · ${counts} new`}
        {error && <span className="admin-error"> — {error}</span>}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              {section.columns.map((c) => (
                <th key={c.k}>{c.h}</th>
              ))}
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td className="admin-muted" colSpan={section.columns.length + 3}>
                  No requests yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <Row
                key={row.id}
                row={row}
                section={section}
                open={openId === row.id}
                onToggle={() => setOpenId(openId === row.id ? null : row.id)}
                onStatus={setStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ row, section, open, onToggle, onStatus }) {
  return (
    <>
      <tr className={'admin-row' + (row.status !== 'new' ? ' admin-row--done' : '')}>
        <td className="admin-nowrap">{fmtDate(row.created_at)}</td>
        {section.columns.map((c) => (
          <td key={c.k}>{fmtCell(row[c.k])}</td>
        ))}
        <td>
          <select
            className={'admin-status admin-status--' + row.status}
            value={row.status}
            onChange={(e) => onStatus(row, e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>
        <td>
          <button className="admin-link" onClick={onToggle}>
            {open ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="admin-detail-row">
          <td colSpan={section.columns.length + 3}>
            <Detail row={row} section={section} />
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ row, section }) {
  const hidden = new Set(['id', 'created_at', 'status', section.fileField]);
  const entries = Object.entries(row).filter(([k, v]) => !hidden.has(k) && v != null && v !== '');
  return (
    <div className="admin-detail">
      <dl className="admin-dl">
        {entries.map(([k, v]) => (
          <div key={k} className="admin-dl-row">
            <dt>{k.replace(/_/g, ' ')}</dt>
            <dd>{Array.isArray(v) ? v.join(', ') : String(v)}</dd>
          </div>
        ))}
      </dl>
      {section.fileField && <Files section={section} value={row[section.fileField]} />}
    </div>
  );
}

function Files({ section, value }) {
  const paths = Array.isArray(value) ? value : value ? [value] : [];
  const [urls, setUrls] = useState(null);

  async function reveal() {
    const out = [];
    for (const p of paths) {
      const { data } = await supabase.storage.from(section.bucket).createSignedUrl(p, 3600);
      out.push({ path: p, url: data?.signedUrl });
    }
    setUrls(out);
  }

  if (paths.length === 0) return <div className="admin-muted admin-files-empty">No {section.fileLabel.toLowerCase()}.</div>;

  return (
    <div className="admin-files">
      <div className="admin-files-head">{section.fileLabel}</div>
      {!urls ? (
        <button className="admin-btn admin-btn--sm" onClick={reveal}>
          Get links ({paths.length})
        </button>
      ) : (
        <ul className="admin-files-list">
          {urls.map((f, i) => (
            <li key={f.path}>
              <a href={f.url} target="_blank" rel="noreferrer" className="admin-link">
                {section.fileLabel} {i + 1}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtCell(v) {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ') || '—';
  return String(v);
}
