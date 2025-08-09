import { networkConfig } from "./network";
import { AppConfig } from "../types/NetworkTypes";
import * as constants from "./constants";

export * from "../types/NetworkTypes";

export const appConfig: AppConfig & {
  constants: typeof constants;
} = {
  networks: networkConfig,
  constants,
};
