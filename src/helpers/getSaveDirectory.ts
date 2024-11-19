import os from 'os'
import path from 'path'

export const getSaveDirectory = () => {
  const homeDir = os.homedir()
  if (process.platform === 'win32') {
    return path.join(homeDir, 'AppData', 'Roaming', 'potion-wars')
  } else {
    return path.join(homeDir, '.config', 'potion-wars')
  }
}