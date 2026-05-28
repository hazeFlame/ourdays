import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextVitals, ...nextTypescript];

eslintConfig.push({
	ignores: [".next/**", ".wrangler/**", "cloudflare-env.d.ts"],
});

export default eslintConfig;
