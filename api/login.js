const { checkCredentials, createToken, sessionCookie } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const username = (body && body.username) || '';
  const password = (body && body.password) || '';

  if (!username || !password) {
    return res.status(400).json({ error: 'Enter both username and password.' });
  }

  let ok;
  try {
    ok = checkCredentials(username, password);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server is not configured yet. Check the environment variables.' });
  }

  // Small fixed delay so rapid guessing is a bit less comfortable.
  await new Promise((r) => setTimeout(r, 400));

  if (!ok) {
    return res.status(401).json({ error: 'Wrong username or password.' });
  }

  try {
    res.setHeader('Set-Cookie', sessionCookie(createToken(username)));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server is not configured yet. Check the environment variables.' });
  }

  return res.status(200).json({ ok: true, redirect: '/dashboard' });
};
