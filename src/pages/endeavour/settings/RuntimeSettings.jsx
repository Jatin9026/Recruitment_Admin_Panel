import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Plus, RefreshCw, Save } from "lucide-react";
import { endeavourApiClient } from "../../../utils/endeavourApiConfig";

const defaultDraft = {
  key: "",
  value: "",
  data_type: "string",
  setting_group: "general",
  description: "",
  is_public: false,
};

const parseValueByType = (value, dataType) => {
  switch (dataType) {
    case "number": {
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        throw new Error("Value must be a valid number");
      }
      return parsed;
    }
    case "boolean": {
      if (value === true || value === false) {
        return value;
      }
      if (value === "true") {
        return true;
      }
      if (value === "false") {
        return false;
      }
      throw new Error("Boolean value must be true or false");
    }
    case "json": {
      if (typeof value !== "string") {
        return value;
      }
      return JSON.parse(value);
    }
    case "string":
    default:
      return String(value ?? "");
  }
};

export default function RuntimeSettings() {
  const [settings, setSettings] = useState([]);
  const [draft, setDraft] = useState(defaultDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSettings = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError("");
      const response = await endeavourApiClient.getSettings();
      const list = response?.data?.settings || [];
      setSettings(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Unable to fetch runtime settings");
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const settingsCount = useMemo(() => settings.length, [settings]);

  const updateSettingField = (index, key, value) => {
    setSettings((prev) =>
      prev.map((setting, idx) => (idx === index ? { ...setting, [key]: value } : setting))
    );
  };

  const handleAddDraft = () => {
    if (!draft.key.trim()) {
      setError("Setting key is required");
      return;
    }

    setSettings((prev) => [
      ...prev,
      {
        ...draft,
        key: draft.key.trim(),
      },
    ]);
    setDraft(defaultDraft);
    setError("");
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = settings.map((setting) => {
        const normalizedType = setting?.data_type || "string";
        return {
          key: String(setting?.key || "").trim(),
          value: parseValueByType(setting?.value ?? "", normalizedType),
          data_type: normalizedType,
          setting_group: setting?.setting_group || "general",
          description: setting?.description || "",
          is_public: Boolean(setting?.is_public),
        };
      });

      payload.forEach((item) => {
        if (!item.key) {
          throw new Error("Each setting must have a key");
        }
      });

      const response = await endeavourApiClient.upsertSettings(payload);
      setSuccess(response?.message || "Settings updated successfully");
      await fetchSettings(false);
    } catch (err) {
      setError(err?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Runtime Settings</h1>
            <p className="mt-1 text-sm text-slate-600">Integrated with GET and PUT /api/v1/admin/settings</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchSettings(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Total Settings: <span className="font-semibold">{settingsCount}</span>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Public</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-emerald-600" />
                    Loading settings...
                  </td>
                </tr>
              ) : settings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No settings available.
                  </td>
                </tr>
              ) : (
                settings.map((setting, index) => (
                  <tr key={`${setting.key}-${index}`} className="border-t border-slate-200 text-sm text-slate-700">
                    <td className="px-4 py-3">
                      <input
                        value={setting.key || ""}
                        onChange={(event) => updateSettingField(index, "key", event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value)}
                        onChange={(event) => updateSettingField(index, "value", event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={setting.data_type || "string"}
                        onChange={(event) => updateSettingField(index, "data_type", event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="json">json</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={setting.setting_group || ""}
                        onChange={(event) => updateSettingField(index, "setting_group", event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={setting.description || ""}
                        onChange={(event) => updateSettingField(index, "description", event.target.value)}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(setting.is_public)}
                          onChange={(event) => updateSettingField(index, "is_public", event.target.checked)}
                          className="h-4 w-4"
                        />
                        <span>{setting.is_public ? "true" : "false"}</span>
                      </label>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Add New Setting</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <input
            value={draft.key}
            onChange={(event) => setDraft((prev) => ({ ...prev, key: event.target.value }))}
            placeholder="key"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={draft.value}
            onChange={(event) => setDraft((prev) => ({ ...prev, value: event.target.value }))}
            placeholder="value"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={draft.data_type}
            onChange={(event) => setDraft((prev) => ({ ...prev, data_type: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="json">json</option>
          </select>
          <input
            value={draft.setting_group}
            onChange={(event) => setDraft((prev) => ({ ...prev, setting_group: event.target.value }))}
            placeholder="group"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="description"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_public}
              onChange={(event) => setDraft((prev) => ({ ...prev, is_public: event.target.checked }))}
            />
            is_public
          </label>
        </div>

        <button
          type="button"
          onClick={handleAddDraft}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add to Draft List
        </button>
      </div>
    </div>
  );
}
