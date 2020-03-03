import { promisify } from 'util'
import { exec as execAsync, execSync } from 'child_process'
import { join } from 'path'

const exec = promisify(execAsync)

const POSITION_SCRIPT = join(__dirname, 'position.sh')

const parsePosition = (position) => {
  if (position == null || position === '') throw new Error('position was undefined')

  return JSON.parse(position)
}

export const get = async () => {
  const { stdout: position, stderr = '' } = await exec(POSITION_SCRIPT)
  if (stderr !== '') throw new Error(stderr)

  return parsePosition(position)
}

export const getSync = () => {
  const position = execSync(POSITION_SCRIPT)

  return parsePosition(position)
}

export default {
  get, getSync
}
