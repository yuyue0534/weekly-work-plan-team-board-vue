import { PRIORITIES, SLOT_KEYS, STATUS_KEYS } from "../constants/index.js";
import { createId } from "./helpers.js";
import { formatDate } from "./date.js";

export function createEmptyItem() {
  const today = formatDate(new Date());
  return normalizeItem({
    id: createId("item"),
    workItem: "",
    expectCompleteDate: "",
    createDate: today,
    priority: "Medium",
    tasks: [createEmptyTask()]
  });
}

export function createEmptyTask() {
  return normalizeTask({
    id: createId("task"),
    taskName: "",
    description: "",
    slots: {},
    remarkBlocker: ""
  });
}

export function normalizeItem(item) {
  return {
    id: item.id || createId("item"),
    workItem: item.workItem || "",
    expectCompleteDate: item.expectCompleteDate || "",
    createDate: item.createDate || "",
    priority: PRIORITIES.includes(item.priority) ? item.priority : "Low",
    tasks: Array.isArray(item.tasks) ? item.tasks.map(normalizeTask) : []
  };
}

export function normalizeTask(task) {
  const slots = {};
  SLOT_KEYS.forEach((key) => {
    slots[key] = Boolean(task.slots && task.slots[key]);
  });
  return {
    id: task.id || createId("task"),
    taskName: task.taskName || "",
    description: task.description || "",
    slots,
    remarkBlocker: task.remarkBlocker || ""
  };
}

export function countCheckedSlots(item) {
  const uniqueSlots = new Set();
  (item.tasks || []).forEach((task) => {
    SLOT_KEYS.forEach((key) => {
      if (task.slots?.[key]) uniqueSlots.add(key);
    });
  });
  return uniqueSlots.size;
}

export function cloneItem(item) {
  return normalizeItem(JSON.parse(JSON.stringify(item || {})));
}

export function cleanItemForSave(item) {
  const cleaned = normalizeItem(item || {});
  cleaned.tasks = cleaned.tasks.filter(isMeaningfulTask);
  return cleaned;
}

export function isMeaningfulItem(item) {
  const workItem = String(item.workItem || "").trim();
  return Boolean(
    workItem ||
    item.expectCompleteDate ||
    (Array.isArray(item.tasks) && item.tasks.some(isMeaningfulTask))
  );
}

export function isMeaningfulTask(task) {
  if (!task) return false;
  return Boolean(
    String(task.taskName || "").trim() ||
    String(task.description || "").trim() ||
    String(task.remarkBlocker || "").trim() ||
    SLOT_KEYS.some((key) => Boolean(task.slots && task.slots[key]))
  );
}

export function createMemberBoard() {
  return { pending: [], processing: [], done: [] };
}

export function createWeekBoard(members) {
  const result = {};
  members.forEach((member) => {
    result[member] = createMemberBoard();
  });
  return { members: result };
}
