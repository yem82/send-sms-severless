import { handler } from "../src/publishMessageDetailsToSnsHandler";

describe("publishMessageDetailsToSnsHandler", () => {
  describe("Happy path", () => {
    it("should return a 200 response", async() => {
      const event = {} as any

      expect(await handler(event)).toEqual({
          statusCode: 200,
          body: JSON.stringify({
            message: "Lambda executed successfully!",
          }),
        }
      )
    });
  });
});