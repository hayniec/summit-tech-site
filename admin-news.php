<?php
// =========================================================
// Summit Technologies — Password-Protected News Admin Panel
// Hostinger / GoDaddy Compatible PHP Admin Portal
// =========================================================

session_start();

// Admin Password (Change this to your desired password)
define('ADMIN_PASSWORD', 'Summit2026!');
define('NEWS_FILE', __DIR__ . '/data/news.json');

$message = '';
$error = '';

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    unset($_SESSION['summit_authenticated']);
    header('Location: admin-news.php');
    exit;
}

// Handle Login Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_password'])) {
    if ($_POST['login_password'] === ADMIN_PASSWORD) {
        $_SESSION['summit_authenticated'] = true;
        header('Location: admin-news.php');
        exit;
    } else {
        $error = 'Invalid password. Please try again.';
    }
}

// Check Authentication
$is_authenticated = isset($_SESSION['summit_authenticated']) && $_SESSION['summit_authenticated'] === true;

// Helper: Read News
function get_news_list() {
    if (!file_exists(NEWS_FILE)) {
        return [];
    }
    $json = file_get_contents(NEWS_FILE);
    return json_decode($json, true) ?: [];
}

// Helper: Save News
function save_news_list($list) {
    if (!is_dir(dirname(NEWS_FILE))) {
        mkdir(dirname(NEWS_FILE), 0755, true);
    }
    return file_put_contents(NEWS_FILE, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

// Handle Add Article (Authenticated)
if ($is_authenticated && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_article') {
    $title = trim($_POST['title'] ?? '');
    $date = trim($_POST['date'] ?? '');
    $category = trim($_POST['category'] ?? 'Announcements');
    $summary = trim($_POST['summary'] ?? '');

    if ($title && $date && $summary) {
        $news_list = get_news_list();
        $new_item = [
            'id' => 'news-' . time(),
            'title' => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
            'date' => htmlspecialchars($date, ENT_QUOTES, 'UTF-8'),
            'isoDate' => date('Y-m-d'),
            'category' => htmlspecialchars($category, ENT_QUOTES, 'UTF-8'),
            'summary' => htmlspecialchars($summary, ENT_QUOTES, 'UTF-8')
        ];
        array_unshift($news_list, $new_item);
        save_news_list($news_list);
        $message = 'Article published successfully!';
    } else {
        $error = 'Please fill out all required fields.';
    }
}

// Handle Delete Article (Authenticated)
if ($is_authenticated && isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $delete_id = $_GET['id'];
    $news_list = get_news_list();
    $news_list = array_filter($news_list, function($item) use ($delete_id) {
        return $item['id'] !== $delete_id;
    });
    save_news_list(array_values($news_list));
    $message = 'Article removed successfully.';
}

$news_items = $is_authenticated ? get_news_list() : [];
?>
<!DOCTYPE html>
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
        body { background: #f8fafc; color: #0f172a; padding-bottom: 60px; }
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

    <?php if (!$is_authenticated): ?>

        <!-- LOGIN FORM -->
        <div class="admin-card" style="max-width: 440px; margin: 80px auto;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 22px; font-weight: 800;">Summit News Admin</h1>
                <p style="font-size: 14px; color: #64748b; margin-top: 4px;">Enter password to manage news articles</p>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <form method="POST" action="admin-news.php">
                <div class="form-group">
                    <label for="login_password">Admin Password</label>
                    <input type="password" id="login_password" name="login_password" required placeholder="Enter password...">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 12px;">Log In</button>
            </form>
        </div>

    <?php else: ?>

        <!-- ADMIN DASHBOARD -->
        <div class="admin-header">
            <div>
                <h1>Manage Summit News</h1>
                <p style="font-size: 14px; color: #64748b;">Publish and manage news articles on the live site</p>
            </div>
            <div>
                <a href="admin-news.php?action=logout" class="btn btn-outline-dark" style="font-size: 13px; padding: 6px 14px;">Log Out</a>
                <a href="index.html#news" target="_blank" class="btn btn-primary" style="font-size: 13px; padding: 6px 14px;">View Live Site &rarr;</a>
            </div>
        </div>

        <?php if ($message): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

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
            <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">Published Articles (<?php echo count($news_items); ?>)</h2>
            <?php if (empty($news_items)): ?>
                <p style="font-size: 14px; color: #64748b;">No articles found.</p>
            <?php else: ?>
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
                        <?php foreach ($news_items as $item): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($item['date']); ?></strong></td>
                                <td><span style="font-size: 11px; padding: 2px 8px; background: #dbeafe; color: #2563eb; font-weight: 700; border-radius: 99px; text-transform: uppercase;"><?php echo htmlspecialchars($item['category'] ?? 'News'); ?></span></td>
                                <td><?php echo htmlspecialchars($item['title']); ?></td>
                                <td>
                                    <a href="admin-news.php?action=delete&id=<?php echo urlencode($item['id']); ?>" class="btn-delete" onclick="return confirm('Are you sure you want to delete this article?');">Delete</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>

    <?php endif; ?>

</div>

</body>
</html>
