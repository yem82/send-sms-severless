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
  process.env.PUBLISHED_MESSAGE_DETAILS_SNS_ARN = "test-arn";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Happy path", () => {
    it("should publish correct params to SNS", async () => {
      const sns = new AWS.SNS();

      const event = {
        body: JSON.stringify({
          phoneNumber: "+447865346733",
          message: "Hello world"
        }),
      };

      await handler(event);

      const expectedParams = {
        Message: event.body,
        TopicArn: process.env.PUBLISHED_MESSAGE_DETAILS_SNS_ARN
      };

      expect(sns.publish).toHaveBeenCalledTimes(1);
      expect(sns.publish).toHaveBeenCalledWith(expectedParams);
    });

    it("should return a 200 success response", async () => {
      const event = {
        body: JSON.stringify({
          phoneNumber: "+447865346733",
          message: "Hello world"
        }),
      };

      expect(await handler(event)).toEqual({
        statusCode: 200,
        body: JSON.stringify({
          message: "Lambda executed successfully!",
        }),
      });
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
        ${"+447345375423"} | ${" "}
        ${undefined}       | ${"Some message"}
        ${" "}             | ${"Some message"}
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