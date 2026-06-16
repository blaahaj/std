import config from "./config.json" with { type: "json" };
import defaultPreferredNodeOrder from "./defaultPreferredNodeOrder.json" with { type: "json" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
config.rules["prefer-property-order"][1] = defaultPreferredNodeOrder as any;

const { extends: e, rules } = config;
export { e as extends, rules };
