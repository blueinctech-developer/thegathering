-- Editable content blocks used on the homepage, About, Outreach and Give pages
-- (impact figures, pillars, programmes, infrastructure items, goals, etc.)
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS blocks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  grp VARCHAR(40) NOT NULL,
  title VARCHAR(190) NOT NULL,
  body TEXT NULL,
  icon VARCHAR(40) NULL,
  media_id INT UNSIGNED NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_grp (grp, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO pages (slug, title, is_system, is_published) VALUES ('outreach', 'Outreach', 1, 0);

INSERT IGNORE INTO settings (skey, svalue) VALUES
 ('hero_summary', ''),
 ('marquee_words', ''),
 ('mission_lines', ''),
 ('why_heading', ''),
 ('why_body', ''),
 ('land_heading', ''),
 ('land_body', ''),
 ('land_figure', ''),
 ('land_figure_label', ''),
 ('partner_heading', ''),
 ('partner_body', ''),
 ('org_legal', ''),
 ('parent_org_name', ''),
 ('parent_logo_media_id', ''),
 ('hero_media_id', ''),
 ('contact_intro', ''),
 ('parent_org_url', ''),
 ('bus_heading', ''),
 ('bus_body', ''),
 ('bus_time', ''),
 ('bus_fee', ''),
 ('bus_dropoff', ''),
 ('bus_media_id', ''),
 ('funding_total', ''),
 ('funding_note', ''),
 ('partnership_docs_url', ''),
 ('programme_note', '');

INSERT INTO schema_migrations (version) VALUES ('003_blocks');
