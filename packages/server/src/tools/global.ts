export const wait = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export const getRtspLinkByIp = (ip: string) =>
  `rtsp://admin:admin123456@${ip}:8554/profile1`;
