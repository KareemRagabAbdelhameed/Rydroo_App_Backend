import { z, registry } from "../config/zodOpenApi.js";

export const addVehicleSchema = z.object({
  body: z.object({
    make: z.string().openapi({ example: "Toyota" }),
    model: z.string().openapi({ example: "Camry" }),
    year: z.number().int().openapi({ example: 2022 }),
    licensePlate: z.string().openapi({ example: "XYZ-9876" }),
  }).passthrough(),
});

registry.registerPath({
  method: "post",
  path: "/vehicle/addVehicle",
  tags: ["Vehicles"],
  summary: "Add a new vehicle",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: addVehicleSchema.shape.body } } },
  },
  responses: { 201: { description: "Vehicle added" } },
});
