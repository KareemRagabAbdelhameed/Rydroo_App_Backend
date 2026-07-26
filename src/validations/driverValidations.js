import { z, registry } from "../config/zodOpenApi.js";

export const createDriverProfileSchema = z.object({
  body: z.object({
    licenseNumber: z.string().openapi({ example: "ABC12345" }),
    yearsOfExperience: z.number().int().openapi({ example: 5 }),
  }).passthrough(),
});

export const registerDriverSchema = z.object({
  body: z.object({
    licenseNumber: z.string().optional().openapi({ example: "ABC12345" }),
  }).passthrough(),
});

registry.registerPath({
  method: "post",
  path: "/driver/createDriverProfile",
  tags: ["Drivers"],
  summary: "Create a driver profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createDriverProfileSchema.shape.body } } },
  },
  responses: { 200: { description: "Profile created" } },
});

registry.registerPath({
  method: "get",
  path: "/driver/getDriverProfile",
  tags: ["Drivers"],
  summary: "Get my driver profile",
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Driver profile details" } },
});

registry.registerPath({
  method: "get",
  path: "/driver/getAvailableDrivers",
  tags: ["Drivers"],
  summary: "Get available drivers",
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "List of drivers" } },
});

registry.registerPath({
  method: "post",
  path: "/driver/register",
  tags: ["Drivers"],
  summary: "Register driver profile with documents",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: registerDriverSchema.shape.body, // In reality, this requires file upload definitions
        },
      },
    },
  },
  responses: { 200: { description: "Driver registered" } },
});
