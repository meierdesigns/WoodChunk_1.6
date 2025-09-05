#!/usr/bin/env python3
"""
Cache-Busting Update Script
Aktualisiert automatisch die Versionsparameter in HTML-Dateien
"""

import os
import re
import hashlib
from datetime import datetime

def get_file_hash(filepath):
    """Berechnet den MD5-Hash einer Datei"""
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()[:8]

def update_html_files():
    """Aktualisiert alle HTML-Dateien mit neuen Cache-Busting-Parametern"""
    
    # Aktuelle Zeit als Version verwenden
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # HTML-Dateien finden
    html_files = [
        'abilitiesEditor.html',
        'characterEditor.html',
        'itemEditor.html',
        'peopleEditor.html',
        'hexMapEditor.html',
        'tileEditor.html',
        'index.html'
    ]
    
    for html_file in html_files:
        if not os.path.exists(html_file):
            continue
            
        print(f"Verarbeite {html_file}...")
        
        # Datei lesen
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # CSS-Dateien aktualisieren
        content = re.sub(
            r'(href="[^"]*\.css)(\?v=[^"]*)?(")',
            rf'\1?v={timestamp}\3',
            content
        )
        
        # JavaScript-Dateien aktualisieren
        content = re.sub(
            r'(src="[^"]*\.js)(\?v=[^"]*)?(")',
            rf'\1?v={timestamp}\3',
            content
        )
        
        # Bild-Dateien für Buildings aktualisieren
        content = re.sub(
            r'(src="[^"]*Buildings[^"]*\.(png|jpg|jpeg|gif))(\?[^"]*)?(")',
            rf'\1?_cb={timestamp}\4',
            content
        )
        
        # Slice- und Tile-Bilder aktualisieren
        content = re.sub(
            r'(src="[^"]*(slice_|tile_)[^"]*\.(png|jpg|jpeg|gif))(\?[^"]*)?(")',
            rf'\1?_cb={timestamp}\5',
            content
        )
        
        # Datei schreiben
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✓ {html_file} aktualisiert")

def main():
    print("Cache-Busting Update Script")
    print("=" * 40)
    
    update_html_files()
    
    print("\nFertig! Alle HTML-Dateien wurden aktualisiert.")
    print("Starte den Server neu mit: python server.py")

if __name__ == "__main__":
    main()
