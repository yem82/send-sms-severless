import AWS from "aws-sdk";
import { handler } from "../src/sendSmsHandler";

jest.mock('aws-sdk', () => {
  const mockedSNS = {
    setSMSAttributes: jest.fn().mockReturnThis(),
    publish: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return { SNS: jest.fn(() => mockedSNS) };
});

describe("sendSmsHandler", () => {
  describe("Happy path", () => {
    it("should set SMS attributes in SNS", async () => {
      const sns = new AWS.SNS();

      (sns.setSMSAttributes().promise as jest.Mock).mockResolvedValueOnce({});

      const event = {
        Records: [
          {
            body: JSON.stringify({
              phoneNumber: "07865346733",
              message: "Some message",
            }),
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await handler(event as any);

      const expectedAttributeParams = {
       attributes: {
        DefaultSMSType: "Promotional"
       }
      };

      expect(sns.setSMSAttributes).toHaveBeenCalledWith(expectedAttributeParams);
    });

    it("should publish message to SNS", async () => {
      const sns = new AWS.SNS();

      (sns.publish().promise as jest.Mock).mockResolvedValueOnce({
        MessageId: 'some-message-id',
      });

      const event = {
        Records: [
          {
            body: JSON.stringify({
              phoneNumber: "07865346733",
              message: "Some message",
            }),
          },
        ],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await handler(event as any);

      const expectedPublishParams = {
        Message: event.Records[0].body,
        TopicArn: process.env.SEND_SMS_SNS_ARN,
      };

      expect(sns.publish).toHaveBeenCalledWith(expectedPublishParams);
    });
  });
});
