import { trpc } from "~/utils/trpc";
import { ConnectCamera } from "../connectCamera/connectCamera";

const Home: React.FC = () => {
  return (
    <div>
      <ConnectCamera />
    </div>
  );
};

export default Home;
