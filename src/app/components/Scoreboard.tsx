import { useStore } from "../store";

export default function Scoreboard() {
  const { score } = useStore();

  return (
    <div className="fixed top-5 left-5 text-white text-2xl">
      Score: {score}
    </div>
  );
}
