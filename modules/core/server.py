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
    
    def do_POST(self):
        """Handle POST requests"""
        
        # Handle API endpoints
        if self.path.startswith('/api/'):
            self.handle_api_post()
            return
        else:
            self.send_error(404, f"POST endpoint not found: {self.path}")
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
            elif self.path == '/api/load-abilities':
                self.handle_load_abilities()
            elif self.path == '/api/scan-abilities':
                self.handle_scan_abilities()
            elif self.path.startswith('/api/biomes'):
                self.handle_biomes_api()
            elif self.path == '/api/maps':
                self.handle_load_maps()
            else:
                self.send_error(404, f"API endpoint not found: {self.path}")
        except Exception as e:
            print(f"[Server] API Error: {e}")
            self.send_error(500, f"Internal server error: {e}")
    
    def handle_api_post(self):
        """Handle API POST requests"""
        try:
            if self.path == '/api/maps/save':
                self.handle_save_map()
            elif self.path == '/api/save-peoples':
                self.handle_save_peoples()
            else:
                self.send_error(404, f"POST API endpoint not found: {self.path}")
        except Exception as e:
            print(f"[Server] POST API Error: {e}")
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
    
    def handle_load_abilities(self):
        """Handle /api/load-abilities endpoint"""
        try:
            abilities_path = Path('assets/abilities/abilities.json')
            
            if abilities_path.exists():
                with open(abilities_path, 'r', encoding='utf-8') as f:
                    abilities_data = json.load(f)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                response_data = {
                    'status': 'success',
                    'abilities': abilities_data.get('abilities', []),
                    'message': f'Loaded {len(abilities_data.get("abilities", []))} abilities'
                }
                
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            else:
                self.send_error(404, 'abilities.json not found')
                
        except Exception as e:
            print(f"[Server] Error loading abilities: {e}")
            self.send_error(500, f"Error loading abilities: {e}")
    
    def handle_scan_abilities(self):
        """Handle /api/scan-abilities endpoint"""
        try:
            abilities_dir = Path('assets/abilities')
            abilities_data = {}
            
            if abilities_dir.exists():
                # Scan each category directory
                for category_dir in abilities_dir.iterdir():
                    if category_dir.is_dir() and category_dir.name != 'abilities':
                        category_name = category_dir.name
                        abilities_data[category_name] = {
                            'abilities': []
                        }
                        
                        # Scan JS files in category directory and load their content
                        for js_file in category_dir.glob('*.js'):
                            try:
                                # Read the JS file content
                                with open(js_file, 'r', encoding='utf-8') as f:
                                    content = f.read()
                                    
                                # Parse the JS object (remove parentheses and parse as JSON)
                                json_content = content.strip()
                                if json_content.startswith('({') and json_content.endswith('})'):
                                    json_content = json_content[1:-1]  # Remove outer parentheses
                                
                                ability_data = json.loads(json_content)
                                
                                abilities_data[category_name]['abilities'].append({
                                    'file': js_file.name,
                                    'path': str(js_file).replace('\\', '/'),
                                    'data': ability_data
                                })
                            except Exception as e:
                                print(f"[Server] Error reading ability file {js_file.name}: {e}")
                                # Fallback: just add file info without data
                                abilities_data[category_name]['abilities'].append({
                                    'file': js_file.name,
                                    'path': str(js_file).replace('\\', '/')
                                })
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_data = {
                'status': 'success',
                'abilities': abilities_data,
                'message': f'Scanned {len(abilities_data)} ability categories'
            }
            
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            print(f"[Server] Error scanning abilities: {e}")
            self.send_error(500, f"Error scanning abilities: {e}")

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
    
    def handle_save_map(self):
        """Handle /api/maps/save POST endpoint"""
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            map_data = json.loads(post_data.decode('utf-8'))
            
            # Validate required fields
            if 'name' not in map_data or 'data' not in map_data:
                self.send_error(400, "Missing required fields: name and data")
                return
            
            # Ensure maps directory exists
            maps_dir = Path('assets/maps')
            maps_dir.mkdir(exist_ok=True)
            
            # Create filename from map name (sanitize for filesystem)
            safe_name = re.sub(r'[^\w\-_\.]', '_', map_data['name'])
            filename = f"{safe_name}.json"
            file_path = maps_dir / filename
            
            # Add metadata
            map_file_data = {
                'id': map_data.get('id', str(int(datetime.now().timestamp() * 1000))),
                'name': map_data['name'],
                'timestamp': map_data.get('timestamp', int(datetime.now().timestamp() * 1000)),
                'data': map_data['data'],
                'tilesCount': map_data.get('tilesCount', 0),
                'settings': map_data.get('settings', {}),
                'version': '1.0',
                'savedAt': datetime.now().isoformat()
            }
            
            # Write map file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(map_file_data, f, ensure_ascii=False, indent=2)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_data = {
                'success': True,
                'message': f'Map "{map_data["name"]}" saved successfully',
                'filename': filename,
                'path': str(file_path)
            }
            
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
            print(f"[Server] Map saved: {file_path}")
            
        except json.JSONDecodeError as e:
            self.send_error(400, f"Invalid JSON data: {e}")
        except Exception as e:
            print(f"[Server] Error saving map: {e}")
            self.send_error(500, f"Error saving map: {e}")
    
    def handle_load_maps(self):
        """Handle /api/maps GET endpoint"""
        try:
            maps_dir = Path('assets/maps')
            
            if not maps_dir.exists():
                # Return empty list if maps directory doesn't exist
                maps_list = []
            else:
                maps_list = []
                
                # Scan for JSON files in maps directory
                for json_file in maps_dir.glob('*.json'):
                    try:
                        with open(json_file, 'r', encoding='utf-8') as f:
                            map_data = json.load(f)
                        
                        # Add file info
                        map_data['filename'] = json_file.name
                        map_data['filepath'] = str(json_file)
                        maps_list.append(map_data)
                        
                    except Exception as e:
                        print(f"[Server] Error reading map file {json_file}: {e}")
                        continue
                
                # Sort by timestamp (newest first)
                maps_list.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_data = {
                'success': True,
                'maps': maps_list,
                'count': len(maps_list)
            }
            
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            print(f"[Server] Error loading maps: {e}")
            self.send_error(500, f"Error loading maps: {e}")

    def handle_save_abilities(self):
        """Handle /api/save-abilities POST endpoint - Save to individual .js files"""
        try:
            # Read JSON data from request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            abilities_data = json.loads(post_data.decode('utf-8'))
            
            # Validate the data structure
            if 'abilities' not in abilities_data:
                self.send_error(400, "Missing 'abilities' field in request data")
                return
            
            print(f"[Server] Saving {len(abilities_data['abilities'])} abilities to individual .js files...")
            
            # Group abilities by category
            abilities_by_category = {}
            for ability in abilities_data['abilities']:
                category = ability.get('category', 'combat')
                if category not in abilities_by_category:
                    abilities_by_category[category] = []
                abilities_by_category[category].append(ability)
            
            saved_files = []
            
            # Save each ability to its individual .js file
            for category, abilities in abilities_by_category.items():
                category_dir = os.path.join(os.getcwd(), 'assets', 'abilities', category)
                
                if not os.path.exists(category_dir):
                    print(f"[Server] Creating category directory: {category_dir}")
                    os.makedirs(category_dir)
                
                for ability in abilities:
                    # Get the original file name from characterData.id
                    ability_id = ability.get('characterData', {}).get('id', ability.get('name', 'unknown').lower().replace(' ', '_'))
                    js_file_path = os.path.join(category_dir, f"{ability_id}.js")
                    
                    # Create the JS object content
                    js_content = self.create_ability_js_content(ability)
                    
                    # Create backup if file exists
                    if os.path.exists(js_file_path):
                        backup_path = js_file_path + '.backup'
                        import shutil
                        shutil.copy2(js_file_path, backup_path)
                        print(f"[Server] Created backup: {backup_path}")
                    
                    # Write the JS file
                    with open(js_file_path, 'w', encoding='utf-8') as f:
                        f.write(js_content)
                    
                    saved_files.append(js_file_path)
                    print(f"[Server] Saved ability '{ability.get('name', 'Unknown')}' to {js_file_path}")
            
            # Also save to abilities.json as backup
            abilities_file = os.path.join(os.getcwd(), 'assets', 'abilities', 'abilities.json')
            backup_file = abilities_file + '.backup'
            if os.path.exists(abilities_file):
                import shutil
                shutil.copy2(abilities_file, backup_file)
                print(f"[Server] Created abilities.json backup: {backup_file}")
            
            with open(abilities_file, 'w', encoding='utf-8') as f:
                json.dump(abilities_data, f, ensure_ascii=False, indent=2)
            
            print(f"[Server] Also saved to abilities.json as backup")
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_data = {
                'success': True,
                'message': f'Abilities saved to {len(saved_files)} individual .js files',
                'timestamp': datetime.now().isoformat(),
                'saved_files': saved_files,
                'categories': list(abilities_by_category.keys())
            }
            
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except json.JSONDecodeError as e:
            print(f"[Server] JSON decode error: {e}")
            self.send_error(400, f"Invalid JSON data: {e}")
        except Exception as e:
            print(f"[Server] Error saving abilities: {e}")
            self.send_error(500, f"Error saving abilities: {e}")
    
    def create_ability_js_content(self, ability):
        """Create JS file content for an individual ability"""
        character_data = ability.get('characterData', {})
        
        # Extract availableFor from races array
        races = ability.get('races', [])
        available_for = [race.lower() for race in races]
        
        # Create the JS object
        js_object = {
            "id": character_data.get('id', ability.get('name', 'unknown').lower().replace(' ', '_')),
            "name": ability.get('name', 'Unknown Ability'),
            "icon": character_data.get('icon', '❓'),
            "iconPath": character_data.get('iconPath', ''),
            "type": character_data.get('type', ability.get('type', 'combat')),
            "level": character_data.get('level', 1),
            "cost": character_data.get('cost', ability.get('cost', 0)),
            "rank": character_data.get('rank', 1),
            "rankIconPath": character_data.get('rankIconPath', ''),
            "magicRequirement": character_data.get('magicRequirement', 'none'),
            "description": character_data.get('description', ability.get('description', '')),
            "effect": character_data.get('effect', ''),
            "availableFor": available_for,
            "availableForArchetypes": character_data.get('availableForArchetypes', [])
        }
        
        # Convert to JS format with parentheses
        js_content = f"({json.dumps(js_object, ensure_ascii=False, indent=4)})"
        return js_content

    def handle_save_peoples(self):
        """Handle /api/save-peoples POST endpoint - Save peoples.json"""
        try:
            # Read JSON data from request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            peoples_data = json.loads(post_data.decode('utf-8'))
            
            # Validate the data structure
            if 'peoples' not in peoples_data:
                self.send_error(400, "Missing 'peoples' field in request data")
                return
            
            print(f"[Server] Saving {len(peoples_data['peoples'])} peoples to peoples.json...")
            
            # Path to peoples.json file
            peoples_file = os.path.join(os.getcwd(), 'assets', 'peoples', 'peoples.json')
            
            # Create backup of original file
            backup_file = peoples_file + '.backup'
            if os.path.exists(peoples_file):
                import shutil
                shutil.copy2(peoples_file, backup_file)
                print(f"[Server] Created backup: {backup_file}")
            
            # Write new data to file
            with open(peoples_file, 'w', encoding='utf-8') as f:
                json.dump(peoples_data, f, ensure_ascii=False, indent=2)
            
            print(f"[Server] Successfully saved peoples to {peoples_file}")
            
            # Update individual class files
            updated_files = []
            for people in peoples_data['peoples']:
                try:
                    # Determine the individual class file path
                    race = people.get('race', '').lower()
                    class_name = people.get('name', '')
                    
                    # Map German class names to English file names
                    class_name_mapping = {
                        'Zwerg Schmied': 'dwarf_blacksmith',
                        'Zwerg Bergarbeiter': 'dwarf_miner', 
                        'Zwerg Krieger': 'dwarf_warrior',
                        'Elfen Bogenschütze': 'elven_archer',
                        'Elfen Magier': 'elven_mage',
                        'Elfen Waldläufer': 'elven_ranger',
                        'Goblin Kundschafter': 'goblin_scout',
                        'Goblin Schamane': 'goblin_shaman',
                        'Goblin Krieger': 'goblin_warrior',
                        'Menschlicher Ritter': 'human_knight',
                        'Menschlicher Magier': 'human_mage',
                        'Menschlicher Händler': 'human_merchant',
                        'Ork Berserker': 'orc_berserker',
                        'Ork Häuptling': 'orc_chieftain',
                        'Ork Schamane': 'orc_shaman'
                    }
                    
                    mapped_class_name = class_name_mapping.get(class_name, class_name.replace(' ', '_').lower())
                    
                    print(f"[Server] Processing class: {class_name} -> race: {race}, mapped_class_name: {mapped_class_name}")
                    
                    if race and mapped_class_name:
                        class_file_path = os.path.join(os.getcwd(), 'assets', 'peoples', race, f"{mapped_class_name}.js")
                        print(f"[Server] Looking for class file: {class_file_path}")
                        print(f"[Server] File exists: {os.path.exists(class_file_path)}")
                        
                        if os.path.exists(class_file_path):
                            # Read current class file
                            with open(class_file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                            
                            # Parse the JS object
                            json_content = content.strip()
                            if json_content.startswith('({') and json_content.endswith('})'):
                                json_content = json_content[1:-1]  # Remove outer parentheses
                            
                            class_data = json.loads(json_content)
                            
                            # Update abilities field
                            if 'assignedAbilities' in people and people['assignedAbilities']:
                                abilities_string = ', '.join(people['assignedAbilities'])
                                class_data['abilities'] = abilities_string
                                print(f"[Server] Updated {class_name}.js abilities: {abilities_string}")
                            else:
                                class_data['abilities'] = ""
                                print(f"[Server] Cleared {class_name}.js abilities")
                            
                            # Write back to file
                            with open(class_file_path, 'w', encoding='utf-8') as f:
                                f.write('(' + json.dumps(class_data, ensure_ascii=False, indent=4) + ')')
                            
                            updated_files.append(class_file_path)
                            
                except Exception as e:
                    print(f"[Server] Error updating class file for {people.get('name', 'unknown')}: {e}")
                    continue
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response_data = {
                'success': True,
                'message': 'Peoples and individual class files saved successfully',
                'timestamp': datetime.now().isoformat(),
                'file': peoples_file,
                'total_peoples': len(peoples_data['peoples']),
                'updated_class_files': len(updated_files),
                'updated_files': updated_files
            }
            
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            
        except json.JSONDecodeError as e:
            print(f"[Server] JSON decode error: {e}")
            self.send_error(400, f"Invalid JSON data: {e}")
        except Exception as e:
            print(f"[Server] Error saving peoples: {e}")
            self.send_error(500, f"Error saving peoples: {e}")

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
