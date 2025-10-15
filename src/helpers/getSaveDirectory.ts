import os from 'node:os'
import path from 'node:path'

export const getSaveDirectory = () => {
  const homeDirectory = os.homedir()
  if (process.platform === 'win32') {
    return path.join(homeDirectory, 'AppData', 'Roaming', 'potion-wars')
  }

  return path.join(homeDirectory, '.config', 'potion-wars')
}
