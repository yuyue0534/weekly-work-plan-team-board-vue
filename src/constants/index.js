// ====== 可按实际团队和成员修改这里 ======
export const TEAMS = {
  Customer_Service_Process: ["Huang, Peng", "Huang, Zhi", "Yu, Yue", "Shu, Bo", "Yu, Jim", "Li, BaoJie"],
  team2: ["xxx1", "xxww", "xxx3", "xxx4", "xxx5"],
  team3: ["alpha", "beta", "gamma", "delta"]
};

export const STORAGE_KEY = "weekly_work_plan_team_board_v3";
export const AUTO_SAVE_DELAY = 350;

export const STATUS_KEYS = ["pending", "processing", "done"];

export const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  done: "Done"
};

export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const SLOT_KEYS = [
  "mon_am", "tue_am", "wed_am", "thu_am", "fri_am",
  "mon_pm", "tue_pm", "wed_pm", "thu_pm", "fri_pm"
];

export const SLOT_LABELS = [
  "Mon AM", "Tue AM", "Wed AM", "Thu AM", "Fri AM",
  "Mon PM", "Tue PM", "Wed PM", "Thu PM", "Fri PM"
];

export const PREVIEW_SLOT_KEYS = [
  "mon_am", "mon_pm", "tue_am", "tue_pm", "wed_am", "wed_pm", "thu_am", "thu_pm", "fri_am", "fri_pm"
];

export const PREVIEW_SLOT_LABELS = [
  "Mon AM", "Mon PM", "Tue AM", "Tue PM", "Wed AM", "Wed PM", "Thu AM", "Thu PM", "Fri AM", "Fri PM"
];
