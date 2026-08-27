import { useAppState } from '../context/AppStateContext';

export default function ChaosSimulator() {
  const { triggerChaosEvent, resetChaos, triggeredEventIds, chaosSidebarOpen, chaosEvents } = useAppState();

  if (!chaosSidebarOpen) return null;

  return (
    <aside className="chaos-panel">
      <div className="chaos-header">
        <span className="chaos-bolt">⚡</span>
        <h2>Chaos Simulator</h2>
      </div>
      <p className="chaos-desc">
        Test AetherShield's responsive security loops by injecting active threats
        or simulating infrastructure failures.
      </p>

      {chaosEvents.map((evt) => {
        const isTriggered = triggeredEventIds.includes(evt.id);
        return (
          <div className="chaos-card" key={evt.id}>
            <div className="chaos-card-head">
              <h3>{evt.title}</h3>
              <span className={`pill pill-${evt.provider.toLowerCase()}`}>{evt.provider}</span>
            </div>
            <p className="chaos-card-desc">{evt.description}</p>
            <button
              className="chaos-trigger-btn"
              onClick={() => triggerChaosEvent(evt.id)}
              disabled={isTriggered}
            >
              ⚡ {isTriggered ? 'Event Active' : 'Trigger Threat Event'}
            </button>
          </div>
        );
      })}

      {triggeredEventIds.length > 0 && (
        <button className="chaos-reset-btn" onClick={resetChaos}>
          ↺ Reset simulation
        </button>
      )}
    </aside>
  );
}
