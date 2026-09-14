// Temporary diagnostic. Visit /api/health after deploying.
// Reports whether the env vars arrived — never their values.
// DELETE THIS FILE once login works.

module.exports = (req, res) => {
  const report = (name, min) => {
    const v = process.env[name];
    if (!v) return 'MISSING';
    const notes = [];
    if (v !== v.trim()) notes.push('HAS LEADING/TRAILING WHITESPACE');
    if (min && v.length < min) notes.push(`TOO SHORT (needs ${min}+ chars)`);
    return notes.length ? `set, but ${notes.join(' + ')}` : 'set, looks fine';
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    CT_USER: report('CT_USER'),
    CT_PASS: report('CT_PASS'),
    SESSION_SECRET: report('SESSION_SECRET', 16),
    deployedAt: new Date().toISOString(),
  });
};
