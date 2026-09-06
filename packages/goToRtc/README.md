# goToRtc

[go2rtc](https://github.com/AlexxIT/go2rtc) is used to pull the camera RTSP
feeds and restream them to the browser (WebRTC / HLS / MSE). The server spawns
the binary that matches `PROC_ARCHITECTURE`.

Binaries and the live config are git-ignored. To set up:

```sh
cd packages/goToRtc

# 1. config
cp go2rtc.yaml.example go2rtc.yaml   # then edit stream URLs

# 2. binary for your arch (see go2rtc releases)
curl -L -o go2rtc_linux_amd64 https://github.com/AlexxIT/go2rtc/releases/latest/download/go2rtc_linux_amd64
chmod +x go2rtc_linux_amd64
# or go2rtc_linux_arm / go2rtc_linux_arm64
```

Expected filenames: `go2rtc_linux_amd64`, `go2rtc_linux_arm`, `go2rtc_linux_arm64`.
