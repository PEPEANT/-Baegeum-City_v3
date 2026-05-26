export function getRuntimeState(root = globalThis) {
  return runtimeHost(root).BaegeumCity || {};
}

export function patchRuntimeState(patch, root = globalThis) {
  const host = runtimeHost(root);
  host.BaegeumCity = { ...(host.BaegeumCity || {}), ...(patch || {}) };
  return host.BaegeumCity;
}

export function getRuntimeGame(root = globalThis) {
  return getRuntimeState(root).game || null;
}

export function getRuntimeEconomy(root = globalThis) {
  return getRuntimeState(root).economy || null;
}

export function getRuntimeExchangeAtm(root = globalThis) {
  return getRuntimeState(root).exchangeAtm || null;
}

function runtimeHost(root) {
  return root?.window || root || {};
}
