import credentials from "../credentials-public.json";
import axios from "axios";
import { GoogleCalendar, GoogleCalendarListItem } from "./types";

const SCOPE = "https://www.googleapis.com/auth/calendar";
const OAUTH2_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GCAL_ENDPOINT = "https://www.googleapis.com/calendar/v3";
const SERVICE_ACCOUNT_EMAIL = "google-calendar@org-assistant.iam.gserviceaccount.com";

function getAuthParams(state: string[], redirectUriIndex: number) {
  return {
    client_id: credentials.web.client_id,
    redirect_uri: credentials.web.redirect_uris[redirectUriIndex],
    response_type: "token",
    scope: SCOPE,
    include_granted_scopes: "true",
    state: state.join(" "),
  };
}

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
function oauthSignIn(state: string[], redirectUriIndex: number) {
  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  const form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', OAUTH2_ENDPOINT);

  // Add form parameters as hidden input values.
  Object.entries(getAuthParams(state, redirectUriIndex)).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', name);
    input.setAttribute('value', value);
    form.appendChild(input);
  });

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}

export function shareCalendarAuth(orgId: string) {
  oauthSignIn([orgId], 0);
}

export function editCalendarAuth(orgId: string, calendarId: string) {
  oauthSignIn([orgId, calendarId], 2);
}

export function revokeCalendarAuth(orgId: string, calendarId: string) {
  oauthSignIn([orgId, calendarId], 1);
}

export async function getCalendars(accessToken: string): Promise<GoogleCalendar[]> {
  const response = await axios.get(`${GCAL_ENDPOINT}/users/me/calendarList`, {
    params: { access_token: accessToken },
  });
  const calendars: GoogleCalendarListItem[] = response.data.items;
  return calendars.map(({ id, summary, backgroundColor }) => (
    { id, summary, backgroundColor }
  ));
}

export async function shareCalendar(calendarId: string, accessToken: string) {
  await axios.post(`${GCAL_ENDPOINT}/calendars/${calendarId}/acl`, {
    role: "writer",
    scope: { type: "user", value: SERVICE_ACCOUNT_EMAIL },
  }, { params: { access_token: accessToken, sendNotifications: false } });
}

export async function revokeCalendarAccess(calendarId: string, accessToken: string) {
  const ruleId = `user:${SERVICE_ACCOUNT_EMAIL}`;
  await axios.delete(
    `${GCAL_ENDPOINT}/calendars/${calendarId}/acl/${ruleId}`,
    { params: { access_token: accessToken } },
  );
}
