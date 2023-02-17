import AWS from "aws-sdk";
import { SQSEvent } from "aws-lambda";
import { handler } from "../src/sendSmsHandler";

jest.mock('aws-sdk', () => {
  const mockedSNS = {
    setSMSAttributes: jest.fn().mockReturnThis(),
    publish: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return { SNS: jest.fn(() => mockedSNS) };
});

const event = {
  Records: [
    {
      body: JSON.stringify({
        phoneNumber: "+447865346733",
        message: "Some message 1",
      }),
    },
    {
      body: JSON.stringify({
        phoneNumber: "+447865346734",
        message: "Some message 2",
      }),
    }
  ],
} as SQSEvent;

describe("sendSmsHandler", () => {
  process.env.SEND_SMS_SNS_ARN = "test-arn";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should set SMS attributes in SNS", async () => {
    const sns = new AWS.SNS();

    await handler(event);

    const expectedAttributeParams = {
      attributes: {
        DefaultSMSType: "Promotional"
      }
    };

    expect(sns.setSMSAttributes).toHaveBeenCalledTimes(2);
    expect(sns.setSMSAttributes).toHaveBeenCalledWith(expectedAttributeParams);
  });

  it("should publish message to SNS", async () => {
    const sns = new AWS.SNS();

    await handler(event);

    const expectedPublishParams1 = {
      Message: event.Records[0].body,
      TopicArn: process.env.SEND_SMS_SNS_ARN,
    };

    const expectedPublishParams2 = {
      Message: event.Records[1].body,
      TopicArn: process.env.SEND_SMS_SNS_ARN,
    };

    expect(sns.publish).toHaveBeenCalledTimes(2);
    expect(sns.publish).toHaveBeenCalledWith(expectedPublishParams1);
    expect(sns.publish).toHaveBeenCalledWith(expectedPublishParams2);
  });

  it("should return a 200 success response", async () => {
    expect(await handler(event)).toEqual({
        statusCode: 200,
        body: JSON.stringify({
          message: "Lambda executed successfully!",
        }),
    });
  });
});
