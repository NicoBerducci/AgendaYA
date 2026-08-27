'use client';

import React, { useState } from 'react';
import { LIGHT, DARK, FONT } from '@/components/ui/theme';
import { RestPeriodConfig } from '@/components/RestPeriodConfig/RestPeriodConfig';
import { BlockDayConfig } from '@/components/BlockDayConfig/BlockDayConfig';
import { IntervalManagement } from '@/components/IntervalManagement/IntervalManagement';
import { ReservationLimitConfig } from '@/components/ReservationLimitConfig/ReservationLimitConfig';
import { WorkDayConfig } from '@/components/WorkDayConfig/WorkDayConfig';
import { PublicBookingSection } from '@/components/PublicBooking/PublicBookingSection';

export default function Home() {
  const [oscuro, setOscuro] = useState(false);
  const [activeTab, setActiveTab] = useState('CP_001_002');
  
  const T = oscuro ? DARK : LIGHT;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: T.appBg, fontFamily: FONT }}>
      {/* TOPBAR */}
      <div style={{ height: 56, background: T.topbar, display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ color: T.topbarText, cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </div>
          <div style={{ color: T.topbarText, fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>AgendaYa</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ color: '#FCD34D', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          </div>
          <div style={{ color: '#93C5FD', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* SIDEBAR */}
        <div style={{ width: 280, background: T.side, display: 'flex', flexDirection: 'column', overflowY: 'auto', borderRight: `1px solid ${T.line}` }}>
          <div style={{ padding: '20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, color: T.text, fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, background: T.topbar, borderRadius: '50%' }}></div>
                AgendaYa
              </div>
              <span style={{ color: T.muted, cursor: 'pointer' }}>⋮</span>
            </div>
            
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 0.5, marginBottom: 12 }}>MAIN</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['Perfil', 'Gestión de Tipos de Eventos', 'Gestión de Agenda y Reservas'].map(item => (
                <div key={item} style={{ padding: '8px 12px', fontSize: 13.5, color: T.text, cursor: 'pointer', borderRadius: 6 }}>
                  {item}
                </div>
              ))}
              
              <div style={{ background: T.sideActive, color: '#0B2A20', padding: '8px 12px', fontSize: 13.5, fontWeight: 600, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                Gestión de Disponibilidad
                <span>▴</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 12, marginTop: 4 }}>
                <div style={{ padding: '6px 12px', fontSize: 12.5, color: T.text, cursor: 'pointer', borderRadius: 6, lineHeight: 1.4 }}>
                  Configuración de horarios laborales — Definición de intervalos entre turnos
                </div>
                <div style={{ background: T.sideSub, color: '#0B2A20', padding: '6px 12px', fontSize: 12.5, fontWeight: 600, borderRadius: 6, cursor: 'pointer', lineHeight: 1.4 }}>
                  Bloqueo y Desbloqueo de días
                </div>
                <div style={{ padding: '6px 12px', fontSize: 12.5, color: T.muted, cursor: 'pointer', borderRadius: 6, lineHeight: 1.4 }}>
                  Antelación mínima de reserva...<br/>Límite máximo de reservas por día
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: 0.5, marginTop: 24, marginBottom: 12 }}>CONFIGURACIÓN</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['Notificaciones', 'Ajustes'].map(item => (
                <div key={item} style={{ padding: '8px 12px', fontSize: 13.5, color: T.text, cursor: 'pointer', borderRadius: 6 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', padding: 16 }}>
            <div style={{ display: 'flex', background: T.surface, borderRadius: 20, border: `1px solid ${T.lineStrong}`, overflow: 'hidden' }}>
              <button onClick={() => setOscuro(false)} style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, background: !oscuro ? T.sideActive : 'transparent', color: !oscuro ? '#0B2A20' : T.muted, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                ☀ Claro
              </button>
              <button onClick={() => setOscuro(true)} style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, background: oscuro ? T.sideActive : 'transparent', color: oscuro ? '#0B2A20' : T.muted, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                ☾ Oscuro
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, borderBottom: `1px solid ${T.line}`, paddingBottom: 16 }}>
            {[
              { id: 'CP_001_002', label: 'CP_001_002 - Jornada' },
              { id: 'CP_005', label: 'CP_005 - Bloqueo de días' },
              { id: 'CP_006', label: 'CP_006 - Intervalos' },
              { id: 'CP_007_008', label: 'CP_007_008 - Descansos' },
              { id: 'CP_009_010', label: 'CP_009_010 - Límite reservas' },
              { id: 'CP_011_012', label: 'CP_011_012 - Reserva pública (Mobile)' },
              { id: 'CP_013_014', label: 'CP_013_014 - Confirmación de reserva' },
              { id: 'public', label: 'Agenda pública' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  background: activeTab === tab.id ? T.sideActive : 'transparent',
                  color: activeTab === tab.id ? '#0B2A20' : T.muted,
                  border: `1px solid ${activeTab === tab.id ? T.mark : 'transparent'}`,
                  borderRadius: 20,
                  padding: '6px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ maxWidth: 1000 }}>
            {activeTab === 'CP_001_002' && <WorkDayConfig theme={T} />}
            {activeTab === 'CP_005' && <BlockDayConfig targetDateStr="2026-09-01" theme={T} />}
            {activeTab === 'CP_006' && <IntervalManagement theme={T} />}
            {activeTab === 'CP_007_008' && <RestPeriodConfig theme={T} />}
            {activeTab === 'CP_009_010' && <ReservationLimitConfig theme={T} />}
            {activeTab === 'CP_011_012' && <PublicBookingSection targetDateStr="2026-09-02" theme={T} initialSubTab="CP_011" />}
            {activeTab === 'CP_013_014' && <PublicBookingSection targetDateStr="2026-09-02" theme={T} initialSubTab="CP_013_014" />}
            {activeTab === 'public' && (
               <div style={{ padding: 24, background: T.surface, borderRadius: 8, border: `1px solid ${T.line}` }}>
                 <h2 style={{ fontSize: 24, color: T.text, margin: '0 0 16px 0' }}>Agenda Pública</h2>
                 <p style={{ color: T.muted }}>Vista simulada de la agenda pública para los usuarios invitados.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
