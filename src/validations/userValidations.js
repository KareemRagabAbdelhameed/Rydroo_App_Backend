import { z, registry } from "../config/zodOpenApi.js";

// Schemas
export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2).openapi({ example: "John Doe" }),
    email: z.string().email().openapi({ example: "john@example.com" }),
    password: z.string().min(6).openapi({ example: "password123" }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().openapi({ example: "john@example.com" }),
    password: z.string().min(6).openapi({ example: "password123" }),
  }),
});

// Swagger Route Registration
registry.registerPath({
  method: "post",
  path: "/user/signup",
  tags: ["Users"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: signupSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
    },
    400: {
      description: "Validation error",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/user/login",
  tags: ["Users"],
  summary: "Log in a user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
    },
    401: {
      description: "Unauthorized",
    },
  },
});
