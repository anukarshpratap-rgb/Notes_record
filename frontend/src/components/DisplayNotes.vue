<script setup>
const props = defineProps({
  notes: Array,
  loading: Boolean,
  error: String,
  editingNote: Object,
  onStartEdit: Function,
  onCancelEdit: Function,
  onSaveEdit: Function,
  onDeleteNote: Function,
});
</script>

<template>
  <div class="notes-container">
    <h2 class="title">My Notes ({{ notes.length }})</h2>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Fetching notes...</p>
    </div>

    <!-- Notes Grid -->
    <div v-else-if="notes.length" class="notes-grid">
      <div v-for="note in notes" :key="note.id" class="note-card">

        <!-- Edit Mode -->
        <div v-if="editingNote && editingNote.id === note.id">
          <input v-model="editingNote.title" placeholder="Title" class="input" />
          <textarea v-model="editingNote.content" rows="4" placeholder="Write here..." class="input"></textarea>

          <div class="btn-group">
            <button @click="onSaveEdit()" class="btn save">Save</button>
            <button @click="onCancelEdit()" class="btn cancel">Cancel</button>
          </div>
        </div>

        <!-- Read Mode -->
        <div v-else>
          <h3 class="note-title">{{ note.title }}</h3>
          <p class="note-text">{{ note.content }}</p>
    

          <div class="btn-group">
            <button @click="onStartEdit(note)" class="btn edit">Edit</button>
            <button @click="onDeleteNote(note.id)" class="btn delete">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty">No notes yet. Create one!</div>
  </div>
</template>

<style scoped>
/* Container */
.notes-container {
  max-width: 1000px;
  margin: 2rem auto;
  font-family: sans-serif;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  border-bottom: 2px solid #ccc;
  padding-bottom: 0.3rem;
  margin-bottom: 1.5rem;
}

/* Loading */
.loading {
  text-align: center;
  color: #666;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #ddd;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  margin: 1rem auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Grid Layout */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Note Card */
.note-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Note Text */
.note-title {
  font-size: 1.2rem;
  margin-bottom: 0.4rem;
  font-weight: 600;
}

.note-text {
  color: #444;
  margin-bottom: 0.8rem;
  white-space: pre-wrap;
}

/* Inputs */
.input {
  width: 100%;
  padding: 0.6rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}

/* Buttons */
.btn-group {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  font-size: 0.9rem;
}

.save {
  background: #2ecc71;
}
.cancel {
  background: #7f8c8d;
}
.edit {
  background: #f1c40f;
}
.delete {
  background: #e74c3c;
}

/* Empty State */
.empty {
  text-align: center;
  color: #777;
  border: 2px dashed #ccc;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 1rem;
}
</style>
