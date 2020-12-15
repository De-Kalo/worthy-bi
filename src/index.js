import { Service } from '@worthy-npm/node-service-bootstrap'
import { Log } from '@worthy-npm/worthy-logger'
import { initWebServer, terminateServer } from './webserver'

async function eventHandler(event) {
	try {
		// This is how we log. the function below can get multiple arguments of any type.
		// To understand our log library go to https://github.com/De-Kalo/worthy-logger/blob/master/README.md
		Log.info('Handling event:', event)
	} catch (err) {
		Service.error('This error will be sent to slack and to rollbar', err)
	}
}

async function init() {
	// This is how we initialize a server with mongo, kafka, express, rollbar, slack.
	// docs at https://github.com/De-Kalo/node-service-bootstrap/blob/master/README.md
	// When using kafka, we use another library called worthy-kafka-client.
	// docs for the kafka library at: https://github.com/De-Kalo/worthy-kafka-client/blob/master/README.md
	const service = Service.init(process.env.SERVICE_NAME) 		// sets the name of the service
		.withMongo(process.env.MONGODB_URI)						// connects to mongo
		.withCustomInitializer(initWebServer, terminateServer)	// initializes web server
		.withRollbar(process.env.ROLLBAR_ACCESS_TOKEN)			// rollbar on Service.error
		.withSlack(process.env.SLACK_WEBHOOK)					// for Service.slack() and messages.
		.withKafka({									// defines kafka initialization.
			consuming: {				// this section defines the topics we want to consume
				TOPIC_NAME: {			// each key is a name of a topic.
					EVENT_NAME: eventHandler,	// key is the name of the event. value is a handler function.
				}
			},
			producing: {				// here we declare the topics we want to produce to.
				TOPIC_NAME: [			// for each topic name we provide a list of event names
					'EVENT_NAME1',		// we want to produce
					'EVENT_NAME2',
				],
			},
		})

	await service.waitReady()
}

init().then(() => {
	Service.slack('Service Started! - sends a slack message')
})
