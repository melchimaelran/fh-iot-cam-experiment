import Home from "~/components/home/home";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    { name: "description", content: "Welcome to the Home page!" },
  ];
}

export default function HomeRoute() {
  return <Home />;
}
