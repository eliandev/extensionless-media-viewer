# Lost Media Recovery Server

## Overview

This project is a lightweight Node.js server designed to recover, detect, and display photos and videos that have no file extension, which commonly occurs with:

- Snapchat exports or cache files
- Android device backups
- Media files extracted from mobile apps
- Files with stripped or obfuscated filenames

Even though these files may be valid photos or videos, systems like Windows cannot open them because the extension is missing. This server automatically identifies the real file type by reading the binary header and then serves the media correctly through a web interface, without requiring you to rename thousands of files manually.

## Features

- Automatic detection of real file type using binary header analysis
- Supports images and videos (JPEG, PNG, MP4, MOV, WebP, etc.)
- Provides a functional web gallery through simple endpoints
- No need to rename original files
- REST API for programmatic usage
- Built entirely with Node.js + Express

## Tech Stack

- Node.js
- Express.js
- file-type (MIME detection from buffer)
- Native FS and Path modules

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your extensionless files

Create a folder named `uploads` (or the folder defined in `folderPath` inside your code), and place all the unknown/no-extension files inside it:

```
/uploads
    123456
    IMG_9912
    776512
    fileA
```

### 4. Start the server

```bash
node index.js
```

### 5. Open in your browser

```
http://localhost:3000/imagenes
```

## Project Structure

```
├── index.js
├── package.json
├── uploads/              # Your raw media files without extensions
└── README.md
```

## API Endpoints

### GET /imagenes

Returns a JSON list of all detected image/video files.

**Example response:**

```json
[
  {
    "nombre": "123456",
    "tipo": "image/jpeg",
    "esImagen": true
  },
  {
    "nombre": "78910",
    "tipo": "video/mp4",
    "esImagen": false
  }
]
```

### GET /archivo/:nombre

Serves a single file with the correct MIME type.

**Example:**

```
http://localhost:3000/archivo/123456
```

## How It Works

Many mobile apps and backup systems store media files without extensions. This project uses the `file-type` package to detect the real MIME type by inspecting the binary signature (magic numbers) of each file.

The server then:

1. Identifies whether the file is an image or video
2. Exposes it via a clean API
3. Allows immediate viewing in a browser without renaming anything

This makes it ideal for restoring large collections of lost photos or videos.

## Using the Web Gallery

The `/imagenes` endpoint gives you the metadata you need to render a gallery.

**Example usage:**

```html
<img src="http://localhost:3000/archivo/123456" />
```

```html
<video controls>
  <source src="http://localhost:3000/archivo/78910" type="video/mp4" />
</video>
```

You can build a custom interface on top of this or use simple HTML.

## Limitations

- Does not recover corrupted files
- Cannot decrypt files encrypted by apps (e.g., Snapchat's internal encrypted cache)
- Intended for local use only, not for public hosting

## Roadmap

- Add EXIF extraction and sorting by date
- Add optional batch renaming with correct extensions
- Add a complete Photo Gallery UI
- Add caching to speed up MIME detection for large folders

## Contributing

Contributions are welcome. Feel free to open an Issue or submit a Pull Request.

## License

MIT License.
