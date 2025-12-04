import express from "express";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

const app = express();
const folderPath = "./uploads";

// Main route serving the HTML page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Image and Video Gallery</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        h1 {
          text-align: center;
          color: white;
          margin-bottom: 20px;
          font-size: 2.5em;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .stats {
          text-align: center;
          color: white;
          margin-bottom: 30px;
          font-size: 1.2em;
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }
        .stat-item {
          background-color: rgba(255,255,255,0.2);
          padding: 10px 20px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .stat-number {
          font-size: 1.5em;
          font-weight: bold;
        }
        .loading {
          text-align: center;
          color: white;
          font-size: 1.5em;
          margin-top: 50px;
        }
        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .media-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }
        .media-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }
        .media-card img, .media-card video {
          width: 100%;
          height: 250px;
          object-fit: cover;
          cursor: pointer;
        }
        .media-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: rgba(0,0,0,0.7);
          color: white;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.85em;
          font-weight: bold;
        }
        .video-badge {
          background-color: rgba(255,0,0,0.8);
        }
        .image-badge {
          background-color: rgba(0,150,255,0.8);
        }
        .media-info {
          padding: 15px;
        }
        .media-name {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
          word-break: break-all;
        }
        .media-type {
          color: #666;
          font-size: 0.9em;
        }
        
        /* Modal to view image/video in full size */
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.95);
        }
        .modal-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal img, .modal video {
          max-width: 85%;
          max-height: 85%;
          border-radius: 8px;
          user-select: none;
        }
        .close {
          position: absolute;
          top: 20px;
          right: 40px;
          color: white;
          font-size: 45px;
          font-weight: bold;
          cursor: pointer;
          z-index: 1001;
          transition: color 0.3s;
        }
        .close:hover {
          color: #667eea;
        }
        
        /* Navigation buttons */
        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(255,255,255,0.2);
          color: white;
          font-size: 40px;
          padding: 20px 25px;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          transition: background-color 0.3s;
          z-index: 1001;
          user-select: none;
        }
        .nav-button:hover {
          background-color: rgba(255,255,255,0.4);
        }
        .prev {
          left: 20px;
        }
        .next {
          right: 20px;
        }
        
        /* File counter */
        .media-counter {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 18px;
          background-color: rgba(0,0,0,0.5);
          padding: 10px 20px;
          border-radius: 20px;
          z-index: 1001;
        }
        
        /* File name in modal */
        .modal-title {
          position: absolute;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 20px;
          background-color: rgba(0,0,0,0.5);
          padding: 10px 25px;
          border-radius: 20px;
          z-index: 1001;
          max-width: 80%;
          text-align: center;
          word-break: break-word;
        }
      </style>
    </head>
    <body>
      <h1>🖼️ 🎬 My Media Gallery</h1>
      <div class="stats" id="stats">
        <div class="stat-item">
          <div class="stat-number" id="totalCount">0</div>
          <div>Total</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" id="imageCount">0</div>
          <div>Images</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" id="videoCount">0</div>
          <div>Videos</div>
        </div>
      </div>
      <div class="loading">Loading files...</div>
      <div class="gallery" id="gallery"></div>
      
      <!-- Modal to view file in full size -->
      <div id="modal" class="modal">
        <span class="close" onclick="closeModal()">&times;</span>
        <div class="modal-title" id="modalTitle"></div>
        <button class="nav-button prev" onclick="navigateMedia(-1)">&#10094;</button>
        <div class="modal-content" onclick="event.target === this && closeModal()">
          <img id="modalImg" src="" alt="" style="display:none;">
          <video id="modalVideo" controls style="display:none;"></video>
        </div>
        <button class="nav-button next" onclick="navigateMedia(1)">&#10095;</button>
        <div class="media-counter" id="counter"></div>
      </div>

      <script>
        let mediaFiles = [];
        let currentIndex = 0;

        async function loadFiles() {
          try {
            const response = await fetch('/uploads');
            mediaFiles = await response.json();
            
            document.querySelector('.loading').style.display = 'none';
            
            // Count images and videos
            const images = mediaFiles.filter(m => m.isImage).length;
            const videos = mediaFiles.filter(m => !m.isImage).length;
            
            document.getElementById('totalCount').textContent = mediaFiles.length;
            document.getElementById('imageCount').textContent = images;
            document.getElementById('videoCount').textContent = videos;
            
            const gallery = document.getElementById('gallery');
            
            mediaFiles.forEach((media, index) => {
              const card = document.createElement('div');
              card.className = 'media-card';
              
              const badge = media.isImage 
                ? '<span class="media-badge image-badge">📷 Image</span>'
                : '<span class="media-badge video-badge">🎬 Video</span>';
              
              const fileUrl = \`/file/\${encodeURIComponent(media.name)}\`;
              
              if (media.isImage) {
                card.innerHTML = \`
                  \${badge}
                  <img src="\${fileUrl}" alt="\${media.name}" onclick="openModal(\${index})">
                  <div class="media-info">
                    <div class="media-name">\${media.name}</div>
                    <div class="media-type">\${media.type}</div>
                  </div>
                \`;
              } else {
                card.innerHTML = \`
                  \${badge}
                  <video onclick="openModal(\${index})" muted>
                    <source src="\${fileUrl}" type="\${media.type}">
                  </video>
                  <div class="media-info">
                    <div class="media-name">\${media.name}</div>
                    <div class="media-type">\${media.type}</div>
                  </div>
                \`;
              }
              
              gallery.appendChild(card);
            });
          } catch (error) {
            document.querySelector('.loading').textContent = 'Error loading files: ' + error.message;
          }
        }

        function openModal(index) {
          currentIndex = index;
          showMedia();
          document.getElementById('modal').style.display = 'block';
        }

        function closeModal() {
          document.getElementById('modal').style.display = 'none';
          // Pause video if playing
          const video = document.getElementById('modalVideo');
          video.pause();
        }

        function navigateMedia(direction) {
          // Pause current video
          const video = document.getElementById('modalVideo');
          video.pause();
          
          currentIndex += direction;
          
          // Infinite loop
          if (currentIndex >= mediaFiles.length) {
            currentIndex = 0;
          } else if (currentIndex < 0) {
            currentIndex = mediaFiles.length - 1;
          }
          
          showMedia();
        }

        function showMedia() {
          const media = mediaFiles[currentIndex];
          const img = document.getElementById('modalImg');
          const video = document.getElementById('modalVideo');
          
          const fileUrl = \`/file/\${encodeURIComponent(media.name)}\`;
          
          if (media.isImage) {
            img.src = fileUrl;
            img.style.display = 'block';
            video.style.display = 'none';
            video.pause();
          } else {
            video.src = fileUrl;
            video.style.display = 'block';
            img.style.display = 'none';
            video.load();
          }
          
          document.getElementById('modalTitle').textContent = media.name;
          document.getElementById('counter').textContent = \`\${currentIndex + 1} / \${mediaFiles.length}\`;
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
          const modal = document.getElementById('modal');
          if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
              closeModal();
            } else if (e.key === 'ArrowLeft') {
              navigateMedia(-1);
            } else if (e.key === 'ArrowRight') {
              navigateMedia(1);
            }
          }
        });

        loadFiles();
      </script>
    </body>
    </html>
  `);
});

// Route to get list of images and videos
app.get("/uploads", async (req, res) => {
  const files = fs.readdirSync(folderPath);
  const results = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const buffer = fs.readFileSync(filePath);
    const type = await fileTypeFromBuffer(buffer);

    if (
      type &&
      (type.mime.startsWith("image/") || type.mime.startsWith("video/"))
    ) {
      results.push({
        name: file,
        type: type.mime,
        isImage: type.mime.startsWith("image/"),
      });
    }
  }

  res.json(results);
});

// Route to serve individual files
app.get("/file/:name", (req, res) => {
  const filePath = path.join(folderPath, req.params.name);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.sendFile(path.resolve(filePath));
});

app.listen(3000, () => console.log("Server started at http://localhost:3000"));
