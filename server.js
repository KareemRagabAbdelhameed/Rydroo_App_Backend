import dns from "dns";
import dotenv from "dotenv";

// Local DNS (127.0.0.1) refuses SRV lookups used by mongodb+srv — use public resolvers
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ quiet: true });

const { default: app } = await import("./src/app.js");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
