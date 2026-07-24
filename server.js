const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 8080;
const PUBLIC_DIR = __dirname;
const NEWS_FILE = path.join(__dirname, 'data', 'news.json');
const ADMIN_PASSWORD = 'Summit2026!';

// Helper: Content-Type lookup
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.php': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return types[ext] || 'application/octet-stream';
}

// Helper: Read News
function getNews() {
  try {
    if (!fs.existsSync(NEWS_FILE)) return [];
    return JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

// Helper: Save News
function saveNews(news) {
  fs.mkdirSync(path.dirname(NEWS_FILE), { recursive: true });
  fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  if (pathname === '/') pathname = '/index.html';

  // Handle Admin News POST (Adding Article or Login)
  if (pathname === '/admin-news.php' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const postData = querystring.parse(body);

      // Check Password Login
      if (postData.login_password !== undefined) {
        if (postData.login_password === ADMIN_PASSWORD) {
          res.writeHead(302, { 'Set-Cookie': 'summit_auth=1; Path=/', 'Location': '/admin-news.php' });
          return res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(renderAdminHTML(false, 'Invalid password. Please try again.'));
        }
      }

      // Add Article Action
      if (postData.action === 'add_article') {
        const title = (postData.title || '').trim();
        const date = (postData.date || '').trim();
        const category = (postData.category || 'Announcements').trim();
        const summary = (postData.summary || '').trim();

        if (title && date && summary) {
          const currentNews = getNews();
          currentNews.unshift({
            id: 'news-' + Date.now(),
            title: title,
            date: date,
            isoDate: new Date().toISOString().split('T')[0],
            category: category,
            summary: summary
          });
          saveNews(currentNews);
          res.writeHead(302, { 'Location': '/admin-news.php?msg=added' });
          return res.end();
        }
      }

      res.writeHead(302, { 'Location': '/admin-news.php' });
      res.end();
    });
    return;
  }

  // Handle Admin News GET (Render Admin Dashboard or Delete)
  if (pathname === '/admin-news.php') {
    const cookies = querystring.parse(req.headers.cookie, '; ');
    const isAuthenticated = cookies.summit_auth === '1' || parsedUrl.query.auth === '1';

    // Handle Logout
    if (parsedUrl.query.action === 'logout') {
      res.writeHead(302, { 'Set-Cookie': 'summit_auth=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT', 'Location': '/admin-news.php' });
      return res.end();
    }

    // Handle Delete
    if (isAuthenticated && parsedUrl.query.action === 'delete' && parsedUrl.query.id) {
      const deleteId = parsedUrl.query.id;
      let currentNews = getNews();
      currentNews = currentNews.filter(item => item.id !== deleteId);
      saveNews(currentNews);
      res.writeHead(302, { 'Location': '/admin-news.php?msg=deleted' });
      return res.end();
    }

    let msg = '';
    if (parsedUrl.query.msg === 'added') msg = 'Article published successfully!';
    if (parsedUrl.query.msg === 'deleted') msg = 'Article removed successfully.';

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderAdminHTML(isAuthenticated, '', msg));
  }

  // Serve Static Files
  const filePath = path.join(PUBLIC_DIR, pathname);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });
});

function renderAdminHTML(authenticated, error = '', message = '') {
  const newsList = authenticated ? getNews() : [];
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Admin Portal | Summit Technologies</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <style>
        body { background: #f8fafc; color: #0f172a; padding-bottom: 60px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .admin-container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
        .admin-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); margin-bottom: 32px; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
        .admin-header h1 { font-size: 24px; font-weight: 800; color: #0f172a; }
        .alert { padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
        .alert-success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .alert-error { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
        .news-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .news-table th, .news-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .news-table th { background: #f1f5f9; font-weight: 700; color: #475569; }
        .btn-delete { color: #dc2626; font-weight: 600; text-decoration: none; padding: 4px 8px; border-radius: 4px; background: #fee2e2; }
        .btn-delete:hover { background: #fca5a5; }
    </style>
</head>
<body>

<div class="admin-container">

    ${!authenticated ? `
        <!-- LOGIN FORM -->
        <div class="admin-card" style="max-width: 440px; margin: 80px auto;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 22px; font-weight: 800;">Summit News Admin</h1>
                <p style="font-size: 14px; color: #64748b; margin-top: 4px;">Enter password to manage news articles</p>
            </div>

            ${error ? `<div class="alert alert-error">${error}</div>` : ''}

            <form method="POST" action="admin-news.php">
                <div class="form-group">
                    <label for="login_password">Admin Password</label>
                    <input type="password" id="login_password" name="login_password" required placeholder="Enter password...">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 12px;">Log In</button>
            </form>
        </div>
    ` : `
        <!-- ADMIN DASHBOARD -->
        <div class="admin-header">
            <div>
                <h1>Manage Summit News</h1>
                <p style="font-size: 14px; color: #64748b;">Publish and manage news articles on the live site</p>
            </div>
            <div>
                <a href="admin-news.php?action=logout" class="btn btn-outline-dark" style="font-size: 13px; padding: 6px 14px;">Log Out</a>
                <a href="/#news" target="_blank" class="btn btn-primary" style="font-size: 13px; padding: 6px 14px;">View Live Site &rarr;</a>
            </div>
        </div>

        ${message ? `<div class="alert alert-success">${message}</div>` : ''}
        ${error ? `<div class="alert alert-error">${error}</div>` : ''}

        <!-- ADD ARTICLE FORM -->
        <div class="admin-card">
            <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 20px;">Publish New Article</h2>
            <form method="POST" action="admin-news.php">
                <input type="hidden" name="action" value="add_article">
                
                <div class="form-group">
                    <label for="title">Article Title *</label>
                    <input type="text" id="title" name="title" required placeholder="e.g. Summit Technologies Awarded DoD Support Contract">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label for="date">Display Date *</label>
                        <input type="text" id="date" name="date" required placeholder="e.g. July 2026">
                    </div>

                    <div class="form-group">
                        <label for="category">Category</label>
                        <select id="category" name="category">
                            <option value="Contract Awards">Contract Awards</option>
                            <option value="Certifications">Certifications</option>
                            <option value="Announcements">Announcements</option>
                            <option value="Community">Community &amp; Events</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="summary">Article Summary / Content *</label>
                    <textarea id="summary" name="summary" required placeholder="Write news summary or announcement text..."></textarea>
                </div>

                <button type="submit" class="btn btn-primary">Publish Article</button>
            </form>
        </div>

        <!-- EXISTING ARTICLES LIST -->
        <div class="admin-card">
            <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">Published Articles (${newsList.length})</h2>
            ${newsList.length === 0 ? `
                <p style="font-size: 14px; color: #64748b;">No articles found.</p>
            ` : `
                <table class="news-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Title</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${newsList.map(item => `
                            <tr>
                                <td><strong>${item.date}</strong></td>
                                <td><span style="font-size: 11px; padding: 2px 8px; background: #dbeafe; color: #2563eb; font-weight: 700; border-radius: 99px; text-transform: uppercase;">${item.category || 'News'}</span></td>
                                <td>${item.title}</td>
                                <td>
                                    <a href="admin-news.php?action=delete&id=${encodeURIComponent(item.id)}" class="btn-delete" onclick="return confirm('Are you sure you want to delete this article?');">Delete</a>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `}

</div>

</body>
</html>`;
}

server.listen(PORT, () => {
  console.log(`Summit Technologies local testing server running at http://localhost:${PORT}`);
});
