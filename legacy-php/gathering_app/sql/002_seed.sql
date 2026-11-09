-- Default settings and page shells. Contains NO ministry content:
-- every value below is either empty or a neutral system default that staff
-- replace in Admin > Settings. Pages start unpublished so nothing empty goes live.

SET NAMES utf8mb4;

INSERT INTO settings (skey, svalue) VALUES
 ('site_name', 'The Gathering'),
 ('site_tagline', ''),
 ('logo_media_id', ''),
 ('logo_light_media_id', ''),
 ('favicon_media_id', ''),
 ('og_media_id', ''),
 ('brand_primary', '#0b0b0c'),
 ('brand_accent', '#ffcc00'),
 ('contact_email', ''),
 ('contact_phone', ''),
 ('whatsapp_number', ''),
 ('whatsapp_community_url', ''),
 ('postal_address', ''),
 ('social_facebook', ''),
 ('social_instagram', ''),
 ('social_youtube', ''),
 ('social_x', ''),
 ('social_tiktok', ''),
 ('livestream_url', ''),
 ('livestream_embed_url', ''),
 ('livestream_is_live', '0'),
 ('giving_intro', ''),
 ('giving_online_url', ''),
 ('giving_online_label', ''),
 ('giving_bank_details', ''),
 ('welcome_heading', ''),
 ('welcome_body', ''),
 ('volunteer_intro', ''),
 ('footer_text', ''),
 ('meta_description', ''),
 ('ga_measurement_id', ''),
 ('gtm_container_id', ''),
 ('meta_pixel_id', ''),
 ('google_site_verification', ''),
 ('notify_default', ''),
 ('notify_registration', ''),
 ('notify_contact', ''),
 ('notify_prayer', ''),
 ('notify_testimony', ''),
 ('notify_volunteer', ''),
 ('notify_partnership', ''),
 ('notify_newsletter', ''),
 ('form_registration_enabled', '1'),
 ('form_contact_enabled', '1'),
 ('form_prayer_enabled', '0'),
 ('form_testimony_enabled', '0'),
 ('form_volunteer_enabled', '0'),
 ('form_partnership_enabled', '0'),
 ('form_newsletter_enabled', '0'),
 ('registration_confirm_note', ''),
 ('volunteer_teams', ''),
 ('show_attendee_count', '0');

INSERT INTO pages (slug, title, is_system, is_published) VALUES
 ('about', 'About The Gathering', 1, 0),
 ('venue', 'Venue & Accommodation', 1, 0),
 ('give', 'Give & Partner', 1, 0),
 ('volunteer', 'Volunteer', 1, 0),
 ('privacy', 'Privacy Policy', 1, 0);

INSERT INTO schema_migrations (version) VALUES ('002_seed');
