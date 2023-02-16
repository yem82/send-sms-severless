import AWS from "aws-sdk";
import { APIGatewayEvent } from "aws-lambda";
import { PublishInput } from "aws-sdk/clients/sns";
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'publishMessageDetailsToSNS' });
const sns = new AWS.SNS();

export type HandlerEvent = Pick<APIGatewayEvent, "body">;

export const handler = async (event: HandlerEvent) => {
  const params: PublishInput = {
    Message:  event.body || "",
    TopicArn: process.env.PUBLISHED_MESSAGE_DETAILS_SNS_ARN,
  };

  await sns.publish(params).promise();
  logger.info("message published to SNS")

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Lambda executed successfully!",
    }),
  };
};
