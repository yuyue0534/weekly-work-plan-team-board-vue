<template>
  <section class="card">
    <div class="card-body">
      <div class="toolbar">
        <div class="form-group team-group">
          <label for="teamSelect">Team</label>
          <select
            id="teamSelect"
            class="form-select"
            :value="state.team"
            @change="$emit('team-change', $event.target.value)"
          >
            <option v-for="team in Object.keys(teams)" :key="team" :value="team">{{ team }}</option>
          </select>
        </div>
        <div class="form-group year-group">
          <label for="yearInput">Year</label>
          <input
            id="yearInput"
            class="form-control"
            type="number"
            min="2000"
            max="2100"
            step="1"
            :value="state.year"
            @change="$emit('year-change', $event.target.value)"
          />
        </div>
        <div class="form-group week-group">
          <label for="weekSelect">Week</label>
          <select
            id="weekSelect"
            class="form-select"
            :value="state.weekKey"
            @change="$emit('week-change', $event.target.value)"
          >
            <option v-for="week in weekOptions" :key="week.key" :value="week.key">{{ week.label }}</option>
          </select>
        </div>
        <div class="form-group date-group">
          <label for="startDateDisplay">StartDate</label>
          <input id="startDateDisplay" class="form-control readonly-input" type="text" readonly :value="startDateDisplay" />
        </div>
        <div class="form-group date-group">
          <label for="endDateDisplay">EndDate</label>
          <input id="endDateDisplay" class="form-control readonly-input" type="text" readonly :value="endDateDisplay" />
        </div>
        <div class="form-group actions-group">
          <label>&nbsp;</label>
          <div class="actions">
            <button id="saveBtn" class="btn btn-primary" type="button" @click="$emit('save')">保存</button>
            <button id="exportBtn" class="btn btn-outline-primary" type="button" @click="$emit('export')">导出 JSON</button>
            <button id="importBtn" class="btn btn-outline-secondary" type="button" @click="triggerImport">导入 JSON</button>
            <button id="clearWeekBtn" class="btn btn-outline-danger" type="button" @click="$emit('clear-week')">清空当前周</button>
            <span id="saveStatus" class="save-status">{{ saveStatusText }}</span>
            <input
              id="importFile"
              ref="importFileInput"
              type="file"
              accept="application/json,.json"
              hidden
              @change="onImportFileChange"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  teams: { type: Object, required: true },
  state: { type: Object, required: true },
  weekOptions: { type: Array, required: true },
  startDateDisplay: { type: String, default: "" },
  endDateDisplay: { type: String, default: "" },
  saveStatusText: { type: String, default: "" }
});

const emit = defineEmits([
  "team-change",
  "year-change",
  "week-change",
  "save",
  "export",
  "import-file",
  "clear-week"
]);

const importFileInput = ref(null);

function triggerImport() {
  importFileInput.value?.click();
}

function onImportFileChange(event) {
  const file = event.target.files && event.target.files[0];
  emit("import-file", file, () => {
    event.target.value = "";
  });
}
</script>
