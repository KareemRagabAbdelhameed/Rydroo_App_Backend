import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

export { z, registry };
