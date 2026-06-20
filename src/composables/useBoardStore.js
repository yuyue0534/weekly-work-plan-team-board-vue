import { reactive, ref, computed } from "vue";
import {
  TEAMS,
  STORAGE_KEY,
  AUTO_SAVE_DELAY,
  STATUS_KEYS,
  STATUS_LABELS
} from "../constants/index.js";
import { buildWorkWeeks, getDefaultWeekKey, normalizeYear, formatTimestampForFile } from "../utils/date.js";
import {
  normalizeItem,
  cloneItem,
  cleanItemForSave,
  isMeaningfulItem,
  createEmptyItem,
  createEmptyTask,
  createMemberBoard,
  createWeekBoard
} from "../utils/model.js";

function cloneTeams() {
  return JSON.parse(JSON.stringify(TEAMS));
}

function createEmptyStore() {
  return {
    version: 3,
    app: "Weekly Work Plan Team Board",
    storageMode: "localStorage-json",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    teams: cloneTeams(),
    plans: {}
  };
}

function normalizeImportedStore(imported) {
  if (!imported || typeof imported !== "object") return null;
  if (!imported.plans || typeof imported.plans !== "object") return null;
  return {
    version: imported.version || 3,
    app: imported.app || "Weekly Work Plan Team Board",
    storageMode: imported.storageMode || "localStorage-json",
    createdAt: imported.createdAt || new Date().toISOString(),
    updatedAt: imported.updatedAt || new Date().toISOString(),
    teams: imported.teams || cloneTeams(),
    plans: imported.plans
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyStore();
    const parsed = JSON.parse(raw);
    return normalizeImportedStore(parsed) || createEmptyStore();
  } catch (error) {
    console.warn("Failed to load local data:", error);
    return createEmptyStore();
  }
}

