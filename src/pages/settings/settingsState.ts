import { systemSettingKeys, type SystemSettingKey, type SystemSettingsValues } from "@/services/endpoints/admin.api";

function equalValues(left: SystemSettingsValues[SystemSettingKey], right: SystemSettingsValues[SystemSettingKey]) {
  if (Array.isArray(left) && Array.isArray(right)) return left.length === right.length && left.every((value, index) => value === right[index]);
  return left === right;
}

export function cloneSystemSettings(values: SystemSettingsValues): SystemSettingsValues {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])) as SystemSettingsValues;
}

export function buildSystemSettingsPatch(saved: SystemSettingsValues, draft: SystemSettingsValues): SystemSettingsValues {
  const patch: SystemSettingsValues = {};
  for (const key of systemSettingKeys) {
    if (!(key in saved) || !(key in draft) || equalValues(saved[key], draft[key])) continue;
    patch[key] = Array.isArray(draft[key]) ? [...draft[key]] : draft[key];
  }
  return patch;
}

export function isSystemSettingsDirty(saved: SystemSettingsValues, draft: SystemSettingsValues) {
  return Object.keys(buildSystemSettingsPatch(saved, draft)).length > 0;
}

export function getSettingsScreenState(query: { isLoading: boolean; isError: boolean }) {
  if (query.isLoading) return "loading";
  if (query.isError) return "error";
  return "content";
}

export async function saveSystemSettingsDraft(
  saved: SystemSettingsValues,
  draft: SystemSettingsValues,
  update: (patch: SystemSettingsValues) => Promise<unknown>,
  refetch: () => Promise<void>,
) {
  const patch = buildSystemSettingsPatch(saved, draft);
  if (!Object.keys(patch).length) return false;
  await update(patch);
  await refetch();
  return true;
}
