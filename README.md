# FH8616 IoT Camera Platform
Low-cost IoT camera streaming and recording lab using cheap IP cameras and Android (Termux) as an edge server. Handles RTSP real-time streaming, local/remote access, and video storage with lightweight tools like BusyBox and Node.js for experimental edge computing and self-hosted media pipelines.

## 📁 Packages

- **exploit/** - Shell scripts for user bypass, telnet access, and FH8616 exploitation testing
- **server/** - Node.js backend on Termux for camera API, file management, and RTSP/ONVIF control
- **client/** - React frontend to view the stream, control the camera, and manage stored content
- **camera-scripts/** - Scripts to copy to the SD card and run directly on the camera (init, maintenance, automation)

---

MIT
