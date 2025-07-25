class TodoApp {
    constructor() {
      this.key = 'todoApp';
      this.data = this.load();
      this.setupUI();
      this.render();
    }
  
    load() {
      try {
        return JSON.parse(localStorage.getItem(this.key)) || { tasks: [] };
      } catch {
        return { tasks: [] };
      }
    }
  
    save() {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    }
  
    async confirmDelete(message = 'Are you sure?') {
      const result = await Swal.fire({
        title: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        dangerMode: true
      });
      return result.isConfirmed;
    }
  
    setupUI() {
      document.getElementById('main-task-form').onsubmit = e => {
        e.preventDefault();
        const input = document.getElementById('main-task-input');
        const v = input.value.trim();
        if (v) {
          this.data.tasks.push({ id: Date.now(), text: v, done: false, subtasks: [] });
          this.save();
          this.render();
        }
        input.value = '';
      };
    }
  
    async toggleDone(task, isSub = false) {
      if (isSub) {
        task.done = !task.done;
      } else {
        task.done = !task.done;
        task.subtasks.forEach(s => s.done = task.done);
      }
      this.save();
      this.render();
    }
  
    async deleteTask(taskList, task) {
      const ok = await this.confirmDelete('Delete this task?');
      if (ok) {
        const arr = this.data.tasks;
        this.data.tasks = arr.filter(t => t !== task);
        this.save();
        Swal.fire('Deleted!', '', 'success');
        this.render();
      }
    }
  
    async deleteSub(task, sub) {
      const ok = await this.confirmDelete('Delete this subtask?');
      if (ok) {
        task.subtasks = task.subtasks.filter(s => s !== sub);
        this.save();
        Swal.fire('Deleted!', '', 'success');
        this.render();
      }
    }
  
    async editTask(task) {
      const res = await Swal.fire({
        title: 'Edit task',
        input: 'text',
        inputValue: task.text,
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        inputValidator: (value) => !value.trim() && 'Please enter a task'
      });
      if (res.isConfirmed && res.value.trim()) {
        task.text = res.value.trim();
        this.save();
        this.render();
        Swal.fire('Updated!', '', 'success');
      }
    }
  
    async editSubtask(sub) {
      const res = await Swal.fire({
        title: 'Edit subtask',
        input: 'textarea',
        inputValue: sub.text,
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        inputAttributes: {
          'aria-label': 'Edit subtask details',
          rows: 2,
          style: 'resize:none; font-size: 0.875rem; padding: 0.25rem;'
        },
        customClass: {
          popup: 'rounded-lg shadow-lg p-6',
          input: 'border border-gray-300 rounded p-2 w-full max-w-xs mx-auto'
        },
        inputValidator: (value) => !value.trim() && 'Please enter a subtask'
      });
      if (res.isConfirmed && res.value.trim()) {
        sub.text = res.value.trim();
        this.save();
        this.render();
        Swal.fire('Updated!', '', 'success');
      }
    }
  
    render() {
      const list = document.getElementById('task-list');
      list.innerHTML = '';
  
      this.data.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'bg-blue-50 rounded-lg shadow p-5 space-y-3';
  
        const header = document.createElement('div');
        header.className = 'flex items-center';
  
        // Checkbox
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.checked = task.done;
        chk.className = 'mr-4 w-6 h-6 cursor-pointer';
        chk.onchange = () => this.toggleDone(task);
  
        // Task text
        const title = document.createElement('span');
        title.textContent = task.text;
        title.className = `flex-1 font-semibold text-lg select-none
          ${task.done ? 'line-through text-gray-400' : 'text-teal-700'}`;
  
        // Edit button for task
        const btnEdit = document.createElement('button');
        btnEdit.title = 'Edit task';
        btnEdit.innerHTML = '✎';
        btnEdit.className = 'text-teal-700 hover:text-teal-900 text-xl font-bold px-3 py-1 rounded-md transition cursor-pointer select-none';
        btnEdit.style.lineHeight = '1';
        btnEdit.onclick = () => this.editTask(task);
  
        // Add subtask button
        const btnAdd = document.createElement('button');
        btnAdd.innerHTML = '+';
        btnAdd.title = 'Add subtask';
        btnAdd.className = 'text-green-600 hover:text-green-800 text-2xl font-bold px-3 py-1 rounded-md transition cursor-pointer select-none';
        btnAdd.style.lineHeight = '1';
        btnAdd.onclick = () => {
          Swal.fire({
            title: 'Add subtask',
            input: 'textarea',
            inputPlaceholder: 'Enter subtask details...',
            showCancelButton: true,
            confirmButtonText: 'Add',
            cancelButtonText: 'Cancel',
            inputAttributes: {
              'aria-label': 'Enter subtask details',
              rows: 2,
              style: 'resize:none; font-size: 0.875rem; padding: 0.25rem;'
            },
            customClass: {
              popup: 'rounded-lg shadow-lg p-6',
              input: 'border border-gray-300 rounded p-2 w-full max-w-xs mx-auto'
            }
          }).then(res => {
            if (res.isConfirmed && res.value.trim()) {
              task.subtasks.push({ id: Date.now(), text: res.value.trim(), done: false });
              this.save();
              this.render();
              Swal.fire('Added!', '', 'success');
            }
          });
        };
  
        // Delete task button
        const btnDel = document.createElement('button');
        btnDel.innerHTML = '×';
        btnDel.title = 'Delete task';
        btnDel.className = 'text-red-600 hover:text-red-800 text-2xl font-bold px-3 py-1 rounded-md transition cursor-pointer select-none';
        btnDel.style.lineHeight = '1';
        btnDel.onclick = () => this.deleteTask(this.data.tasks, task);
  
        header.append(chk, title, btnEdit, btnAdd, btnDel);
        li.append(header);
  
        if (task.subtasks.length) {
          const subul = document.createElement('ul');
          subul.className = 'pl-8 space-y-2 border-l-2 border-green-300';
  
          task.subtasks.forEach(sub => {
            const sli = document.createElement('li');
            sli.className = 'flex items-center';
  
            const schk = document.createElement('input');
            schk.type = 'checkbox';
            schk.checked = sub.done;
            schk.className = 'mr-3 w-5 h-5 cursor-pointer';
            schk.onchange = () => this.toggleDone(sub, true);
  
            const stxt = document.createElement('span');
            stxt.textContent = sub.text;
            stxt.className = `flex-1 select-none
              ${sub.done ? 'line-through text-gray-400' : 'text-teal-600'}`;
            stxt.style.fontSize = '1rem';
  
            // Subtask edit button
            const subEditBtn = document.createElement('button');
            subEditBtn.title = 'Edit subtask';
            subEditBtn.innerHTML = '✎';
            subEditBtn.className = 'text-teal-600 hover:text-teal-900 text-xl font-bold px-3 py-1 rounded-md transition cursor-pointer select-none';
            subEditBtn.style.lineHeight = '1';
            subEditBtn.onclick = () => this.editSubtask(sub);
  
            // Subtask delete button
            const sdel = document.createElement('button');
            sdel.innerHTML = '×';
            sdel.title = 'Delete subtask';
            sdel.className = 'text-red-600 hover:text-red-800 text-2xl font-bold px-3 py-0 rounded-md transition cursor-pointer select-none';
            sdel.style.lineHeight = '1';
            sdel.onclick = () => this.deleteSub(task, sub);
  
            sli.append(schk, stxt, subEditBtn, sdel);
            subul.append(sli);
          });
  
          li.append(subul);
        }
  
        list.append(li);
      });
    }
  }
  
  window.addEventListener('DOMContentLoaded', () => new TodoApp());
  