<script setup>
import { ref } from 'vue';

const emit = defineEmits(['add-note']);

const title = ref('');
const content = ref('');

const submitForm = () => {
  if (!title.value.trim() || !content.value.trim()) return;

  emit('add-note', {
    title: title.value.trim(),
    content: content.value.trim(),
  });

  title.value = '';
  content.value = '';
};
</script>

<template>
  <div class="new-note-container">
    <h2 class="form-title">Create New Note</h2>
    <form @submit.prevent="submitForm" class="new-note-form">
      <input
        v-model="title"
        placeholder="Note Title"
        required
        class="form-input title-input"
      />

      <textarea
        v-model="content"
        rows="3"
        placeholder="Note Content..."
        required
        class="form-input content-input"
      ></textarea>

      <button
        type="submit"
        :disabled="!title.trim() || !content.trim()"
        class="form-button add-button"
      >
        Add Note
      </button>
    </form>
  </div>
</template>

<style scoped>
.new-note-container {
  padding: 16px;
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 10px;
  max-width: 900px;
  margin: 0 auto 20px;
}

.form-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  text-align: center;
}

.new-note-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: 0.2s;
}

.form-input:focus {
  border-color: #4a90e2;
  outline: none;
}

.title-input {
  font-weight: 600;
}

.content-input {
  resize: vertical;
}

.form-button {
  align-self: flex-end;
  padding: 8px 18px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s;
}

.form-button:hover:not(:disabled) {
  background-color: #3a78c2;
}

.form-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
