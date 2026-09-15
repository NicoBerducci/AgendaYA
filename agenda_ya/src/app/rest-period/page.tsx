import { RestPeriodConfig } from '@/components/RestPeriodConfig/RestPeriodConfig';

export default function RestPeriodPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Demostración Visual: US_019 - Configurar Descanso entre Reservas
        </h1>
        <RestPeriodConfig />
      </div>
    </main>
  );
}
