const OSDefine = {
  LINUX: "LINUX",
  MACOS: "MACOS",
  WINDOWS: "WINDOWS",
} as const;

type OS = typeof OSDefine[keyof typeof OSDefine];

//
// https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions#minute-multipliers
//
const MINUTE_MULTIPLIER: { [Keys in OS]: number } = {
  LINUX: 1,
  MACOS: 10,
  WINDOWS: 2,
};

//
// https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions#per-minute-rates
//
const PER_MINUTE_RATE_USD = 0.008;

//
// https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions#:~:text=GitHub%20rounds%20the%20minutes%20each%20job%20uses%20up%20to%20the%20nearest%20minute.
// GitHub rounds the minutes each job uses up to the nearest minute.
//
const toMinutes = (ms: number) => {
  return Math.ceil(ms / 1000 / 60);
};

export const calclateGithubActionsCostUSD = (billableMs: number, os: OS) =>
  toMinutes(billableMs) * PER_MINUTE_RATE_USD * MINUTE_MULTIPLIER[os];
