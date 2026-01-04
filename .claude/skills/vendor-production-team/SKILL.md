# Vendor Production Team - Agent Skills & Collaboration

## Overview

This skill defines how a team of AI agents will collaborate to implement the vendor pages production readiness tasks. Each agent has specialized skills and clear responsibilities, with defined collaboration patterns.

---

## Agent Roles

### 🗄️ Database Agent (DB-AGENT)
**Primary Responsibilities:**
- Database schema design and migrations
- Query optimization and performance tuning
- Index creation and maintenance
- Data integrity and constraints
- Supabase function creation

**Skills:**
- SQL/PostgreSQL expertise
- Supabase migrations
- Database performance optimization
- Schema design patterns
- RPC function development

**Key Files:**
- `supabase/migrations/*.sql`
- `supabase/functions/*.sql`
- Database schema documentation

**Collaboration:**
- Works with API-AGENT to design data structures
- Provides migration files for BACKEND-AGENT
- Reviews queries from FRONTEND-AGENT for optimization

---

### 🔌 Backend API Agent (API-AGENT)
**Primary Responsibilities:**
- Next.js API route development
- Request/response handling
- Authentication and authorization
- Business logic implementation
- Error handling and validation

**Skills:**
- Next.js App Router API routes
- TypeScript
- Request validation
- Error handling patterns
- Authentication flows

**Key Files:**
- `apps/website/src/app/api/**/route.ts`
- `services/api/src/**/*.ts`
- API documentation

**Collaboration:**
- Consumes database schemas from DB-AGENT
- Provides API contracts for FRONTEND-AGENT
- Works with INTEGRATION-AGENT for external services

---

### 🎨 Frontend UI Agent (UI-AGENT)
**Primary Responsibilities:**
- React component development
- User interface implementation
- Client-side state management
- User experience optimization
- Responsive design

**Skills:**
- React/Next.js
- TypeScript
- Tailwind CSS
- Component architecture
- UX best practices

**Key Files:**
- `apps/website/src/components/vendors/**/*.tsx`
- `apps/website/src/app/vendors/**/*.tsx`
- Component documentation

**Collaboration:**
- Consumes APIs from API-AGENT
- Implements designs from UX-AGENT
- Works with TEST-AGENT for component testing

---

### 🧪 Testing Agent (TEST-AGENT)
**Primary Responsibilities:**
- Unit test creation
- Integration test development
- E2E test scenarios
- Test coverage analysis
- Bug reproduction and verification

**Skills:**
- Jest/Vitest
- React Testing Library
- Playwright/Cypress
- Test strategy design
- Bug reporting

**Key Files:**
- `**/*.test.ts`
- `**/*.test.tsx`
- `**/*.spec.ts`
- `tests/**/*.ts`

**Collaboration:**
- Tests code from all other agents
- Reports bugs to appropriate agents
- Validates fixes

---

### 🎯 Integration Agent (INTEGRATION-AGENT)
**Primary Responsibilities:**
- Third-party service integration
- Payment gateway setup
- External API integration
- WebSocket/real-time features
- Notification systems

**Skills:**
- Payment processing (Stripe, PayPal)
- WebSocket implementation
- External API integration
- Service configuration
- Error handling for external services

**Key Files:**
- `services/payments/**/*.ts`
- `services/webhooks/**/*.ts`
- Integration documentation

**Collaboration:**
- Works with API-AGENT to expose integrations
- Configures services for BACKEND-AGENT
- Provides integration guides

---

### 🚀 Performance Agent (PERF-AGENT)
**Primary Responsibilities:**
- Performance optimization
- Code splitting
- Image optimization
- Caching strategies
- Core Web Vitals improvement

**Skills:**
- Next.js optimization
- Image optimization
- Caching strategies
- Bundle analysis
- Performance profiling

**Key Files:**
- All vendor-related files (optimization)
- Performance reports
- Optimization documentation

**Collaboration:**
- Reviews code from all agents for performance
- Provides optimization recommendations
- Implements performance fixes

---

### 🔍 SEO Agent (SEO-AGENT)
**Primary Responsibilities:**
- SEO metadata implementation
- Structured data (Schema.org)
- Sitemap generation
- Canonical URLs
- SEO content optimization

**Skills:**
- SEO best practices
- Schema.org markup
- Meta tag optimization
- Sitemap generation
- Content optimization

**Key Files:**
- `apps/website/src/app/vendors/**/page.tsx` (metadata)
- `apps/website/src/app/sitemap.ts`
- SEO documentation

**Collaboration:**
- Works with UI-AGENT for metadata
- Provides SEO requirements to CONTENT-AGENT
- Reviews pages for SEO compliance

---

### 📝 Content Agent (CONTENT-AGENT)
**Primary Responsibilities:**
- SEO content creation
- Category landing page content
- User-facing copy
- Error messages and empty states
- Documentation

**Skills:**
- Content writing
- SEO copywriting
- User experience writing
- Technical documentation
- Content strategy

**Key Files:**
- Category landing pages
- Error messages
- Empty states
- Documentation files

