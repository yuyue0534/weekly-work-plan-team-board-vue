<template>
  <div
    class="item-card"
    :class="{ dragging: isDragging }"
    draggable="true"
    :data-item-id="item.id"
    :data-member="member"
    :data-status="status"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="$emit('edit', member, status, item.id)"
  >
    <div class="item-top">
      <div class="item-title">{{ item.workItem || "Untitled Work Item" }}</div>
      <button
        class="btn btn-light btn-sm"
        type="button"
        @click.stop="$emit('edit', member, status, item.id)"
      >编辑</button>
    </div>
    <div class="item-meta">
      <span class="tag" :class="priorityClass">{{ item.priority || "Low" }}</span>
      <span class="tag">Create: {{ item.createDate || "-" }}</span>
      <span class="tag">Expect: {{ item.expectCompleteDate || "-" }}</span>
      <span class="tag">Tasks: {{ item.tasks.length }}</span>
      <span class="tag">Slots: {{ checkedCount }}/10</span>
    </div>

    <div class="item-preview">
      <div class="preview-title">{{ item.workItem || "Untitled Work Item" }}</div>
      <template v-if="!item.tasks.length">
        <div class="preview-task">暂无 task，点击卡片可新增。</div>
      </template>
      <template v-else>
        <div class="preview-task" v-for="task in item.tasks.slice(0, 4)" :key="task.id">
          <b>{{ task.taskName || "Untitled Task" }}</b>
          <div>{{ truncate(task.description || task.remarkBlocker || "", 80) }}</div>
          <div class="preview-slots">
            <span
              v-for="(key, index) in PREVIEW_SLOT_KEYS"
              :key="key"
              class="preview-slot"
              :class="{ checked: task.slots?.[key] }"
            >{{ PREVIEW_SLOT_LABELS[index] }}</span>
          </div>
        </div>
        <div class="preview-task" v-if="item.tasks.length > 4">还有 {{ item.tasks.length - 4 }} 条 task...</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { PREVIEW_SLOT_KEYS, PREVIEW_SLOT_LABELS } from "../constants/index.js";
import { countCheckedSlots } from "../utils/model.js";
import { truncate } from "../utils/helpers.js";

const props = defineProps({
  item: { type: Object, required: true },
  member: { type: String, required: true },
  status: { type: String, required: true }
});

const emit = defineEmits(["edit", "drag-start", "drag-end"]);

const isDragging = ref(false);

const priorityClass = computed(() => `priority-${String(props.item.priority || "low").toLowerCase()}`);
const checkedCount = computed(() => countCheckedSlots(props.item));

function onDragStart(event) {
  isDragging.value = true;
  const payload = {
    member: props.member,
    status: props.status,
    itemId: props.item.id
  };
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", JSON.stringify(payload));
  emit("drag-start", payload);
}

function onDragEnd() {
  isDragging.value = false;
  emit("drag-end");
}
</script>
