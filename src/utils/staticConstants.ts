import { FormOption } from "./types";

export const TOAST_TIMEOUT = 3000;
export const TOAST_TRANSITION_TIME = 200;

export const INPUT_DATE_FORMAT = "M/DD h:mma";
export const DATE_FORMAT = "M/DD/YYYY h:mma";
export const TIMEZONE = "America/Chicago";

export const EMAIL_REGEX = /^([a-zA-Z\d_.\-+])+@(([a-zA-Z\d-])+\.)+([a-zA-Z\d]{2,4})+$/;
export const URL_REGEX = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/;

export const RADIAN = Math.PI / 180;
export const LESBIAN_FLAG_COLORS = ["#d52d00", "#ef7627", "#ff9a56", "#d162a4", "#b55690", "#a30262"];
export const GAY_FLAG_COLORS = ["#078d70", "#26Ceaa", "#98e8c1", "#7bade2", "#5049cc", "#3d1a78"];
export const TRANS_FLAG_COLORS = ["#5bcefa", "#f5a9b8"];

export const YEAR_OPTIONS: FormOption[] = [
  { id: "2028", label: "Freshman" },
  { id: "2027", label: "Sophomore" },
  { id: "2026", label: "Junior" },
  { id: "2025", label: "Senior" },
  { id: "2024", label: "Super senior" },
  { id: "grad", label: "Grad student" },
];

export const SERVICE_ACCOUNT_EMAIL = "google-calendar@org-assistant.iam.gserviceaccount.com";