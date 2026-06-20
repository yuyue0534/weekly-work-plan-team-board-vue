<template>
  <section class="card board-card">
    <div class="board-header">
      <div>
        <h2 id="boardTitle" class="board-title">{{ boardTitle }}</h2>
        <div class="board-hint">拖拽 Work Item 会在状态列之间移动；点击卡片可编辑 Work Item 和 Tasks。</div>
      </div>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="board-table" aria-label="Weekly team work board">
          <thead>
            <tr>
              <th>Member</th>
              <th><span class="status-pill pending">Pending</span></th>
              <th><span class="status-pill processing">Processing</span></th>
              <th><span class="status-pill done">Done</span></th>
            </tr>
          </thead>
          <tbody id="boardBody">
            <tr v-for="member in members" :key="member">
              <td class="member-cell"><span class="member-name">{{ member }}</span></td>
              <td
                v-for="status in STATUS_KEYS"
                :key="status"
                class="status-col"
              >
                <div
                  class="drop-zone"
                  :class="{ 'drag-over': dragOverKey === member + '|' + status }"
                  :data-member="member"
                  :data-status="status"
                  @dragover.prevent="onDragOver(member, status)"
                  @dragleave="onDragLeave(member, status, $event)"
                  @drop.prevent="onDrop(member, status)"
                >
                  <div class="zone-actions">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      type="button"
                      @click="$emit('add-item', member, status)"
                    >＋ Work Item</button>
                  </div>
                  <ItemCard
                    v-for="item in getMemberItems(member, status)"
                    :key="item.id"
                    :item="item"
                    :member="member"
                    :status="status"
                    @edit="(m, s, id) => $emit('edit-item', m, s, id)"
                    @drag-start="onItemDragStart"
                    @drag-end="onItemDragEnd"
                  />
                  <div v-if="!getMemberItems(member, status).length" class="empty-note">
                    暂无 {{ STATUS_LABELS[status] }} item
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import ItemCard from "./ItemCard.vue";
import { STATUS_KEYS, STATUS_LABELS } from "../constants/index.js";

const props = defineProps({
  boardTitle: { type: String, default: "" },
  members: { type: Array, required: true },
  getMemberItems: { type: Function, required: true }
});

const emit = defineEmits(["add-item", "edit-item", "drop-item"]);

const dragPayload = ref(null);
const dragOverKey = ref("");

function onItemDragStart(payload) {
  dragPayload.value = payload;
}

function onItemDragEnd() {
  dragPayload.value = null;
  dragOverKey.value = "";
}

function onDragOver(member, status) {
  if (!dragPayload.value) return;
  dragOverKey.value = member + "|" + status;
}

function onDragLeave(member, status, event) {
  const key = member + "|" + status;
  if (dragOverKey.value !== key) return;
  const related = event.relatedTarget;
  const zone = event.currentTarget;
  if (related && zone.contains(related)) return;
  dragOverKey.value = "";
}

function onDrop(member, status) {
  dragOverKey.value = "";
  if (!dragPayload.value) return;
  emit("drop-item", dragPayload.value, member, status);
  dragPayload.value = null;
}
</script>
