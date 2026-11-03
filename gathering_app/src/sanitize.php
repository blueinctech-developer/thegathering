<?php
declare(strict_types=1);

/**
 * Allow-list HTML sanitiser for rich text entered in the admin editor.
 * Keeps basic formatting, links and images; strips scripts, styles, event handlers
 * and anything not on the list.
 */
function clean_html(string $html): string
{
    $html = trim($html);
    if ($html === '') {
        return '';
    }
    $allowed = [
        'p' => [], 'br' => [], 'strong' => [], 'b' => [], 'em' => [], 'i' => [], 'u' => [],
        'h2' => [], 'h3' => [], 'h4' => [], 'ul' => [], 'ol' => [], 'li' => [],
        'blockquote' => [], 'a' => ['href', 'title'], 'img' => ['src', 'alt', 'width', 'height'],
        'hr' => [], 'figure' => [], 'figcaption' => [], 'table' => [], 'thead' => [], 'tbody' => [],
        'tr' => [], 'th' => [], 'td' => [],
    ];
    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="utf-8"?><div id="__root">' . $html . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET);
    libxml_clear_errors();
    $root = $doc->getElementById('__root');
    if (!$root) {
        return e(strip_tags($html));
    }
    clean_node($root, $allowed, $doc);
    $out = '';
    foreach ($root->childNodes as $child) {
        $out .= $doc->saveHTML($child);
    }
    return trim($out);
}

function clean_node(DOMNode $node, array $allowed, DOMDocument $doc): void
{
    $children = [];
    foreach ($node->childNodes as $c) {
        $children[] = $c;
    }
    foreach ($children as $child) {
        if ($child instanceof DOMText) {
            continue;
        }
        if (!($child instanceof DOMElement)) {
            $node->removeChild($child);
            continue;
        }
        $tag = strtolower($child->tagName);
        if (in_array($tag, ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'math', 'template'], true)) {
            $node->removeChild($child);
            continue;
        }
        clean_node($child, $allowed, $doc);
        if (!isset($allowed[$tag])) {
            // unwrap: keep children, drop the element (div/span → contents)
            $isBlock = in_array($tag, ['div', 'section', 'article', 'header', 'footer'], true);
            if ($isBlock && $child->hasChildNodes()) {
                $p = $doc->createElement('p');
                while ($child->firstChild) {
                    $p->appendChild($child->firstChild);
                }
                $node->replaceChild($p, $child);
            } else {
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);
            }
            continue;
        }
        $attrs = [];
        foreach ($child->attributes as $a) {
            $attrs[] = $a->name;
        }
        foreach ($attrs as $name) {
            if (!in_array(strtolower($name), $allowed[$tag], true)) {
                $child->removeAttribute($name);
            }
        }
        foreach (['href', 'src'] as $urlAttr) {
            if ($child->hasAttribute($urlAttr)) {
                $u = trim($child->getAttribute($urlAttr));
                $ok = preg_match('~^(https?://|mailto:|tel:|/(?!/)|#)~i', $u);
                if ($urlAttr === 'src') {
                    $ok = preg_match('~^(https://|/(?!/))~i', $u);
                }
                if (!$ok) {
                    $child->removeAttribute($urlAttr);
                }
            }
        }
        if ($tag === 'a' && $child->hasAttribute('href') && preg_match('~^https?://~i', $child->getAttribute('href'))
            && !str_starts_with($child->getAttribute('href'), base_url())) {
            $child->setAttribute('target', '_blank');
            $child->setAttribute('rel', 'noopener noreferrer');
        }
        if ($tag === 'img') {
            $child->setAttribute('loading', 'lazy');
            $child->setAttribute('decoding', 'async');
        }
    }
}
