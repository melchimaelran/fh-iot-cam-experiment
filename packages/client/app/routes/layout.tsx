import { Outlet } from "react-router";
import Navbar from "~/components/navbar/navbar";
import Container from "~/components/ui/custom/Container";

export default function LayoutRoute() {
  return (
    <>
      <Container>
        <div className="p-3 flex flex-col gap-5">
          <Navbar />
          <Outlet />
        </div>
      </Container>
    </>
  );
}
