export type BabyStep = {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  description: string;
};

/**
 * UK-adapted version of Dave Ramsey's 7 Baby Steps.
 * Mirrored in the `baby_steps` seed migration — keep in sync.
 */
export const BABY_STEPS: BabyStep[] = [
  {
    number: 1,
    title: "£1,000 starter emergency fund",
    description:
      "Save a starter cushion before you attack debt, so a flat tyre doesn't become a new credit card.",
  },
  {
    number: 2,
    title: "Debt snowball",
    description:
      "Pay off all non-mortgage debt, smallest balance first. Student loans are excluded by default.",
  },
  {
    number: 3,
    title: "Full emergency fund",
    description:
      "Build your emergency fund up to 3–6 months of essential expenses.",
  },
  {
    number: 4,
    title: "Invest 15% for retirement",
    description:
      "Invest 15% of household income via your workplace pension and a SIPP or ISA top-up.",
  },
  {
    number: 5,
    title: "Children's future fund",
    description:
      "Save for your children's future with a Junior ISA or Junior SIPP.",
  },
  {
    number: 6,
    title: "Pay off the mortgage early",
    description: "Throw everything extra at your mortgage until it's gone.",
  },
  {
    number: 7,
    title: "Build wealth and give",
    description:
      "Grow your wealth and give generously — you've earned the freedom.",
  },
];
