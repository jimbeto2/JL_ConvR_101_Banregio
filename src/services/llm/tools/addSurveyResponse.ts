import { google } from "googleapis";
import { JWT } from "google-auth-library";

import { config } from "../../../config";

export interface AddSurveyResponseParams {
  customerPhone: string;
  inGeneral: string;
  lastService: string;
  lastDriver: string;
  observations?: string;
}

export async function addSurveyResponse(params: AddSurveyResponseParams): Promise<string> {
  console.log("Adding Survey Response", params);

  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  : require("../../../keys/googleapis-service-account.json");

  // Auth setup
  const auth = new google.auth.GoogleAuth({
    credentials, 
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = (await auth.getClient()) as JWT;

  const sheets = google.sheets({ version: "v4", auth: authClient });

  const spreadsheetId = config.google.spreadsheetId;
  const range = "Surveys!A1:E1"; // We'll append after the header row

  // Append the new row
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          params.customerPhone,
          params.inGeneral,
          params.lastService,
          params.lastDriver,
          params.observations || ""
        ]
      ]
    },
  });

  return "Survey response recorded successfully.";
}
