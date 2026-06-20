<template>
  <div class="container">
    <header class="app-header">
      <div class="app-hader-sub">
        <h1 class="app-title">Weekly Work Plan</h1>
        <p class="app-subtitle">Team board version: Pending / Processing / Done, task-level half-day schedule, JSON backup.</p>
      </div>
      <span class="badge">💾 Auto Save: localStorage + JSON Backup</span>
    </header>

    <AppToolbar
      :teams="TEAMS"
      :state="state"
      :week-options="weekOptions"
      :start-date-display="startDateDisplay"
      :end-date-display="endDateDisplay"
      :save-status-text="saveStatusText"
      @team-change="onTeamChange"
      @year-change="onYearChange"
      @week-change="onWeekChange"
      @save="() => saveNow(false)"
      @export="exportJson"
      @import-file="onImportFile"
      @clear-week="clearCurrentWeek"
    />

    <BoardTable
      :board-title="boardTitle"
      :members="currentTeamMembers"
      :get-member-items="getMemberItems"
      @add-item="addItem"
      @edit-item="openItemModal"
      @drop-item="handleItemDrop"
    />

    <p class="footer-note">
      数据自动保存到当前浏览器 localStorage。更换电脑/浏览器前请先导出 JSON。Team 与成员可在 src/constants/index.js 的 TEAMS 配置里修改。
    </p>
  </div>

  <ItemModal
    :open="modalOpen"
    :draft="modalDraft"
    :context="modalContext"
    :team="state.team"
    :status-labels="STATUS_LABELS"
    :save-hint="modalSaveHint"
    @close="closeModal"
    @save="saveModalAndClose"
    @add-task="addTaskToCurrentItem"
    @delete-task="deleteTaskFromCurrentItem"
    @delete-item="deleteCurrentItem"
    @input-change="() => updateModalSaveHint(true)"
    @task-field-change="onTaskFieldChange"
    @task-slot-change="onTaskSlotChange"
  />

  <ToastMessage :message="toastMessage" :visible="toastVisible" />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import AppToolbar from "./components/AppToolbar.vue";
import BoardTable from "./components/BoardTable.vue";
import ItemModal from "./components/ItemModal.vue";
import ToastMessage from "./components/ToastMessage.vue";
import { useBoardStore } from "./composables/useBoardStore.js";

const {
  TEAMS,
  STATUS_LABELS,
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
  init,
  onTeamChange,
  onYearChange,
  onWeekChange,
  currentTeamMembers,
  getMemberItems,
  saveNow,
  flushAutoSave,
  exportJson,
  importJson,
  clearCurrentWeek,
  addItem,
  openItemModal,
  closeModal,
  updateModalSaveHint,
  saveModalAndClose,
  addTaskToCurrentItem,
  deleteTaskFromCurrentItem,
  deleteCurrentItem,
  handleItemDrop
} = useBoardStore();

function onImportFile(file, resetInput) {
  importJson(file, {
    onSuccess: resetInput,
    onError: resetInput
  });
}

function onTaskFieldChange(index, field, value) {
  if (!modalDraft.value) return;
  const task = modalDraft.value.tasks[index];
  if (!task) return;
  task[field] = value;
  updateModalSaveHint(true);
}

function onTaskSlotChange(index, slotKey, checked) {
  if (!modalDraft.value) return;
  const task = modalDraft.value.tasks[index];
  if (!task) return;
  task.slots[slotKey] = checked;
  updateModalSaveHint(true);
}

function handleBeforeUnload() {
  flushAutoSave();
}

onMounted(() => {
  init();
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>
