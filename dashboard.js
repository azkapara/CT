const { isLoggedIn } = require('./_auth');
const page = require('./_page');

const LOGOUT_BUTTON = `
<a href="/api/logout"
   style="position:fixed;right:18px;bottom:18px;z-index:9999;display:inline-flex;align-items:center;gap:8px;
          padding:9px 14px;border-radius:10px;background:#1E4076;color:#fff;font:600 13px/1 ui-sans-serif,system-ui,sans-serif;
          text-decoration:none;box-shadow:0 6px 18px rgba(15,32,64,.25)">
  Sign out
</a>
`;

module.exports = (req, res) => {
  if (!isLoggedIn(req)) {
    res.statusCode = 302;
    res.setHeader('Location', '/?next=dashboard');
    return res.end();
  }

  const html = page.html.includes('</body>')
    ? page.html.replace('</body>', `${LOGOUT_BUTTON}</body>`)
    : page.html + LOGOUT_BUTTON;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.status(200).send(html);
};
