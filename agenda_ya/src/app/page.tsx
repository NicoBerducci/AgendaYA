import { RestPeriodConfig } from "@/components/RestPeriodConfig/RestPeriodConfig";
import { BlockDayConfig } from "@/components/BlockDayConfig/BlockDayConfig";
import { IntervalManagement } from "@/components/IntervalManagement/IntervalManagement";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-8 font-sans gap-8">
      <main className="flex flex-col items-center justify-center w-full max-w-4xl p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md gap-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 text-center">
          AgendaYA — Módulos de Configuración
        </h1>
        
        <section className="w-full">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">US_019: Descanso Entre Reservas (CP_007 y CP_008)</h2>
          <RestPeriodConfig />
        </section>

        <section className="w-full">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">US_013 / CP_005: Bloquear un día sin reservas previas</h2>
          <BlockDayConfig />
        </section>

        <section className="w-full">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">US_012 / CP_006: Impedir eliminación de intervalo con reservas activas</h2>
          <IntervalManagement />
        </section>
      </main>
    </div>
  );
}


