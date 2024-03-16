import path from "path";
import { google } from "googleapis";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const IMPERSONATE = "nick@nickhudkins.com";
/**
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize() {
  return new google.auth.GoogleAuth({
    scopes: SCOPES,
    keyFile: CREDENTIALS_PATH,
    clientOptions: {
      subject: IMPERSONATE,
    },
  });
}
