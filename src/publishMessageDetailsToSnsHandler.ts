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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err.name === "BAD_REQUEST_ERROR") {
      return {
        statusCode: err.statusCode,
        body: err.message
      };
    } else {
      throw err;
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateRequestPayload = (event: any) => {
  const body = JSON.parse(event.body);

  if (!body || Object.keys(body).length === 0) {
    throw new BadRequestError("event body is empty");
  }

  if (!body.phoneNumber || !body.message || hasWhiteSpaceAsFieldValue(body) ) {
    throw new BadRequestError("phoneNumber or message is missing from event body");
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasWhiteSpaceAsFieldValue = (body: any) => {
  return /^\s+$/.test(body.phoneNumber) || /^\s+$/.test(body.message)
}