import { z, registry } from "../config/zodOpenApi.js";

// Schemas
const signupBodySchema = z.object({
  firstName: z.string().min(2).openapi({ example: "John" }),
  lastName: z.string().min(2).openapi({ example: "Doe" }),
  phoneNumber: z.string().openapi({ example: "+201012345678" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
  password: z.string().min(8).openapi({ example: "Password123!" }),
  confirmPassword: z.string().min(8).openapi({ example: "Password123!" }),
  role: z.enum(["admin", "user", "driver"]).default("user").openapi({ example: "user" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signupSchema = z.object({
  body: signupBodySchema,
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
