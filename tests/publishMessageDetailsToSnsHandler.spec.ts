import AWS from "aws-sdk";
import { handler } from "../src/publishMessageDetailsToSnsHandler";

jest.mock('aws-sdk', () => {
  const mockedSNS = {
    publish: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return { SNS: jest.fn(() => mockedSNS) };
});

describe("publishMessageDetailsToSnsHandler", () => {
  describe("Happy path", () => {
    it("should publish correct params to SNS", async () => {
      const sns = new AWS.SNS();
      (sns.publish().promise as jest.Mock).mockResolvedValueOnce({
        MessageId: 'some-message-id',
      });

      const event = {
        body: JSON.stringify({
          phoneNumber: "07865346733",
          message: "Hello world"
        }),
      };

      await handler(event);

      const expectedParams = {
        Message: event.body,
        TopicArn: process.env.PUBLISHED_MESSAGE_DETAILS_SNS_ARN
      };

      expect(sns.publish).toHaveBeenCalledWith(expectedParams);
    });
  });
});