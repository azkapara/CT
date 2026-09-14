const { clearedCookie } = require('./_auth');

module.exports = (req, res) => {
  res.setHeader('Set-Cookie', clearedCookie());
  res.statusCode = 302;
  res.setHeader('Location', '/?bye=1');
  res.end();
};