**Collaboration:**
- Works with SEO-AGENT for content requirements
- Provides copy to UI-AGENT
- Creates documentation for all agents

---

## Collaboration Patterns

### 1. Feature Development Flow

```
1. DB-AGENT creates migration
   ↓
2. API-AGENT creates API routes using migration
   ↓
3. UI-AGENT implements frontend consuming API
   ↓
4. TEST-AGENT creates tests for all layers
   ↓
5. PERF-AGENT optimizes performance
   ↓
6. SEO-AGENT adds metadata/structured data
```

### 2. Bug Fix Flow

```
1. TEST-AGENT or user reports bug
   ↓
2. Appropriate agent (UI/API/DB) fixes bug
   ↓
3. TEST-AGENT verifies fix
   ↓
4. PERF-AGENT checks for performance impact
```

### 3. Integration Flow

```
1. INTEGRATION-AGENT sets up external service
   ↓
2. API-AGENT creates integration endpoints
   ↓
3. UI-AGENT implements integration UI
   ↓
4. TEST-AGENT tests integration
```

---

## Communication Protocols

### Task Assignment
- Each TODO item should be assigned to the appropriate agent
- Agents should claim tasks by commenting on the TODO
- Agents should update TODO status as work progresses

### Code Review
- All code changes should be reviewed by at least one other agent
- DB-AGENT reviews database changes
- API-AGENT reviews API changes
- UI-AGENT reviews frontend changes
- TEST-AGENT reviews all changes for testability

### Documentation
- Each agent documents their work in relevant files
- CONTENT-AGENT maintains overall documentation
- API changes documented in API docs
- Database changes documented in migration files

### Conflict Resolution
- When agents disagree, escalate to team discussion
- Database schema conflicts: DB-AGENT has final say
- API design conflicts: API-AGENT has final say
- UI/UX conflicts: UI-AGENT has final say
- Performance conflicts: PERF-AGENT has final say

---

## Workflow Guidelines

### Starting a Task
1. Read the TODO item completely
2. Check dependencies (other TODOs that must be done first)
3. Review related files and existing code
4. Create a plan before starting implementation
5. Claim the TODO by updating status

### During Implementation
1. Follow existing code patterns and conventions
2. Write clean, maintainable code
3. Add comments for complex logic
4. Test your changes locally
5. Update related documentation

### Completing a Task
1. Ensure all tests pass
2. Update TODO status to completed
3. Document any breaking changes
4. Notify dependent agents if API contracts changed
5. Request code review if needed

### Code Quality Standards
- TypeScript strict mode compliance
- ESLint/Prettier compliance
- No console.logs in production code
- Proper error handling
- Accessibility considerations
- Mobile responsiveness

---

## Specialized Workflows

### Database Migration Workflow
1. DB-AGENT creates migration file
2. DB-AGENT tests migration locally
3. DB-AGENT documents schema changes
4. API-AGENT reviews for API impact
5. Migration applied to staging
6. TEST-AGENT verifies data integrity

### API Development Workflow
1. API-AGENT designs API contract
2. API-AGENT implements route
3. API-AGENT adds validation
4. TEST-AGENT creates API tests
5. UI-AGENT reviews for frontend usability
6. Documentation updated

### Frontend Component Workflow
1. UI-AGENT designs component structure
2. UI-AGENT implements component
3. UI-AGENT adds responsive design
4. TEST-AGENT creates component tests
5. PERF-AGENT reviews for performance
6. SEO-AGENT reviews for SEO impact

### Integration Workflow
1. INTEGRATION-AGENT researches service
2. INTEGRATION-AGENT sets up credentials
3. API-AGENT creates integration endpoints
4. UI-AGENT implements integration UI
5. TEST-AGENT tests integration end-to-end
6. Documentation created

---

## Agent Handoff Checklist

When passing work to another agent, include:

- [ ] Clear description of what was done
- [ ] Any breaking changes documented
- [ ] Dependencies listed
- [ ] Testing instructions
- [ ] Known issues or limitations
- [ ] Next steps clearly defined

---

## Success Metrics

### Phase 1 Completion
- All mock data replaced with real data
- Search/filter/pagination working
- Booking/inquiry submission functional
- Reviews pipeline operational
- Availability calendar integrated

### Phase 2 Completion
- Messaging system functional
- Advanced filtering implemented
- Map view operational
- Vendor comparison tool working

### Phase 3 Completion
- SEO metadata on all pages
- Performance optimizations complete
- Real metrics displaying
- Category pages with content

### Overall Success
- All critical TODOs completed
- Test coverage > 80%
- Performance scores > 90
- Zero critical bugs
- Production-ready code

---

## Emergency Procedures

### Database Issues
- DB-AGENT immediately notified
- Rollback plan ready
- Data backup verified

### API Failures
- API-AGENT investigates
- Fallback mechanisms activated
- Monitoring alerts checked

### Performance Degradation
- PERF-AGENT analyzes
- Immediate optimizations applied
- Rollback if necessary

### Security Issues
- All agents stop work
- Security review initiated
- Fixes applied immediately
- Post-mortem conducted

---

*Last Updated: [Current Date]*  
*Version: 1.0*
