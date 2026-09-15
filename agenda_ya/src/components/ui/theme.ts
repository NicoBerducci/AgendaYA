export interface ThemeTokens {
  appBg: string; topbar: string; topbarText: string; side: string;
  sideActive: string; sideSub: string; surface: string; panel: string;
  line: string; lineStrong: string; text: string; muted: string;
  faded: string; blocked: string; blockedInk: string; danger: string;
  save: string; ok: string; okBg: string; errBg: string; mark: string;
}

export const LIGHT: ThemeTokens = {
  appBg: "#EDEFF1",
  topbar: "#0F7A8A",
  topbarText: "#FFFFFF",
  side: "#CFEDDF",
  sideActive: "#7FD6B0",
  sideSub: "#8FDCBB",
  surface: "#FFFFFF",
  panel: "#D9DCDB",
  line: "#DDE1E4",
  lineStrong: "#B9C0C4",
  text: "#182124",
  muted: "#6B7A80",
  faded: "#A7B1B6",
  blocked: "#FBDCE2",
  blockedInk: "#A83248",
  danger: "#E5392B",
  save: "#7A8285",
  ok: "#1C7A4E",
  okBg: "#DFF3E7",
  errBg: "#FCE3E1",
  mark: "#111111",
};

export const DARK: ThemeTokens = {
  appBg: "#0D1214",
  topbar: "#0B5A66",
  topbarText: "#EAF6F7",
  side: "#14322B",
  sideActive: "#2E7D5D",
  sideSub: "#276A50",
  surface: "#151D20",
  panel: "#1D2629",
  line: "#2A3438",
  lineStrong: "#3A464B",
  text: "#E7EDEF",
  muted: "#94A3A8",
  faded: "#5C696E",
  blocked: "#4A2028",
  blockedInk: "#F3A9B7",
  danger: "#E5392B",
  save: "#5D686C",
  ok: "#6FD3A0",
  okBg: "#12352A",
  errBg: "#3A1B1B",
  mark: "#E7EDEF",
};

export const FONT = '"Segoe UI", Roboto, system-ui, -apple-system, "Helvetica Neue", sans-serif';
