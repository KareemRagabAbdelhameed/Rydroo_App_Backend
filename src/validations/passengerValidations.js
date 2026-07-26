import { z, registry } from "../config/zodOpenApi.js";

export const registerPassengerSchema = z.object({
  body: z.object({
    emergencyContact: z.string().optional().openapi({ example: "555-1234" }),
  }).passthrough(),
});

registry.registerPath({
  method: "get",
  path: "/passenger/profile",
  tags: ["Passengers"],
  summary: "Get my passenger profile",
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Passenger profile details" } },
});

registry.registerPath({
  method: "post",
  path: "/passenger/register",
  tags: ["Passengers"],
  summary: "Register passenger profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: registerPassengerSchema.shape.body,
        },
      },
    },
  },
  responses: { 200: { description: "Profile registered" } },
});
