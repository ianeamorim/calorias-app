import Dashboard from "@/components/Dashboard";
import { DAILY_GOALS } from "@/lib/config";

export default function Home() {
  return <Dashboard goals={DAILY_GOALS} />;
}
