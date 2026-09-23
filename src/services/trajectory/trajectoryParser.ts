import Papa from 'papaparse';
import { RawTrajectoryRow, TrajectoryPoint } from '../../types';
import { normalizeTrajectoryRow } from './trajectoryNormalizer';

export interface ParseResult {
  points: TrajectoryPoint[];
  errorCount: number;
  totalParsed: number;
}

/**
 * Parses CSV content into validated, normalized TrajectoryPoint objects using Papa Parse.
 */
export function parseTrajectoryCsv(csvContent: string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const points: TrajectoryPoint[] = [];
    let errorCount = 0;
    let totalParsed = 0;

    Papa.parse<RawTrajectoryRow>(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      chunk: (results: Papa.ParseResult<RawTrajectoryRow>) => {
        const rows = results.data;
        for (let i = 0; i < rows.length; i++) {
          totalParsed++;
          const pt = normalizeTrajectoryRow(rows[i]);
          if (pt) {
            points.push(pt);
          } else {
            errorCount++;
          }
        }
      },
      complete: () => {
        resolve({
          points,
          errorCount,
          totalParsed,
        });
      },
      error: (err: Error) => {
        reject(err);
      },
    });
  });
}
