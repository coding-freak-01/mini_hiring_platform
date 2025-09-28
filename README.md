# TalentFlow - Mini Hiring Platform

A comprehensive hiring platform built with React, featuring job management, candidate tracking, assessment building, and a Kanban-style pipeline.

## 🚀 Features

### Core Functionality
- **Jobs Board**: Create, edit, archive, and reorder jobs with drag-and-drop
- **Candidates Management**: Virtualized list with search and filtering
- **Kanban Pipeline**: Drag-and-drop candidate stage management
- **Assessment Builder**: Create dynamic assessments with multiple question types
- **Assessment Runtime**: Candidates can take assessments with validation
- **Candidate Profiles**: Detailed profiles with timeline and notes

### Technical Features
- **Real-time Persistence**: IndexedDB integration for data persistence
- **Optimistic Updates**: Immediate UI updates with rollback on errors
- **Error Handling**: 5-10% simulated error rate with proper error recovery
- **Latency Simulation**: 200-1200ms response delays for realistic testing
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router, Tailwind CSS
- **State Management**: Zustand
- **Database**: IndexedDB (Dexie)
- **API Mocking**: MirageJS
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Yup validation
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

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

### Key Components

#### Jobs Management
- **JobsBoard**: Main jobs listing with pagination, filtering, and sorting
- **JobModal**: Create/edit job form with validation
- **Drag & Drop**: Reorder jobs with optimistic updates

#### Candidates Management
- **CandidatesList**: Virtualized list for performance with 1000+ candidates
- **KanbanBoard**: Drag-and-drop pipeline management
- **CandidateProfile**: Detailed candidate view with timeline and notes

#### Assessment System
- **AssessmentBuilder**: Visual assessment creator with live preview
- **AssessmentRuntime**: Candidate-facing assessment interface
- **Question Types**: Short text, long text, single/multi-choice, numeric, file upload

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

## 🎯 Key Features Implementation

### 1. Optimistic Updates with Rollback
```javascript
// Jobs reordering with rollback
const handleDragEnd = async (event) => {
  // Optimistic update
  const newJobs = arrayMove(jobs, oldIndex, newIndex)
  setJobs(newJobs)

  try {
    const response = await fetch(`/api/jobs/${active.id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ fromOrder, toOrder })
    })

    if (!response.ok) {
      // Rollback on error
      setJobs(originalJobs)
      toast.error('Reorder failed; reverted.')
    }
  } catch (error) {
    setJobs(originalJobs)
    toast.error('Reorder failed; reverted.')
  }
}
```

### 2. IndexedDB Persistence
```javascript
// Write-through to IndexedDB
const job = schema.jobs.create(attrs)
await db.jobs.put(job.attrs)
```

### 3. Error Simulation
```javascript
const shouldSimulateError = () => Math.random() < 0.08 // 8% error rate
const simulateLatency = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 1000 + 200)
)
```

### 4. Virtualized Lists
```javascript
import { FixedSizeList as List } from 'react-window'

<List
  height={600}
  itemCount={candidates.length}
  itemSize={80}
  itemData={{ candidates, onViewProfile }}
>
  {CandidateRow}
</List>
```

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

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables
- `VITE_API_MODE=mirage` - Use MirageJS for API mocking

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Environment setup**
   - No environment variables required for basic functionality
   - IndexedDB works in all modern browsers

## 📊 Performance Considerations

### Virtualization
- Candidates list uses `react-window` for 1000+ items
- Only visible items are rendered
- Smooth scrolling and interaction

### Data Persistence
- IndexedDB for client-side storage
- Automatic data rehydration on app load
- Write-through caching for reliability

### Error Handling
- Optimistic updates for better UX
- Automatic rollback on errors
- User-friendly error messages

## 🎨 UI/UX Features

### Design System
- **Colors**: Consistent color palette with semantic meaning
- **Typography**: Inter font family for readability
- **Spacing**: Consistent spacing scale
- **Components**: Reusable component library

### Interactions
- **Drag & Drop**: Smooth drag-and-drop with visual feedback
- **Loading States**: Skeleton loaders and spinners
- **Empty States**: Helpful empty state messages
- **Error States**: Clear error messages with recovery options

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Built with ❤️ for modern hiring workflows**