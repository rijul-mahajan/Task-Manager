# TaskFlow - Your Personal Task Manager

TaskFlow is a minimal, Kanban-style task management web application designed to help you organize your tasks efficiently. Built with HTML, CSS, and JavaScript, it offers a clean interface with drag-and-drop functionality, dark mode support, and local storage persistence. Whether you're managing work projects or personal errands, TaskFlow provides a simple yet powerful tool to keep you on track.

## Features

- **Kanban Board Layout**: Organize tasks into "To Do," "In Progress," and "Completed" columns.
- **Drag-and-Drop**: Move tasks between columns effortlessly with drag-and-drop support.
- **Task Details**: Add titles, descriptions, due dates, priorities (Low, Medium, High), categories (Work, Personal, Study, Other), and subtasks.
- **Subtasks**: Include optional subtasks within tasks, with completion tracking.
- **Filtering**: Filter tasks by priority or category for quick access.
- **Sorting**: Sort tasks within columns by due date, priority, or creation date.
- **Search**: Search tasks by title or description.
- **Dark Mode**: Toggle between light and dark themes with persistence across sessions.
- **Due Date Notifications**: Receive alerts for tasks due today or tomorrow.
- **Undo Actions**: Undo task deletions, column moves, or clearing completed tasks.
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices.
- **Local Storage**: Tasks are saved locally in your browser for persistence.
- **Visual Feedback**: Animations for task creation, deletion, and completion enhance the user experience.

## Demo

Try TaskFlow with sample tasks pre-loaded for demonstration purposes. Open the app, and you'll see examples like "Complete project proposal" and "Buy groceries" to get started.

## Installation

To run TaskFlow locally, follow these steps:

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge).
- No additional software or server is required since it runs entirely in the browser.

### Steps

1. **Clone or Download the Repository**

   - Clone this repository:
     ```bash
     git clone https://github.com/rijul-mahajan/taskflow.git
     ```
   - Or download the ZIP file and extract it.

2. **Open the Project**

   - Navigate to the project directory:
     ```bash
     cd taskflow
     ```
   - Open `index.html` in your preferred web browser:
     - On Windows: Double-click `index.html` or use `start index.html`.
     - On macOS/Linux: Use `open index.html` or drag it into your browser.

3. **Start Using TaskFlow**
   - The app will load with sample tasks. You can begin adding, editing, or managing your own tasks immediately.

### Dependencies

- **Feather Icons**: Included via CDN (`https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.29.2/feather.min.js`) for lightweight icons.
- No additional setup is required beyond the provided files.

## Usage

### Adding a Task

1. Click the "Add Task" button or press `Ctrl + M` (`Cmd + M` on macOS).
2. Fill in the task details:
   - **Title**: Required.
   - **Description**: Optional.
   - **Subtasks**: Add optional subtasks by typing and clicking the "+" button.
   - **Due Date**: Optional, selectable via a date picker.
   - **Priority**: Choose Low, Medium, or High.
   - **Category**: Select Work, Personal, Study, or Other.
3. Click "Save Task" or press `Enter` to add it to the "To Do" column.

### Managing Tasks

- **Edit**: Click the pencil icon on a task to modify its details.
- **Delete**: Click the trash icon to remove a task (with an undo option).
- **Move**: Drag a task to another column (e.g., from "To Do" to "In Progress").
- **Complete Subtasks**: Check off subtasks within a task.
- **Clear Completed**: Use the trash icon in the "Completed" column to remove all completed tasks (undoable).

### Filtering and Sorting

- **Filters**: Click a filter (e.g., "High Priority" or "Work") to view specific tasks.
- **Search**: Type in the search bar to find tasks by title or description.
- **Sort**: Use the dropdown in each column to sort by Due Date, Priority, or Created At.

### Theme Toggle

- Click the moon/sun icon in the header to switch between light and dark modes. The preference is saved in local storage.

### Keyboard Shortcuts

- `Ctrl + M` / `Cmd + M`: Open the "Add Task" modal.
- `Esc`: Close the task modal.
- `Enter`: Save a task while in the modal.

## File Structure

```
taskflow/
├── index.html  # Main HTML file with structure and layout
├── script.js   # JavaScript logic for functionality
└── style.css   # CSS styles for design and responsiveness
```

## Customization

### Adding New Categories or Priorities

1. Edit `index.html` in the `<select id="task-category">` and `<select id="task-priority">` sections to add options.
2. Update `style.css` with corresponding styles (e.g., `.task.priority-newpriority` or `.badge-newcategory`).
3. Modify `script.js` filters if necessary (e.g., `activeFilter` logic).

### Changing Colors

- Adjust the `--primary`, `--success`, `--warning`, `--danger`, and `--gray-*` variables in `style.css` under `:root` and `.dark-mode`.

### Removing Sample Tasks

- In `script.js`, comment out or remove the `addSampleTasks()` call in the `DOMContentLoaded` event listener.

## Limitations

- **Local Storage**: Tasks are stored in the browser’s local storage, so clearing browser data will delete all tasks.
- **No Cloud Sync**: This is a standalone app without server-side storage or syncing.
- **Single User**: Designed for individual use without multi-user support.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure your code follows the existing style and includes comments where necessary.

## License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/mit) for details.
