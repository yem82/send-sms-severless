import { APIGatewayEvent } from "aws-lambda";

export type HandlerEvent = Pick<APIGatewayEvent, "body">;
export const handler = async (_event: HandlerEvent) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Lambda executed successfully!",
      }),
    };
};
