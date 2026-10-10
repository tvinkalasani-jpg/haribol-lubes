type StagingEnvironment = Record<string, string | undefined>;

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  let difference = leftBytes.length ^ rightBytes.length;
  const length = Math.max(leftBytes.length, rightBytes.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return difference === 0;
}

export function isStagingAccessAuthorized(authorization: string | null, environment: StagingEnvironment = process.env): boolean {
  if (environment.DEPLOYMENT_ENVIRONMENT !== "staging") return true;
  const expectedUser = environment.STAGING_ACCESS_USERNAME;
  const expectedPassword = environment.STAGING_ACCESS_PASSWORD;
  if (!expectedUser || !expectedPassword || !authorization?.startsWith("Basic ")) return false;
  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;
    return constantTimeEqual(decoded.slice(0, separator), expectedUser)
      && constantTimeEqual(decoded.slice(separator + 1), expectedPassword);
  } catch {
    return false;
  }
}
