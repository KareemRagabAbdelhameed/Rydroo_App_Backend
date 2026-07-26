import { z, registry } from "../config/zodOpenApi.js";

export const createPaymentIntentSchema = z.object({
  body: z.object({
    amount: z.number().positive().openapi({ example: 100 }),
    currency: z.string().length(3).optional().openapi({ example: "usd" }),
  }).passthrough(),
});

registry.registerPath({
  method: "post",
  path: "/payment",
  tags: ["Payments"],
  summary: "Create a payment intent",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createPaymentIntentSchema.shape.body } } },
  },
  responses: { 200: { description: "Payment intent created" } },
});
