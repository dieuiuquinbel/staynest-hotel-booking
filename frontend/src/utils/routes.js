export function buildBookingPath(roomId) {
  return `/booking?roomId=${roomId}`;
}

export function buildLoginRedirectPath(targetPath = '/') {
  return `/auth?mode=login&redirect=${encodeURIComponent(targetPath)}`;
}

export function buildRegisterRedirectPath(targetPath = '/') {
  return `/auth?mode=register&redirect=${encodeURIComponent(targetPath)}`;
}
