#!/usr/bin/env python3
"""
Cache Buster Utility
Automatically adds version parameters to JS and CSS files in HTML
"""

import os
import re
import hashlib
from pathlib import Path

def get_file_hash(file_path):
    """Get MD5 hash of file for cache busting"""
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()[:8]
    return 'v1'

def add_cache_busting(html_content, base_dir='.'):
    """Add cache busting parameters to JS and CSS files"""
    
    # Pattern to match script and link tags
    script_pattern = r'(<script[^>]*src=["\'])([^"\']+\.js)(["\'][^>]*>)'
    link_pattern = r'(<link[^>]*href=["\'])([^"\']+\.css)(["\'][^>]*>)'
    
    def replace_script(match):
        prefix, src, suffix = match.groups()
        if not src.startswith('http') and not src.startswith('//'):
            file_path = os.path.join(base_dir, src.lstrip('/'))
            file_hash = get_file_hash(file_path)
            return f'{prefix}{src}?v={file_hash}{suffix}'
        return match.group(0)
    
    def replace_link(match):
        prefix, href, suffix = match.groups()
        if not href.startswith('http') and not href.startswith('//'):
            file_path = os.path.join(base_dir, href.lstrip('/'))
            file_hash = get_file_hash(file_path)
            return f'{prefix}{href}?v={file_hash}{suffix}'
        return match.group(0)
    
    # Apply replacements
    html_content = re.sub(script_pattern, replace_script, html_content)
    html_content = re.sub(link_pattern, replace_link, html_content)
    
    # Add cache busting for image files in HTML
    img_pattern = r'(<img[^>]*src=["\'])([^"\']+\.(png|jpg|jpeg|gif))([^"\']*)(["\'][^>]*>)'
    
    def replace_img(match):
        prefix, src, ext, middle, suffix = match.groups()
        if not src.startswith('http') and not src.startswith('//'):
            # Add cache busting for Buildings images
            if 'Buildings' in src or 'slice_' in src or 'tile_' in src:
                import time
                timestamp = int(time.time() * 1000)
                separator = '&' if '?' in src else '?'
                src = f'{src}{separator}_cb={timestamp}'
                print(f'[CacheBuster] Cache busted Buildings image: {src}')
        return f'{prefix}{src}{middle}{suffix}'
    
    html_content = re.sub(img_pattern, replace_img, html_content)
    
    return html_content

def process_html_files(directory='.'):
    """Process all HTML files in directory"""
    html_files = list(Path(directory).glob('**/*.html'))
    
    for html_file in html_files:
        print(f"Processing: {html_file}")
        
        # Read HTML content
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add cache busting
        new_content = add_cache_busting(content, html_file.parent)
        
        # Write back if changed
        if new_content != content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  Updated: {html_file}")
        else:
            print(f"  No changes: {html_file}")

if __name__ == '__main__':
    process_html_files()
    print("Cache busting complete!")
