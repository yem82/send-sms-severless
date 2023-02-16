import AWS from "aws-sdk";
import { APIGatewayEvent } from "aws-lambda";
import { PublishInput } from "aws-sdk/clients/sns";
import { Logger } from '@aws-lambda-powertools/logger';
import { BadRequestError } from "./errors";

const logger = new Logger({ serviceName: 'publishMessageDetailsToSNS' });
const sns = new AWS.SNS();

export type HandlerEvent = Pick<APIGatewayEvent, "body">;

export const handler = async (event: HandlerEvent) => {
  try {
    validateRequestPayload(event);

    const params: PublishInput = {
      Message: event.body || "",
      TopicArn: process.env.PUBLISHED_MESSAGE_DETAILS_SNS_ARN,
    };

    await sns.publish(params).promise();
    logger.info("message published to SNS");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Lambda executed successfully!",
      }),
    };
  } catch (err: any) {
    if (err.isCustomError) {
      return {
        statusCode: err.statusCode,
        body: err.message
      };
    } else {
      throw err;
    }
  }
};

const validateRequestPayload = (event: any) => {
  const body = JSON.parse(event.body);

  if (!body || Object.keys(body).length === 0) {
    throw new BadRequestError("event body is empty");
  }

  if (!body.phoneNumber || !body.message) {
    throw new BadRequestError("phoneNumber or message is missing from event body");
  }
};
