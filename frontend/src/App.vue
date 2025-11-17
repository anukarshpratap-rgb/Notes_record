<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

import NewNote from './components/NewNote.vue';
import DisplayNotes from './components/DisplayNotes.vue';
import SignIn from './components/SignIn.vue';
import SignUp from './components/SignUp.vue';
import { authService } from './services/authService.js';

//Configuration
const API_BASE_URL = 'http://localhost:3000/notes';

// --- Reactive State ---
const notes = ref([]);
const editingNote = ref(null);
const loading = ref(true);
const error = ref(null);
const isAuthenticated = ref(false);
const currentUser = ref(null);
const authMode = ref('signin'); // 'signin' or 'signup'
const searchQuery = ref(''); // Search by title

// Computed property: Filter notes by title
const filteredNotes = computed(() => {
  if (!searchQuery.value.trim()) {
    return notes.value; // Return all notes if search is empty
  }
  
  const query = searchQuery.value.toLowerCase();
  return notes.value.filter(note => 
    note.title.toLowerCase().includes(query)
  );
});

// READ
const fetchNotes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const token = authService.getToken();
    const response = await axios.get(API_BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    notes.value = response.data;
  } catch (err) {
    console.error('Error fetching notes:', err.message);
    error.value = `Failed to fetch notes. Please ensure your Node server is running.`;
  } finally {
    loading.value = false;
  }
};

// CREATE
const handleNewNote = async (newNoteData) => {
  try {
    const token = authService.getToken();
    const response = await axios.post(API_BASE_URL, newNoteData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    notes.value.push(response.data[0]);
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
    const token = authService.getToken();
    const response = await axios.put(`${API_BASE_URL}/${noteToUpdate.id}`, {
      title: noteToUpdate.title,
      content: noteToUpdate.content
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
    const token = authService.getToken();
    await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    notes.value = notes.value.filter(note => note.id !== id);
  } catch (err) {
    console.error('Error deleting note:', err);
    error.value = 'Failed to delete note.';
  }
};

// AUTH HANDLERS
const handleAuthSuccess = (user) => {
  isAuthenticated.value = true;
  currentUser.value = user;
  error.value = null;
  fetchNotes();
};

const handleLogout = () => {
  authService.logout();
  isAuthenticated.value = false;
  currentUser.value = null;
  notes.value = [];
  authMode.value = 'signin';
  error.value = null;
};

// FETCH ON MOUNT
onMounted(() => {
  if (authService.isAuthenticated()) {
    isAuthenticated.value = true;
    currentUser.value = authService.getUserInfo();
    fetchNotes();
  }
});
</script>

<template>
  <div class="app">
    <!-- Authentication Pages -->
    <div v-if="!isAuthenticated" class="auth-page">
      <SignIn 
        v-if="authMode === 'signin'"
        @auth-success="handleAuthSuccess"
        @switch-to-signup="authMode = 'signup'"
      />
      <SignUp 
        v-else
        @auth-success="handleAuthSuccess"
        @switch-to-signin="authMode = 'signin'"
      />
    </div>

    <!-- Notes Application -->
    <div v-else class="app-container">
      <div class="app-header">
        <h1 class="app-title">Notes Recorder</h1>
        <div class="header-actions">
          <span class="user-email">{{ currentUser?.email }}</span>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-box">
        <strong>Error:</strong> {{ error }}
        <button class="close-btn" @click="error = null">&times;</button>
      </div>

      <!-- Add New Note -->
      <NewNote @add-note="handleNewNote" />

      <!-- Search Section -->
      <div class="search-section">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search notes by title..."
          class="search-input"
        />
        <span v-if="searchQuery" class="search-info">
          Found {{ filteredNotes.length }} of {{ notes.length }} note(s)
        </span>
      </div>

      <!-- Display Notes -->
      <DisplayNotes 
        :notes="filteredNotes"
        :loading="loading"
        :editing-note="editingNote"
        :on-start-edit="startEdit"
        :on-cancel-edit="cancelEdit"
        :on-save-edit="handleSaveEdit"
        :on-delete-note="handleDeleteNote"
      />
    </div>
  </div>
</template>

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f4f6f8;
  margin: 0;
  padding: 0;
}

.app {
  min-height: 100vh;
}

.auth-page {
  min-height: 100vh;
}

.app-container {
  max-width: 1200px;
  background: white;
  margin: 0 auto;
  padding: 30px;
  min-height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 20px;
}

.app-title {
  font-size: 2.2rem;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-email {
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
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

/* Search Section Styles */
.search-section {
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.search-input::placeholder {
  color: #999;
}

.search-info {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: #f0f0f0;
  padding: 6px 12px;
  border-radius: 6px;
  white-space: nowrap;
}
</style>
