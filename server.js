'use strict'

const Fastify = require('fastify')
const app = require('./app')

async function start() {
  const fastify = Fastify({
    logger: true
  })

  // Register the application defined in app.js
  await fastify.register(app)

  // Start the server on port 3000 and host 0.0.0.0
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    fastify.log.info(`Server running on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
