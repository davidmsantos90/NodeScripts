const { spawn } = require('child_process')

const flags = '-rf'
const folder = './dist'

const rm = spawn('rm', [flags, folder])

rm.on('exit', (status) => {
  if (status !== 0) console.log(`[ERROR] rm: failed to delete '${folder}'`)
  else console.log(`[INFO] rm: deleted '${folder}'`)
})
