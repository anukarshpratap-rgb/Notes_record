<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

import NewNote from './components/NewNote.vue';
import DisplayNotes from './components/DisplayNotes.vue';

//Configuration
const API_BASE_URL = 'http://localhost:3000/notes';

// --- Reactive State ---
const notes = ref([]);
const editingNote = ref(null);
const loading = ref(true);
const error = ref(null);

// READ
const fetchNotes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(API_BASE_URL);
    notes.value = response.data;
  } catch (err) {
    console.error('Error fetching notes:', err.message);
    error.value = `Failed to connect to backend on ${API_BASE_URL}. Please ensure your Node server is running.`;
  } finally {
    loading.value = false;
  }
};

// CREATE
const handleNewNote = async (newNoteData) => {
  try {
    const response = await axios.post(API_BASE_URL, newNoteData);
    notes.value.push(response.data);
  } catch (err) {
    console.error('Error adding note:', err);
    error.value = 'Failed to add note.';
  }
};

// UPDATE (start edit)
const startEdit = (note) => {
  editingNote.value = { ...note };
};

// UPDATE (cancel)
const cancelEdit = () => {
  editingNote.value = null;
  error.value = null;
};

// UPDATE (save)
const handleSaveEdit = async () => {
  const noteToUpdate = editingNote.value;
  if (!noteToUpdate || !noteToUpdate.title.trim() || !noteToUpdate.content.trim()) return;

  try {
    const response = await axios.put(`${API_BASE_URL}/${noteToUpdate.id}`, {
      title: noteToUpdate.title,
      content: noteToUpdate.content
    });
    const index = notes.value.findIndex(n => n.id === noteToUpdate.id);
    if (index !== -1) notes.value[index] = response.data;
    editingNote.value = null;
  } catch (err) {
    console.error('Error saving note:', err);
    error.value = 'Failed to save changes.';
  }
};

// DELETE
const handleDeleteNote = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
    notes.value = notes.value.filter(note => note.id !== id);
  } catch (err) {
    console.error('Error deleting note:', err);
    error.value = 'Failed to delete note.';
  }
};

// FETCH ON MOUNT
onMounted(fetchNotes);
</script>

<template>
  <div class="app-container">
    <h1 class="app-title">Notes keeper</h1>

    <!-- Error Message -->
    <div v-if="error" class="error-box">
      <strong>Error:</strong> {{ error }}
      <button class="close-btn" @click="error = null">&times;</button>
    </div>

    <!-- Add New Note -->
    <NewNote @add-note="handleNewNote" />

    <!-- Display Notes -->
    <DisplayNotes 
      :notes="notes"
      :loading="loading"
      :editing-note="editingNote"
      :on-start-edit="startEdit"
      :on-cancel-edit="cancelEdit"
      :on-save-edit="handleSaveEdit"
      :on-delete-note="handleDeleteNote"
    />
  </div>
</template>

<style >
body {
  font-family: Arial, sans-serif;
  background-color: #f4f6f8;
  margin: 0;
  padding: 0;
}

.app-container {
  max-width: 1200px;
  background: white;
  margin: 40px auto;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  text-align: center;
}

.error-box {
  background-color: #ffe5e5;
  border: 1px solid #ffb3b3;
  color: #b30000;
  padding: 10px 15px;
  margin-bottom: 15px;
  border-radius: 5px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 4px;
  right: 8px;
  background: none;
  border: none;
  color: #b30000;
  font-size: 18px;
  cursor: pointer;
}

.close-btn:hover {
  color: #800000;
}
</style>
