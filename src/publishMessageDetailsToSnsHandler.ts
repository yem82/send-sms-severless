import AWS from "aws-sdk";
import { APIGatewayEvent } from "aws-lambda";
import { PublishInput } from "aws-sdk/clients/sns";
import { Logger } from '@aws-lambda-powertools/logger';
import { BadRequestError } from "./errors";

const logger = new Logger({ serviceName: 'publishMessageDetailsToSNS' });
const sns = new AWS.SNS();

type HandlerEvent = Pick<APIGatewayEvent, "body">;

interface HandlerResponse {
  statusCode: number;
  body: string;
}

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
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

const validateRequestPayload = (event: HandlerEvent) => {
  let data;

  if (event.body) {
    data = JSON.parse(event.body);
  } else {
    throw new BadRequestError("event body is empty");
  }

  if (Object.keys(data).length === 0) {
    throw new BadRequestError("event body is empty");
  }

  if (!data.phoneNumber || !data.message || hasWhiteSpaceAsValue(data)) {
    throw new BadRequestError("phoneNumber or message is missing from event body");
  }
};

interface ParsedEventBody {
  phoneNumber: string;
  message: string;
}

const hasWhiteSpaceAsValue = (data: ParsedEventBody) => {
  return /^\s+$/.test(data.phoneNumber) || /^\s+$/.test(data.message);
};