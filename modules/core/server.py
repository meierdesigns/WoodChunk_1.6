#!/usr/bin/env python3
"""
WoodChunk 1.5 - HTTP Server
Simple HTTP server for development and file serving
"""

import os
import json
import re
import socketserver
import http.server
import traceback
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Server configuration
HOST = 'localhost'
PORT = 8080

class WoodChunkHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        
        # Handle API endpoints
        if self.path.startswith('/api/'):
            self.handle_api_get()
            return
        
        # Handle root path
        if self.path == '/':
            self.path = '/index.html'
        
        # Handle cache busting for all files
        if '?' in self.path:
            # Extract the actual file path without query parameters
            actual_path = self.path.split('?')[0]
            if os.path.exists(actual_path.lstrip('/')):
                self.path = actual_path
        
        # Check if file exists before serving
        file_path = self.path.lstrip('/')
        
        if os.path.exists(file_path):
            self.serve_file(file_path)
            return
        else:
            self.send_error(404, f"File not found: {self.path}")
            return
    
    def serve_file(self, file_path):
        """Serve a file with proper headers"""
        try:
            # Get file extension for content type
            file_ext = os.path.splitext(file_path)[1].lower()
            content_type = self.get_content_type(file_ext)
            
            # Set response headers
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.set_cache_headers(file_path)
            self.end_headers()
            
            # Read and send file content
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
                
        except Exception as e:
            self.send_error(500, f"Error serving file: {e}")
    
    def get_content_type(self, file_ext):
        """Get MIME content type for file extension"""
        content_types = {
            '.html': 'text/html',
            '.htm': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.json': 'application/json',
            '.txt': 'text/plain'
        }
        return content_types.get(file_ext, 'application/octet-stream')
    
    def set_cache_headers(self, file_path):
        """Set appropriate cache headers based on file type"""
        # Get file extension
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext in ['.html', '.htm']:
            # HTML files: no cache to ensure fresh content
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        elif file_ext in ['.js', '.css']:
            # JS/CSS files: cache for 1 hour with version query param
            self.send_header('Cache-Control', 'public, max-age=3600')
            self.send_header('ETag', f'"v1.0-{os.path.getmtime(file_path)}"')
        elif file_ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico']:
            # Images: cache for 1 day
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            # Default: no cache
            self.send_header('Cache-Control', 'no-cache')
    
    def handle_api_get(self):
        """Handle API GET requests"""
        try:
            if self.path == '/api/status':
                self.handle_status()
            elif self.path == '/api/scan-items':
                self.handle_scan_items()
            elif self.path.startswith('/api/biomes'):
                self.handle_biomes_api()
            else:
                self.send_error(404, f"API endpoint not found: {self.path}")
        except Exception as e:
            print(f"[Server] API Error: {e}")
            self.send_error(500, f"Internal server error: {e}")
    
    def handle_status(self):
        """Handle /api/status endpoint"""
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            status_data = {
                'status': 'running',
                'timestamp': datetime.now().isoformat(),
                'server': 'WoodChunk 1.5'
            }
            
            self.wfile.write(json.dumps(status_data, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error serving status: {e}")
    
    def handle_biomes_api(self):
        """Handle biome-related API endpoints"""
        try:
            if self.path == '/api/biomes/folders':
                self.handle_biome_folders()
            elif self.path == '/api/biomes/categories':
                self.handle_biome_categories()
            elif self.path == '/api/biomes/tiles':
                self.handle_biome_tiles()
            else:
                self.send_error(404, f"Biome API endpoint not found: {self.path}")
        except Exception as e:
            self.send_error(500, f"Biome API error: {e}")
    
    def handle_biome_folders(self):
        """Handle /api/biomes/folders endpoint"""
        try:
            biomes_path = 'assets/biomes'
            if not os.path.exists(biomes_path):
                self.send_error(404, "Biomes directory not found")
                return
            
            # Get all biome folders
            biome_folders = []
            for item in os.listdir(biomes_path):
                item_path = os.path.join(biomes_path, item)
                if os.path.isdir(item_path):
                    biome_folders.append({
                        'name': item,
                        'path': item_path
                    })
            
            # Return the folders data
            response_data = {
                'success': True,
                'biomes': biome_folders
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            print(f"[Server] Error serving biomes folders: {e}")
            self.send_error(500, f"Error serving biomes folders: {e}")
    
    def handle_biome_categories(self):
        """Handle /api/biomes/categories endpoint"""
        try:
            # Simple implementation - can be enhanced later
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_data = {
                'success': True,
                'categories': [],
                'message': 'Categories endpoint - to be implemented'
            }
            
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error serving categories: {e}")
    
    def handle_scan_items(self):
        """Handle /api/scan-items endpoint"""
        try:
            items_path = 'assets/items'
            if not os.path.exists(items_path):
                self.send_error(404, "Items directory not found")
                return
            
            # Scan all item categories
            items_data = {}
            materials_list = []
            
            for category in os.listdir(items_path):
                category_path = os.path.join(items_path, category)
                if os.path.isdir(category_path) and category != 'classes':
                    category_items = []
                    
                    # Scan all JS files in the category
                    for file_name in os.listdir(category_path):
                        if file_name.endswith('.js') and file_name != 'columns.js':
                            file_path = os.path.join(category_path, file_name)
                            relative_path = f'assets/items/{category}/{file_name}'
                            
                            category_items.append({
                                'file': file_name,
                                'path': relative_path
                            })
                            
                            # If it's a materials category, also add to materials list
                            if category == 'materials':
                                try:
                                    with open(file_path, 'r', encoding='utf-8') as f:
                                        content = f.read()
                                        # Extract material name from JS file
                                        name_match = re.search(r'name:\s*["\']([^"\']+)["\']', content)
                                        material_match = re.search(r'material:\s*["\']([^"\']+)["\']', content)
                                        
                                        if name_match and material_match:
                                            materials_list.append({
                                                'name': name_match.group(1),
                                                'material': material_match.group(1)
                                            })
                                except Exception as e:
                                    print(f"[Server] Error reading material file {file_name}: {e}")
                    
                    items_data[category] = {
                        'items': category_items
                    }
            
            # Return the items data
            response_data = {
                'status': 'success',
                'items': items_data,
                'materials': materials_list
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            print(f"[Server] Error scanning items: {e}")
            self.send_error(500, f"Error scanning items: {e}")
    
    def handle_biome_tiles(self):
        """Handle /api/biomes/tiles endpoint"""
        try:
            # Simple implementation - can be enhanced later
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_data = {
                'success': True,
                'tiles': [],
                'message': 'Tiles endpoint - to be implemented'
            }
            
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error serving tiles: {e}")

def main():
    """Start the server"""
    print(f"[Server] 🚀 Starting WoodChunk 1.5 server on {HOST}:{PORT}")
    print(f"[Server] 📁 Serving files from: {os.getcwd()}")
    print(f"[Server] 🌐 Server will be available at: http://{HOST}:{PORT}")
    print(f"[Server] ⏹️  Press Ctrl+C to stop the server")
    print()
    
    try:
        with socketserver.TCPServer((HOST, PORT), WoodChunkHandler) as httpd:
            print(f"[Server] ✅ Server started successfully!")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n[Server] ⏹️  Server stopped by user")
    except Exception as e:
        print(f"[Server] ❌ Server error: {e}")

if __name__ == "__main__":
    main()
