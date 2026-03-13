import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
    // OpenNext Cloudflare specific configuration
    // We renamed the assets binding in wrangler.toml to avoid Cloudflare Pages reserved name 'ASSETS'
    assets: {
        binding: "OPEN_NEXT_ASSETS",
    },
});
