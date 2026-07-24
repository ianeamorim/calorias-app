import Dashboard from "@/components/Dashboard";
import { getGoals } from "@/lib/goals";

// A meta é editável em runtime (sem novo deploy) — evita que o Next
// pré-renderize esta página estaticamente com um valor desatualizado.
export const dynamic = "force-dynamic";

export default async function Home() {
  const goals = await getGoals();
  return <Dashboard initialGoals={goals} />;
}
