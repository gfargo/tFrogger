import { useStdout } from 'ink';
import { useEffect, useState } from 'react';

type Rows = number;
type Columns = number;
export type ScreenDimensions = [Rows, Columns];

export function useStdoutDimensions(): ScreenDimensions {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState<ScreenDimensions>([stdout.columns, stdout.rows]);

  useEffect(() => {
    const handler = () => setDimensions([stdout.columns, stdout.rows]);
    stdout.on('resize', handler);
    return () => {
      stdout.off('resize', handler);
    };
  }, [stdout]);

  return dimensions;
}