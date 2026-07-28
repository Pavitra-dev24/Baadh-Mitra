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
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Carbon's "UI Shell" header (used across IBM Cloud / product consoles) -
          dark inverse-canvas bar, not the light marketing top-nav, since this
          app is a product surface rather than a marketing page. */}
      <header className="bg-inverse-canvas text-inverse-ink relative">
        <div className="max-w-6xl mx-auto px-lg py-md flex items-center justify-between">
          <div>
            <h1 className="text-subhead font-normal tracking-tight">Baadh Mitra</h1>
            <p className="text-caption text-inverse-ink-muted font-mono mt-xxs">
              Flood relay coordinator · Volunteer edition
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

      <main className="max-w-6xl mx-auto px-lg py-lg space-y-lg flex-1 w-full">
        {error && (
          <div
            className="rounded-none bg-canvas border border-hairline p-md text-body-sm text-ink"
            style={{ borderLeft: "4px solid #da1e28" }}
          >
            Couldn't reach the Baadh Mitra API ({error}). Confirm VITE_API_URL points at a running
            backend.
          </div>
        )}

        {loading && !error && (
          <p className="text-body-sm text-ink-muted font-mono">Loading district data…</p>
        )}

        {!loading && !error && districts.length === 0 && (
          <div className="rounded-none border border-hairline bg-canvas p-xl text-center">
            <p className="text-card-title font-normal text-ink">No areas set up yet</p>
            <p className="text-body-sm text-ink-muted mt-xs">
              Run the backend seed script (<code className="font-mono">python -m app.seed</code>)
              for demo data, or add an area from the header once one exists.
            </p>
          </div>
        )}

        {!loading && !error && activeDistrict && (
          <>
            <AlertBanner alert={alert} onSimulate={handleSimulate} simulating={simulating} />

            <div className="grid md:grid-cols-2 gap-lg">
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
      </main>

      {/* Carbon footer: the one other surface, besides the header shell, that
          inverts to charcoal - kept slim since there's a single disclaimer
          line rather than a multi-column marketing footer. */}
      <footer className="bg-inverse-canvas text-inverse-ink-muted text-center text-caption font-mono py-md px-lg">
        Flood-alert data is simulated, not a live Google Flood Hub feed ·
        Not affiliated with Google
      </footer>
    </div>
  );
}
