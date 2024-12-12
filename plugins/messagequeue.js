'use strict';

const fp = require('fastify-plugin');
const { ServiceBusClient } = require('@azure/service-bus');
const { DefaultAzureCredential } = require('@azure/identity');

module.exports = fp(async function (fastify, opts) {
  fastify.decorate('sendMessage', async function (message) {
    const body = message.toString();

    if (process.env.ORDER_QUEUE_USERNAME && process.env.ORDER_QUEUE_PASSWORD) {
      // Deprecated rhea-based logic (if no longer needed)
      console.log('Legacy RabbitMQ support is no longer enabled.');
      return;
    }

    if (process.env.USE_WORKLOAD_IDENTITY_AUTH === 'true') {
      // Azure Service Bus logic
      const fullyQualifiedNamespace = process.env.ORDER_QUEUE_HOSTNAME || process.env.AZURE_SERVICEBUS_FULLYQUALIFIEDNAMESPACE;
      const queueName = process.env.ORDER_QUEUE_NAME;

      if (!fullyQualifiedNamespace || !queueName) {
        console.error('Missing required Azure Service Bus environment variables.');
        return;
      }

      console.log(`Sending message to ${queueName} on ${fullyQualifiedNamespace} using Microsoft Entra ID Workload Identity credentials.`);

      const credential = new DefaultAzureCredential();

      try {
        const sbClient = new ServiceBusClient(fullyQualifiedNamespace, credential);
        const sender = sbClient.createSender(queueName);

        // Sending the message
        await sender.sendMessages({ body });

        console.log(`Message sent successfully: ${body}`);

        // Cleanup
        await sender.close();
        await sbClient.close();
      } catch (error) {
        console.error(`Failed to send message: ${error.message}`);
      }
    } else {
      console.error('No credentials set for message queue. Exiting.');
    }
  });
});
