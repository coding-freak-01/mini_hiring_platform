# TalentFlow - Mini Hiring Platform

A comprehensive hiring platform built with React, featuring job management, candidate tracking, assessment building, and a Kanban-style pipeline.

---

## 🚀 Features

### Core
- **Jobs Board**: Create, edit, archive, and reorder jobs with drag-and-drop.
- **Candidates**: Virtualized list with search & filters.
- **Kanban Pipeline**: Drag candidates between stages (applied → hired).
- **Assessments**: Build dynamic assessments with multiple question types.
- **Assessment Runtime**: Candidates attempt assessments with validation.
- **Profiles & Timeline**: Candidate details with stage history and notes.

### Technical
- **IndexedDB persistence** with Dexie.
- **Optimistic updates** with rollback on failure.
- **Latency simulation** (200–1200ms) and random error rate (5–10%).
- **Virtualized candidate list** for 1000+ entries.
- **Responsive design** with Tailwind CSS.
- **Accessibility**: Keyboard navigation & ARIA support.

---

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite
- **State Management**: Zustand
- **API Mocking**: MirageJS
- **Database**: IndexedDB (Dexie)
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Forms & Validation**: React Hook Form + Yup
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini_hiring_platform/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Architecture

### Data Flow
```
UI Components → API Calls → MirageJS → IndexedDB
                ↓
            Error Handling & Rollback
```

## 🧩 Components

### Jobs Management
- **JobsBoard** → Job listings with pagination, filtering, and drag-and-drop reordering.  
- **JobModal** → Modal form for creating and editing jobs.

### Candidates Management
- **CandidatesList** → Virtualized list for handling 1000+ candidates efficiently.  
- **KanbanBoard** → Stage pipeline with drag-and-drop candidate movement.  
- **CandidateProfile** → Detailed profile view including timeline and notes.

### Assessment System
- **AssessmentBuilder** → Create and update assessments with multiple question types.  
- **AssessmentRuntime** → Candidate-facing UI for taking assessments.


### API Endpoints

#### Jobs
- `GET /api/jobs` - List jobs with pagination and filtering
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id/reorder` - Reorder jobs (with error simulation)

#### Candidates
- `GET /api/candidates` - List candidates with search and filtering
- `POST /api/candidates` - Create new candidate
- `PATCH /api/candidates/:id` - Update candidate stage
- `GET /api/candidates/:id/timeline` - Get candidate timeline

#### Assessments
- `GET /api/assessments/:jobId` - Get assessment for job
- `PUT /api/assessments/:jobId` - Save assessment
- `POST /api/assessments/:jobId/submit` - Submit assessment response

---

## 🧪 Testing Features

### Error Simulation
- **Write Errors**: 5-10% of write operations fail randomly
- **Latency**: 200-1200ms response delays
- **Rollback Testing**: Drag-and-drop operations test rollback logic

### Data Seeding
- **25 Jobs**: Mix of active/archived with realistic titles
- **1000 Candidates**: Distributed across jobs and stages
- **5 Assessments**: With 10+ questions each, multiple question types

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: sm, md, lg, xl with appropriate layouts
- **Touch-friendly**: Large touch targets for mobile interaction
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

---

## 📊 Performance Considerations

### Large Dataset Handling
- Seeded with **1000+ candidates** and **25 jobs**, the app uses pagination and virtualization to avoid rendering bottlenecks.
- Candidate list is powered by `react-window`, ensuring smooth scrolling even with thousands of entries.

### IndexedDB Persistence
- All MirageJS data is mirrored into **IndexedDB (Dexie)** for client-side persistence.
- On refresh, the app rehydrates state from IndexedDB instead of losing progress.
- This makes the app feel more "real-world" than a simple mock server.

### Optimistic Updates & Rollback
- Drag-and-drop reordering and stage updates apply changes instantly in the UI.
- If MirageJS simulates an error (5–10% of the time), the store reverts to the previous stable state.
- Provides a realistic testing ground for error handling without breaking flow.

### Query & Filtering Efficiency
- Server-side style filtering for jobs (by title, tags, status) and candidates (by name, email, stage).
- Keeps UI responsive by reducing the amount of data rendered at once.

### Latency Simulation
- Responses include **200–1200ms artificial delay** to mimic real network requests.
- Helps test spinners, skeleton loaders, and retry UX under realistic conditions.

### Role-Based Rendering
- Zustand’s persisted `auth-storage` keeps the logged-in user’s session across reloads.
- Prevents unnecessary re-fetching for auth state and reduces wasted renders.

### Lightweight State Management
- Zustand stores are scoped (`useJobStore`, `useCandidateStore`, `useAssessmentStore`, `useAuthStore`) to minimize unnecessary global re-renders.
- IndexedDB acts as a secondary cache, ensuring quick fallback if MirageJS errors occur.

---

## 🔮 Future Enhancements

### Potential Improvements
- **Real-time Collaboration**: WebSocket integration
- **Advanced Analytics**: Charts and reporting
- **Email Integration**: Automated email notifications
- **Calendar Integration**: Interview scheduling
- **Video Interviews**: WebRTC integration
- **AI Features**: Resume parsing and matching

### Technical Debt
- **Testing**: Add comprehensive test suite
- **Performance**: Bundle size optimization
- **Accessibility**: Enhanced screen reader support
- **Internationalization**: Multi-language support

## 🐛 Known Issues

1. **File Upload**: File upload UI is implemented but not functional
2. **Real-time Updates**: No real-time collaboration features
3. **Offline Support**: Limited offline functionality
4. **Mobile Performance**: Some animations may be slow on older devices

---

**Built with ❤️ for modern hiring workflows**