export function useBoardStore() {
  // ===== 基础状态 =====
  let dataStore = reactive(loadData());
  const weekOptions = ref([]);
  const state = reactive({
    team: Object.keys(TEAMS)[0],
    year: new Date().getFullYear(),
    weekKey: ""
  });

  const saveStatusText = ref("尚未保存");
  const toastMessage = ref("");
  const toastVisible = ref(false);

  let autoSaveTimer = null;
  let toastTimer = null;

  // 模态框相关状态
  const modalOpen = ref(false);
  const modalContext = ref(null); // { member, status, itemId, isNew }
  const modalDraft = ref(null); // 当前编辑中的 item draft
  const modalSaveHint = ref("编辑内容不会自动保存");

  // ===== 工具 =====
  const currentTeamMembers = computed(() => {
    return Array.isArray(TEAMS[state.team]) ? TEAMS[state.team] : [];
  });

  function getCurrentTeamMembers() {
    return currentTeamMembers.value;
  }

  function getSelectedWeek() {
    return weekOptions.value.find((week) => week.key === state.weekKey) || weekOptions.value[0];
  }

  function ensureCurrentWeekData() {
    if (!dataStore.plans || typeof dataStore.plans !== "object") dataStore.plans = {};
    if (!dataStore.plans[state.team]) dataStore.plans[state.team] = {};
    if (!dataStore.plans[state.team][state.year]) dataStore.plans[state.team][state.year] = {};
    if (!dataStore.plans[state.team][state.year][state.weekKey]) {
      dataStore.plans[state.team][state.year][state.weekKey] = createWeekBoard(getCurrentTeamMembers());
    }
    const weekData = dataStore.plans[state.team][state.year][state.weekKey];
    if (!weekData.members || typeof weekData.members !== "object") weekData.members = {};
    getCurrentTeamMembers().forEach((member) => {
      if (!weekData.members[member]) weekData.members[member] = createMemberBoard();
      STATUS_KEYS.forEach((status) => {
        if (!Array.isArray(weekData.members[member][status])) weekData.members[member][status] = [];
        weekData.members[member][status] = weekData.members[member][status].map(normalizeItem);
      });
    });
  }

  function getCurrentWeekData() {
    return dataStore.plans[state.team][state.year][state.weekKey];
  }

  function getItems(member, status) {
    ensureCurrentWeekData();
    const weekData = getCurrentWeekData();
    if (!weekData.members[member]) weekData.members[member] = createMemberBoard();
    if (!Array.isArray(weekData.members[member][status])) weekData.members[member][status] = [];
    return weekData.members[member][status];
  }

  function findItem(member, status, itemId) {
    return getItems(member, status).find((item) => item.id === itemId) || null;
  }

  function removeItem(member, status, itemId) {
    const items = getItems(member, status);
    const index = items.findIndex((item) => item.id === itemId);
    if (index >= 0) items.splice(index, 1);
  }

  function moveItem(sourceMember, sourceStatus, itemId, targetMember, targetStatus) {
    if (sourceMember === targetMember && sourceStatus === targetStatus) return;
    const sourceItems = getItems(sourceMember, sourceStatus);
    const sourceIndex = sourceItems.findIndex((item) => item.id === itemId);
    if (sourceIndex < 0) return;
    const [item] = sourceItems.splice(sourceIndex, 1);
    getItems(targetMember, targetStatus).push(item);
  }

  // ===== 初始化 / 控件联动 =====
  function renderWeekOptions(year) {
    weekOptions.value = buildWorkWeeks(year);
  }

  function onTeamChange(nextTeam) {
    flushAutoSave();
    state.team = nextTeam;
    ensureCurrentWeekData();
  }

  function onYearChange(rawValue) {
    flushAutoSave();
    const nextYear = normalizeYear(rawValue);
    state.year = nextYear;
    renderWeekOptions(nextYear);
    state.weekKey = getDefaultWeekKey(nextYear, weekOptions.value);
    ensureCurrentWeekData();
  }

  function onWeekChange(nextWeekKey) {
    flushAutoSave();
    state.weekKey = nextWeekKey;
    ensureCurrentWeekData();
  }

  function init() {
    renderWeekOptions(state.year);
    state.weekKey = getDefaultWeekKey(state.year, weekOptions.value);
    ensureCurrentWeekData();
    updateSaveStatus("已载入本地数据");
  }

  // ===== 保存 / 自动保存 =====
  function persistData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataStore));
  }

  function updateSaveStatus(prefix) {
    const time = new Date().toLocaleTimeString();
    saveStatusText.value = `${prefix} ${time}`;
  }

  function saveNow(isAuto = false) {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
    }
    dataStore.updatedAt = new Date().toISOString();
    dataStore.teams = cloneTeams();
    persistData();
    updateSaveStatus(isAuto ? "已自动保存" : "已保存");
    if (!isAuto) showToast("数据已保存");
  }

  function scheduleAutoSave() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => saveNow(true), AUTO_SAVE_DELAY);
  }

  function flushAutoSave() {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = null;
      saveNow(true);
    }
  }

  // ===== 导入导出 =====
  function exportJson() {
    flushAutoSave();
    dataStore.exportedAt = new Date().toISOString();
    const content = JSON.stringify(dataStore, null, 2);
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly_work_plan_team_board_${formatTimestampForFile(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("JSON 已导出");
  }

  function importJson(file, { onSuccess, onError } = {}) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        const normalized = normalizeImportedStore(imported);
        if (!normalized) {
          alert("JSON 格式不正确：需要包含 plans 对象。请确认导入的是本工具导出的数据文件。");
          onError && onError();
          return;
        }
        const ok = confirm("导入 JSON 会替换当前浏览器中的本地数据。是否继续？");
        if (!ok) {
          onError && onError();
          return;
        }
        Object.keys(dataStore).forEach((key) => delete dataStore[key]);
        Object.assign(dataStore, normalized);
        dataStore.updatedAt = new Date().toISOString();
        persistData();
        ensureCurrentWeekData();
        updateSaveStatus("已导入 JSON");
        showToast("JSON 导入成功");
        onSuccess && onSuccess();
      } catch (error) {
        alert("JSON 解析失败，请检查文件内容。\n\n" + error.message);
        onError && onError();
      }
    };
    reader.readAsText(file, "utf-8");
  }

  // ===== 清空当前周 =====
  function clearCurrentWeek() {
    const selectedWeek = getSelectedWeek();
    const ok = confirm(`确定清空 ${state.team} 的 ${selectedWeek.label} 所有成员看板数据吗？`);
    if (!ok) return;
    dataStore.plans[state.team][state.year][state.weekKey] = createWeekBoard(getCurrentTeamMembers());
    saveNow(false);
    showToast("当前周已清空");
  }

  // ===== Toast =====
  function showToast(message) {
    toastMessage.value = message;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible.value = false;
    }, 1800);
  }

  // ===== 模态框 / Item 编辑 =====
  function addItem(member, status) {
    ensureCurrentWeekData();
    modalContext.value = { member, status, itemId: null, isNew: true };
    modalDraft.value = createEmptyItem();
    openDraftModal();
  }

  function openItemModal(member, status, itemId) {
    const item = findItem(member, status, itemId);
    if (!item) return;
    modalContext.value = { member, status, itemId, isNew: false };
    modalDraft.value = cloneItem(item);
    openDraftModal();
  }

  function openDraftModal() {
    if (!modalDraft.value) return;
    modalSaveHint.value = "编辑内容不会自动保存";
    modalOpen.value = true;
  }

  function closeModal() {
    modalOpen.value = false;
    modalContext.value = null;
    modalDraft.value = null;
  }

  function updateModalSaveHint(hasUnsavedChange = false) {
    modalSaveHint.value = hasUnsavedChange ? "有未保存修改，点击「保存并关闭」后生效" : "编辑内容不会自动保存";
  }

  function commitModalDraft() {
    if (!modalContext.value || !modalDraft.value) return false;
    const cleanedItem = cleanItemForSave(modalDraft.value);
    if (!isMeaningfulItem(cleanedItem)) {
      alert("请至少填写 Work Item 或一条有效 Task 内容。空白 Work Item / 空白 Task 不会保存。");
      return false;
    }

    const items = getItems(modalContext.value.member, modalContext.value.status);
    if (modalContext.value.isNew) {
      items.push(cleanedItem);
      return true;
    }

    const index = items.findIndex((item) => item.id === modalContext.value.itemId);
    if (index < 0) return false;
    items[index] = cleanedItem;
    return true;
  }

  function saveModalAndClose() {
    if (!commitModalDraft()) return;
    saveNow(false);
    closeModal();
  }

  function addTaskToCurrentItem() {
    if (!modalDraft.value) return;
    modalDraft.value.tasks.push(createEmptyTask());
    saveNow(true);
    updateModalSaveHint();
  }

  function deleteTaskFromCurrentItem(index) {
    if (!modalDraft.value) return;
    const task = modalDraft.value.tasks[index];
    const taskName = task?.taskName || `第 ${index + 1} 条 task`;
    if (!confirm(`确定删除「${taskName}」吗？`)) return;
    modalDraft.value.tasks.splice(index, 1);
    updateModalSaveHint(true);
  }

  function deleteCurrentItem() {
    if (!modalContext.value) return;
    const title = modalDraft.value?.workItem || "当前 Work Item";
    if (modalContext.value.isNew) {
      closeModal();
      showToast("未保存的 Work Item 已关闭");
      return;
    }
    if (!confirm(`确定删除「${title}」吗？`)) return;
    removeItem(modalContext.value.member, modalContext.value.status, modalContext.value.itemId);
    closeModal();
    saveNow(false);
    showToast("Work Item 已删除");
  }

  // ===== 拖拽 =====
  function handleItemDrop(dragPayload, targetMember, targetStatus) {
    if (!dragPayload) return;
    moveItem(dragPayload.member, dragPayload.status, dragPayload.itemId, targetMember, targetStatus);
    saveNow(true);
    showToast("Work Item 已移动");
  }

  // ===== computed =====
  const boardTitle = computed(() => {
    const selectedWeek = getSelectedWeek();
    return selectedWeek ? `${state.team} - ${selectedWeek.label}` : state.team;
  });

  const startDateDisplay = computed(() => getSelectedWeek()?.startDate || "");
  const endDateDisplay = computed(() => getSelectedWeek()?.endDate || "");

  function getMemberItems(member, status) {
    // 注意：渲染期间只做纯读取，不在此处写入 reactive 数据，
    // 数据结构的初始化统一由 ensureCurrentWeekData() 在状态切换时机处理。
    const weekData = dataStore.plans?.[state.team]?.[state.year]?.[state.weekKey];
    if (!weekData || !weekData.members || !weekData.members[member]) return [];
    return weekData.members[member][status] || [];
  }

  return {
    // 常量透传
    TEAMS,
    STATUS_KEYS,
    STATUS_LABELS,

    // 状态
    state,
    weekOptions,
    saveStatusText,
    toastMessage,
    toastVisible,
    modalOpen,
    modalContext,
    modalDraft,
    modalSaveHint,
    boardTitle,
    startDateDisplay,
    endDateDisplay,

    // 方法
    init,
    onTeamChange,
    onYearChange,
    onWeekChange,
    getCurrentTeamMembers,
    currentTeamMembers,
    getMemberItems,
    saveNow,
    scheduleAutoSave,
    flushAutoSave,
    exportJson,
    importJson,
    clearCurrentWeek,
    showToast,
    addItem,
    openItemModal,
    closeModal,
    updateModalSaveHint,
    saveModalAndClose,
    addTaskToCurrentItem,
    deleteTaskFromCurrentItem,
    deleteCurrentItem,
    handleItemDrop
  };
}
