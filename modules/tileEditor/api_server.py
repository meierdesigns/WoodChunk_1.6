#!/usr/bin/env python3
"""
Simple API server for TileEditor file operations
"""

import os
import json
import shutil
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import cgi

class TileEditorAPIHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests for file operations"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        if path == '/api/rename-tile-file':
            self.handle_rename_tile_file()
        elif path == '/api/upload-biome-image':
            self.handle_upload_biome_image()
        else:
            self.send_error(404, "API endpoint not found")
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        if path == '/api/scan-biome-images':
            self.handle_scan_biome_images()
        else:
            self.send_error(404, "API endpoint not found")
    
    def handle_rename_tile_file(self):
        """Rename a tile file"""
        try:
            # Parse JSON request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            biome_name = data.get('biomeName')
            old_path = data.get('oldPath')
            new_path = data.get('newPath')
            
            if not all([biome_name, old_path, new_path]):
                self.send_error(400, "Missing required parameters")
                return
            
            # Convert relative paths to absolute paths
            base_dir = Path(__file__).parent.parent.parent
            old_abs_path = base_dir / old_path.lstrip('/')
            new_abs_path = base_dir / new_path.lstrip('/')
            
            # Ensure the directory exists
            new_abs_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Check if old file exists
            if not old_abs_path.exists():
                self.send_error(404, f"Source file not found: {old_path}")
                return
            
            # Rename the file
            shutil.move(str(old_abs_path), str(new_abs_path))
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                'success': True,
                'message': f'File renamed from {old_path} to {new_path}',
                'oldPath': old_path,
                'newPath': new_path
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error renaming tile file: {e}")
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def handle_upload_biome_image(self):
        """Upload a biome image"""
        try:
            # Parse multipart form data
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST'}
            )
            
            # Get form data
            image_file = form['image']
            biome_name = form.getvalue('biomeName')
            file_name = form.getvalue('fileName')
            
            if not all([image_file, biome_name, file_name]):
                self.send_error(400, "Missing required parameters")
                return
            
            # Create target directory
            base_dir = Path(__file__).parent.parent.parent
            target_dir = base_dir / 'assets' / 'biomes' / biome_name / 'tiles'
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # Save the file
            target_path = target_dir / file_name
            with open(target_path, 'wb') as f:
                f.write(image_file.file.read())
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                'success': True,
                'message': f'Image uploaded successfully: {file_name}',
                'fileName': file_name,
                'biomeName': biome_name
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error uploading biome image: {e}")
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def handle_scan_biome_images(self):
        """Scan for images in a biome folder"""
        try:
            # Parse query parameters
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            biome_name = params.get('biome', [None])[0]
            
            if not biome_name:
                self.send_error(400, "Missing biome parameter")
                return
            
            # Scan for images
            base_dir = Path(__file__).parent.parent.parent
            biome_dir = base_dir / 'assets' / 'biomes' / biome_name / 'tiles'
            
            image_paths = []
            if biome_dir.exists():
                for file_path in biome_dir.glob('*.png'):
                    relative_path = f'assets/biomes/{biome_name}/tiles/{file_path.name}'
                    image_paths.append(relative_path)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                'success': True,
                'images': image_paths,
                'biome': biome_name
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error scanning biome images: {e}")
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[TileEditor API] {format % args}")

def run_server(port=8081):
    """Run the API server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, TileEditorAPIHandler)
    print(f"TileEditor API server running on port {port}")
    print(f"Available endpoints:")
    print(f"  POST /api/rename-tile-file")
    print(f"  POST /api/upload-biome-image")
    print(f"  GET  /api/scan-biome-images?biome=<biome_name>")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
