import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import swaggerUi from "swagger-ui-express";
import { registry } from "./zodOpenApi.js";

// Basic Bearer Auth Security Scheme
const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// Import validations to register routes
import "../validations/userValidations.js";
import "../validations/tripValidations.js";
import "../validations/driverValidations.js";
import "../validations/passengerValidations.js";
import "../validations/vehicleValidations.js";
import "../validations/paymentValidations.js";

export const setupSwagger = (app) => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const document = generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Rydroo API - Zod Validated",
      description: "API documentation automatically generated from Zod schemas",
    },
    servers: [{ url: "http://localhost:5000" }, { url: "https://rydroo.onrender.com" }],
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(document));
  
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(document);
  });

  console.log("Swagger Docs available at http://localhost:5000/api-docs");
};
