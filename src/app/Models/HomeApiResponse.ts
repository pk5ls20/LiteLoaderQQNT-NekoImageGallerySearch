import { NekoProtocol } from "./ApiResponse";

export interface HomeAuthorizationResponse {
  required: boolean;
  passed: boolean;
}

export interface AdminAuthorizationRespose {
  available: boolean;
  passed: boolean;
}

export interface HomeApiResponse extends NekoProtocol {
  server_time: Date;
  wiki: Map<string, string>;
  authorization: HomeAuthorizationResponse;
  admin_api: AdminAuthorizationRespose;
  available_basis: string[];
}
