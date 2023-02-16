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

  describe("Unhappy path", () => {
    describe("when there is no body", () => {
      it("should return a 400 BadRequestError", async () => {
        const event = {
          body: null
        };

        expect(await handler(event)).toEqual({ statusCode: 400, body: "event body is empty" });
      });
    });

    describe("when there is no phone number or message in body", () => {
      it.each`
        phoneNumber        | message
        ${"+447345375423"} | ${undefined}
        ${undefined}       | ${"Some message"}
        ${" "}             | ${"Some message"}
        ${"+447345375423"} | ${" "}
      `(
        "should return a 400 BadRequestError when phone number is $phoneNumber and message is $message",
        async ({ phoneNumber, message }) => {
          const event = {
            body: JSON.stringify({
              phoneNumber,
              message,
            }),
          };

          expect(await handler(event)).toEqual({
            statusCode: 400,
            body: "phoneNumber or message is missing from event body",
          });
        }
      );
    });
  });
});