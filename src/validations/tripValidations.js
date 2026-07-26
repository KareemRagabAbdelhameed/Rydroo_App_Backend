import { z, registry } from "../config/zodOpenApi.js";

// Schemas
export const createTripSchema = z.object({
  body: z.object({
    startLocation: z.string().openapi({ example: "New York" }),
    endLocation: z.string().openapi({ example: "Boston" }),
    price: z.number().positive().openapi({ example: 50 }),
    seatsAvailable: z.number().int().positive().openapi({ example: 4 }),
    startTime: z.string().datetime().optional().openapi({ example: "2024-05-01T10:00:00Z" }),
  }),
});

export const updateTripSchema = z.object({
  body: z.object({
    price: z.number().positive().optional().openapi({ example: 60 }),
    seatsAvailable: z.number().int().positive().optional().openapi({ example: 3 }),
  }),
});

export const bookTripSchema = z.object({
  body: z.object({
    seatsToBook: z.number().int().positive().openapi({ example: 1 }),
  }),
});

// Swagger Registrations
registry.registerPath({
  method: "get",
  path: "/trips",
  tags: ["Trips"],
  summary: "Get all trips",
  responses: { 200: { description: "A list of trips" } },
});

registry.registerPath({
  method: "get",
  path: "/trips/{tripId}",
  tags: ["Trips"],
  summary: "Get a single trip",
  request: { params: z.object({ tripId: z.string() }) },
  responses: { 200: { description: "Trip details" } },
});

registry.registerPath({
  method: "post",
  path: "/trips",
  tags: ["Trips"],
  summary: "Create a new trip",
  security: [{ bearerAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: createTripSchema.shape.body } } },
  },
  responses: { 201: { description: "Trip created" } },
});

registry.registerPath({
  method: "patch",
  path: "/trips/{tipId}/start",
  tags: ["Trips"],
  summary: "Start a trip",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ tipId: z.string() }) },
  responses: { 200: { description: "Trip started" } },
});

registry.registerPath({
  method: "patch",
  path: "/trips/{tipId}/complete",
  tags: ["Trips"],
  summary: "Complete a trip",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ tipId: z.string() }) },
  responses: { 200: { description: "Trip completed" } },
});

registry.registerPath({
  method: "patch",
  path: "/trips/{tripId}",
  tags: ["Trips"],
  summary: "Update a trip",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ tripId: z.string() }),
    body: { content: { "application/json": { schema: updateTripSchema.shape.body } } },
  },
  responses: { 200: { description: "Trip updated" } },
});

registry.registerPath({
  method: "patch",
  path: "/trips/{tripId}/cancel",
  tags: ["Trips"],
  summary: "Cancel a trip",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ tripId: z.string() }) },
  responses: { 200: { description: "Trip cancelled" } },
});

registry.registerPath({
  method: "patch",
  path: "/trips/{tripId}/book",
  tags: ["Trips"],
  summary: "Book seats for a trip",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ tripId: z.string() }),
    body: { content: { "application/json": { schema: bookTripSchema.shape.body } } },
  },
  responses: { 200: { description: "Seats booked" } },
});
