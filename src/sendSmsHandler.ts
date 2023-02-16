import AWS from "aws-sdk";
import { SQSEvent } from "aws-lambda"
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'sendSms' });
const sns = new AWS.SNS();

export const handler = async (event: SQSEvent) => {

  const setSMSAttributesParams = {
    attributes: {
      DefaultSMSType: "Promotional"
     }
  }

  await sns.setSMSAttributes(setSMSAttributesParams).promise()
  logger.info("set SMS attributes in SNS")

  const publishParams = {
    Message: event.Records[0].body,
    TopicArn: process.env.SEND_SMS_SNS_ARN
  };

  await sns.publish(publishParams).promise()
  logger.info("message published to SNS")

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "lambda executed successfully",
        input: event,
      }
    ),
  };
};

