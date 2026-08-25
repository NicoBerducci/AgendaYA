import { RestPeriodConfig } from "@/components/RestPeriodConfig/RestPeriodConfig";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-8 font-sans">
      <main className="flex flex-col items-center justify-center w-full max-w-xl p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md gap-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 text-center">
          AgendaYA — Configuración de Descansos
        </h1>
        <RestPeriodConfig />
      </main>
    </div>
  );
}

