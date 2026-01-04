# Vendor Production Team - Quick Start Guide

## Overview

This directory contains the TODO list and agent skills for implementing vendor pages production readiness. The team will work collaboratively using specialized agent roles.

## Files

### 1. TODO List
**Location**: `.claude/todos/vendors-production-todos.md`

Comprehensive TODO list organized by phases:
- **Phase 1**: Critical (Launch Blockers) - 30 tasks
- **Phase 2**: High Priority (Competitive Necessities) - 15 tasks
- **Phase 3**: Important (User Experience) - 20 tasks
- **Phase 4**: Nice to Have (Enhancements) - 10 tasks
- **Technical Debt**: 10 tasks

**Total**: ~85 tasks, ~450 estimated hours

### 2. Agent Skills
**Location**: `.claude/skills/vendor-production-team/SKILL.md`

Defines 8 specialized agent roles:
- 🗄️ **DB-AGENT**: Database schema, migrations, queries
- 🔌 **API-AGENT**: Next.js API routes, business logic
- 🎨 **UI-AGENT**: React components, frontend
- 🧪 **TEST-AGENT**: Testing, quality assurance
- 🎯 **INTEGRATION-AGENT**: Third-party services, payments
- 🚀 **PERF-AGENT**: Performance optimization
- 🔍 **SEO-AGENT**: SEO, metadata, structured data
- 📝 **CONTENT-AGENT**: Content, copy, documentation

## How to Use

### For Agents

1. **Review the TODO list** in `.claude/todos/vendors-production-todos.md`
2. **Check your agent role** in `.claude/skills/vendor-production-team/SKILL.md`
3. **Claim a task** by updating the TODO status
4. **Follow collaboration patterns** defined in the skills document
5. **Update TODO status** as you progress

### Task Assignment

Tasks are prefixed with phase and number:
- `P1-X.X` = Phase 1, Critical
- `P2-X.X` = Phase 2, High Priority
- `P3-X.X` = Phase 3, Important
- `P4-X.X` = Phase 4, Nice to Have
- `TD-X` = Technical Debt

### Collaboration Flow

```
1. DB-AGENT creates migration
   ↓
2. API-AGENT creates API routes
   ↓
3. UI-AGENT implements frontend
   ↓
4. TEST-AGENT creates tests
   ↓
5. PERF-AGENT optimizes
   ↓
6. SEO-AGENT adds metadata
```

## Priority Order

### Must Complete First (Phase 1)
1. Real data integration
2. Server-backed search/filter/pagination
3. Lead capture and saving
4. Reviews pipeline
5. Real availability calendar
6. Payment processing

### Then Complete (Phase 2)
1. Messaging system
2. Advanced filtering
3. Map view
4. Vendor comparison tool

### Then Complete (Phase 3)
1. SEO & structured data
2. Performance optimizations
3. Real metrics & social proof
4. Category pages & SEO content

### Finally (Phase 4)
1. Portfolio enhancements
2. Vendor information additions
3. Analytics & tracking

## Status Tracking

Each TODO has a status:
- `pending` - Not started
- `in_progress` - Currently being worked on
- `completed` - Finished and verified
- `blocked` - Waiting on dependency
- `cancelled` - No longer needed

## Agent Responsibilities

### DB-AGENT
- All database migrations
- Query optimization
- Index creation
- Supabase functions

### API-AGENT
- All `/api/**/route.ts` files
- Request validation
- Business logic
- Error handling

### UI-AGENT
- All `components/vendors/**` files
- All `app/vendors/**` pages
- User experience
- Responsive design

### TEST-AGENT
- All test files
- Test coverage
- Bug verification
- Quality assurance

### INTEGRATION-AGENT
- Payment gateway setup
- WebSocket implementation
- External API integration
- Notification systems

### PERF-AGENT
- Performance optimization
- Code splitting
- Image optimization
- Caching strategies

### SEO-AGENT
- Metadata implementation
- Structured data
- Sitemap generation
- SEO compliance

### CONTENT-AGENT
- SEO content
- Category landing pages
- User-facing copy
- Documentation

## Communication

- Update TODO status when starting/completing tasks
- Comment on TODOs for questions or blockers
- Follow handoff checklist when passing work
- Document breaking changes immediately

## Success Criteria

### Phase 1 Complete When:
- ✅ All mock data replaced
- ✅ Search/filter/pagination working
- ✅ Booking submission functional
- ✅ Reviews pipeline operational
- ✅ Availability calendar integrated
- ✅ Payment processing working

### Production Ready When:
- ✅ All Phase 1 tasks complete
- ✅ Test coverage > 80%
- ✅ Performance scores > 90
- ✅ Zero critical bugs
- ✅ SEO metadata complete

---

*For detailed information, see:*
- *TODO List: `.claude/todos/vendors-production-todos.md`*
- *Agent Skills: `.claude/skills/vendor-production-team/SKILL.md`*
- *Production Readiness: `vendors-production-readiness.md`*
