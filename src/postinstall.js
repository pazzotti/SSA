const replace = require("replace-in-file");

const options = {
  files: "node_modules/maplibre-gl/dist/maplibre-gl.d.ts",
  from: /export type \* from "@maplibre\/maplibre-gl-style-spec";/g,
  to: "",
};

try {
  const changes = replace.sync(options);
  console.log("Changes made:", changes.join(", "));
} catch (error) {
  console.error("Error occurred:", error);
}
