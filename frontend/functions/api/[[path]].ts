// Keep routing separate from the tested proxy; test files must not become Pages routes.
export { onRequest } from "../../src/platform/api-proxy";
