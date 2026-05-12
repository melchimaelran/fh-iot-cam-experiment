import CameraList from "~/components/cameraList/cameraList";
import type { Route } from "./+types/cameraList";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Camera List" },
    { name: "description", content: "View the list of available cameras." },
  ];
}

export default function CameraListRoute() {
  return <CameraList />;
}
