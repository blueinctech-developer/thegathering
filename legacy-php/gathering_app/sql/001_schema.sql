-- The Gathering CMS - schema v1
-- Import into an empty MySQL 8 / MariaDB 10.4+ database (utf8mb4).

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_resets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Generic rate-limit hits (login attempts, form posts, resets)
CREATE TABLE rate_hits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bucket VARCHAR(190) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bucket_time (bucket, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE settings (
  skey VARCHAR(100) PRIMARY KEY,
  svalue MEDIUMTEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Uploaded files (images are stored with resized WebP/JPEG variants)
CREATE TABLE media (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(255) NOT NULL,           -- relative to public_html, e.g. uploads/2026/11/abc123.jpg
  kind ENUM('image','document') NOT NULL DEFAULT 'image',
  original_name VARCHAR(255) NULL,
  mime VARCHAR(100) NOT NULL,
  bytes INT UNSIGNED NOT NULL DEFAULT 0,
  width INT UNSIGNED NULL,
  height INT UNSIGNED NULL,
  variants VARCHAR(255) NULL,           -- comma list of widths generated, e.g. 480,960,1600
  alt VARCHAR(255) NULL,
  uploaded_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kind (kind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  theme VARCHAR(255) NULL,
  theme_scripture VARCHAR(255) NULL,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  venue_name VARCHAR(190) NULL,
  venue_address VARCHAR(255) NULL,
  map_query VARCHAR(255) NULL,          -- text used for Google Maps embed/link
  summary TEXT NULL,
  hero_media_id INT UNSIGNED NULL,
  flyer_media_id INT UNSIGNED NULL,
  programme_media_id INT UNSIGNED NULL, -- downloadable PDF
  registration_open TINYINT(1) NOT NULL DEFAULT 0,
  capacity INT UNSIGNED NULL,
  is_current TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(190) NOT NULL,
  intro TEXT NULL,
  body MEDIUMTEXT NULL,
  hero_media_id INT UNSIGNED NULL,
  meta_title VARCHAR(190) NULL,
  meta_description VARCHAR(300) NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0, -- system pages can't be deleted
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE speakers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(140) NOT NULL UNIQUE,
  name VARCHAR(190) NOT NULL,
  role_title VARCHAR(190) NULL,
  ministry VARCHAR(190) NULL,
  bio MEDIUMTEXT NULL,
  photo_media_id INT UNSIGNED NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE schedule_days (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  label VARCHAR(120) NOT NULL,
  day_date DATE NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE schedule_sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  day_id INT UNSIGNED NOT NULL,
  starts_at TIME NULL,
  ends_at TIME NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  speaker_id INT UNSIGNED NULL,
  location VARCHAR(190) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (day_id) REFERENCES schedule_days(id) ON DELETE CASCADE,
  FOREIGN KEY (speaker_id) REFERENCES speakers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE albums (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(140) NOT NULL UNIQUE,
  title VARCHAR(190) NOT NULL,
  year SMALLINT UNSIGNED NULL,
  description TEXT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE photos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  album_id INT UNSIGNED NOT NULL,
  media_id INT UNSIGNED NOT NULL,
  caption VARCHAR(255) NULL,
  alt VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sermons / messages / livestream replays
CREATE TABLE messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(190) NOT NULL,
  kind ENUM('video','audio') NOT NULL DEFAULT 'video',
  url VARCHAR(500) NOT NULL,
  speaker_name VARCHAR(190) NULL,
  recorded_on DATE NULL,
  description TEXT NULL,
  thumb_media_id INT UNSIGNED NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(190) NOT NULL,
  excerpt TEXT NULL,
  body MEDIUMTEXT NULL,
  cover_media_id INT UNSIGNED NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  author_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_pub (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faqs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(300) NOT NULL,
  answer TEXT NOT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Every form submission lands here first, before any email is attempted.
CREATE TABLE submissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  form_type VARCHAR(40) NOT NULL,
  reference VARCHAR(30) NOT NULL UNIQUE,
  event_id INT UNSIGNED NULL,
  name VARCHAR(190) NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(40) NULL,
  data JSON NOT NULL,
  status ENUM('new','in_progress','handled','spam') NOT NULL DEFAULT 'new',
  email_status ENUM('pending','sent','failed','none') NOT NULL DEFAULT 'pending',
  ip_hash CHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type_created (form_type, created_at),
  INDEX idx_status (status),
  INDEX idx_email_status (email_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registrations: enforces one registration per email and per phone for each event.
CREATE TABLE registrations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id INT UNSIGNED NOT NULL,
  event_id INT UNSIGNED NOT NULL,
  email_norm VARCHAR(190) NOT NULL,
  phone_norm VARCHAR(40) NULL,
  attendees SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  checked_in_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_event_email (event_id, email_norm),
  UNIQUE KEY uq_event_phone (event_id, phone_norm),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE submission_notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NULL,
  note TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE testimonies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id INT UNSIGNED NULL,
  name VARCHAR(190) NOT NULL,
  location VARCHAR(190) NULL,
  body TEXT NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by INT UNSIGNED NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Outgoing email queue + log. Every attempt is recorded; cron retries failures.
CREATE TABLE email_outbox (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id INT UNSIGNED NULL,
  purpose VARCHAR(40) NOT NULL,          -- notify, confirm, reset, test
  to_email VARCHAR(190) NOT NULL,
  reply_to VARCHAR(190) NULL,
  subject VARCHAR(255) NOT NULL,
  body_html MEDIUMTEXT NOT NULL,
  body_text MEDIUMTEXT NOT NULL,
  status ENUM('queued','sent','failed') NOT NULL DEFAULT 'queued',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_error VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_attempt_at DATETIME NULL,
  sent_at DATETIME NULL,
  INDEX idx_status (status),
  INDEX idx_submission (submission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE redirects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  from_path VARCHAR(255) NOT NULL UNIQUE,
  to_path VARCHAR(500) NOT NULL,
  code SMALLINT UNSIGNED NOT NULL DEFAULT 301,
  hits INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(60) NOT NULL,
  entity VARCHAR(60) NULL,
  entity_id VARCHAR(60) NULL,
  details VARCHAR(500) NULL,
  ip_hash CHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version) VALUES ('001_schema');
