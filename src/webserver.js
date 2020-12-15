import express from 'express'
import { Log } from '@worthy-npm/worthy-logger'

let server

export async function initWebServer() {
	const app = express()
	const port = process.env.PORT
	app.use(express.json())

	app.get('/', async (req, res) => {
		res.json({ message: 'ok' })
	})

	return new Promise((resolve) => {
		server = app.listen(port, () => {
			Log.info(`${process.env.SERVICE_NAME} listening at http://localhost:${port}`)
			resolve()
		})
	})
}

export function terminateServer() {
	server.close()
}
