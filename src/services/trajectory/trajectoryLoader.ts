/**
 * Fetches the trajectory CSV file from the configured path.
 */
export async function loadTrajectoryCsv(
  url = '/data/trajectories.csv'
): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load trajectory CSV from ${url}: ${response.status} ${response.statusText}`
    );
  }
  return await response.text();
}
