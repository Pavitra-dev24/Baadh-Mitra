import { useEffect, useState, useCallback } from "react";
import { api } from "./api";
import AlertBanner from "./components/AlertBanner";
import HouseholdPanel from "./components/HouseholdPanel";
import ChecklistPanel from "./components/ChecklistPanel";
import DistrictSwitcher from "./components/DistrictSwitcher";

export default function App() {
  const [districts, setDistricts] = useState([]);
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [alert, setAlert] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  // Initial load
  useEffect(() => {
    api
      .listDistricts()
      .then((ds) => {
        setDistricts(ds);
        if (ds.length) setActiveDistrict(ds[0].id);
        else setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const loadDistrictData = useCallback(async (districtId) => {
    setLoading(true);
    try {
      const [hh, activeAlert] = await Promise.all([
        api.listHouseholds(districtId),
        api.getActiveAlert(districtId),
      ]);
      setHouseholds(hh);
      setAlert(activeAlert);
      if (activeAlert) {
        const items = await api.getChecklist(activeAlert.id);
        setChecklist(items);
        setProgress(await api.getProgress(activeAlert.id));
      } else {
        setChecklist([]);
        setProgress(null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeDistrict) loadDistrictData(activeDistrict);
  }, [activeDistrict, loadDistrictData]);

  const refreshChecklist = async (alertId) => {
    const items = await api.getChecklist(alertId);
    setChecklist(items);
    setProgress(await api.getProgress(alertId));
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const newAlert = await api.simulateAlert(activeDistrict);
      setAlert(newAlert);
      setRegenerating(true);
      const items = await api.generateChecklist(newAlert.id);
      setChecklist(items);
      setProgress(await api.getProgress(newAlert.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setSimulating(false);
      setRegenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!alert) return;
    setRegenerating(true);
    try {
      const items = await api.generateChecklist(alert.id);
      setChecklist(items);
      setProgress(await api.getProgress(alert.id));
    } finally {
      setRegenerating(false);
    }
  };

  const handleCreateHousehold = async (data) => {
    await api.createHousehold(activeDistrict, data);
    setHouseholds(await api.listHouseholds(activeDistrict));
  };

  const handleDeleteHousehold = async (id) => {
    await api.deleteHousehold(id);
    setHouseholds(await api.listHouseholds(activeDistrict));
  };

  const handleMark = async (itemId, status) => {
    await api.updateChecklistItem(itemId, status);
    if (alert) await refreshChecklist(alert.id);
  };

  const handleCreateDistrict = async (data) => {
    const d = await api.createDistrict(data);
    setDistricts((ds) => [...ds, d]);
    setActiveDistrict(d.id);
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-slate text-paper relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl tracking-tight">Baadh Mitra</h1>
            <p className="text-xs text-paper/50 font-mono mt-0.5">
              flood relay coordinator · volunteer edition
            </p>
          </div>
          {districts.length > 0 && (
            <DistrictSwitcher
              districts={districts}
              activeId={activeDistrict}
              onSelect={setActiveDistrict}
              onCreate={handleCreateDistrict}
            />
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-brick/40 bg-brick/5 text-brick text-sm px-4 py-3">
            Couldn't reach the Baadh Mitra API ({error}). Confirm VITE_API_URL points at a running
            backend.
          </div>
        )}

        {loading && !error && (
          <p className="text-sm text-ink/50 font-mono">Loading district data…</p>
        )}

        {!loading && !error && districts.length === 0 && (
          <div className="rounded-lg border border-line bg-white/60 p-8 text-center">
            <p className="font-display text-lg">No areas set up yet</p>
            <p className="text-sm text-ink/60 mt-1">
              Run the backend seed script (<code className="font-mono">python -m app.seed</code>)
              for demo data, or add an area from the header once one exists.
            </p>
          </div>
        )}

        {!loading && !error && activeDistrict && (
          <>
            <AlertBanner alert={alert} onSimulate={handleSimulate} simulating={simulating} />

            <div className="grid md:grid-cols-2 gap-6">
              <HouseholdPanel
                households={households}
                onCreate={handleCreateHousehold}
                onDelete={handleDeleteHousehold}
              />
              <ChecklistPanel
                items={checklist}
                progress={progress}
                onMark={handleMark}
                onRegenerate={handleRegenerate}
                regenerating={regenerating}
              />
            </div>
          </>
        )}

        <footer className="text-center text-xs text-ink/40 font-mono pt-4">
          Portfolio project · flood-alert data is simulated, not a live Google Flood Hub feed ·
          not affiliated with Google
        </footer>
      </main>
    </div>
  );
}
