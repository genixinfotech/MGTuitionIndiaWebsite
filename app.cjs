'use strict'

// Plesk / Phusion Passenger startup file (CommonJS).
// Keep this as the Application Startup File. It loads the ESM server.
const Passenger = global.PhusionPassenger
if (Passenger) {
  Passenger.configure({ autoInstall: false })
}

import('./server.mjs').catch((error) => {
  console.error(error)
  process.exit(1)
})
