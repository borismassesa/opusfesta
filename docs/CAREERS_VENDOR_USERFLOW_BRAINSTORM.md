# Careers Vendor User Flow - Brainstorm

## Current Flow (Baseline)
1. **Browse jobs** — Anyone can see all job listings with full descriptions
2. **View job details** — Full job description page is public
3. **Apply** — Only the application form requires authentication

## Problems with Current Flow

### 1. **No Engagement Before Commitment**
- Users see everything immediately, reducing motivation to create account
- No value proposition for signing up
- Missing opportunity to build interest and collect leads

### 2. **No Personalization**
- Same experience for everyone regardless of background
- Can't track what jobs users are interested in
- No way to recommend relevant positions

### 3. **No Application Management**
- Users can't track their applications
- No draft saving (though this exists, it's not discoverable)
- No way to see application status

### 4. **Poor Conversion Funnel**
- High friction at the last step (full form)
- No progressive engagement
- Missing opportunities to nurture candidates

---

## Proposed Improved User Flows

### **Option 1: Progressive Disclosure (Recommended)**
**Philosophy:** Tease content, require engagement for full details

#### Flow:
```
1. Browse Jobs (Public)
   ├─ See: Title, Department, Location, Employment Type, Salary Range
   ├─ See: Short teaser (first 150 chars of description)
   └─ See: "View Full Details" button (requires login)

2. View Job Details (Authenticated)
   ├─ Full job description
   ├─ Requirements & Responsibilities
   ├─ Benefits & Company Culture
   └─ "Apply Now" button

3. Apply (Authenticated)
   ├─ Pre-filled form (from profile)
   ├─ Resume upload (saved to profile)
   └─ Draft saving (auto-save every 30s)
```

#### Benefits:
- ✅ Creates value for account creation
- ✅ Allows tracking of interested candidates
- ✅ Better conversion funnel
- ✅ Can send follow-up emails to interested users

#### Implementation:
- API returns truncated descriptions for unauthenticated users
- "View Full Details" → `/login?next=/careers/[id]`
- After login, redirect to full job page
- Track "job views" for analytics

---

### **Option 2: Save & Apply Later**
**Philosophy:** Let users collect jobs, then apply when ready

#### Flow:
```
1. Browse Jobs (Public)
   ├─ Full listings visible
   ├─ "Save Job" button (requires login)
   └─ "Quick Apply" for authenticated users

2. Saved Jobs Dashboard (Authenticated)
   ├─ List of saved jobs
   ├─ Application status
   ├─ "Apply Now" buttons
   └─ Notes/comments per job

3. Quick Apply Modal (Authenticated)
   ├─ Pre-filled form
   ├─ Resume from profile
   └─ One-click apply (if profile complete)
```

#### Benefits:
- ✅ Reduces friction for browsing
- ✅ Allows users to research multiple jobs
- ✅ Better application quality (more time to prepare)
- ✅ Increases return visits

#### Implementation:
- Add `saved_jobs` table (user_id, job_id, saved_at)
- "Save Job" → `/login?next=/careers/[id]?action=save`
- Saved jobs page: `/careers/saved`
- Quick apply uses profile data

---

### **Option 3: Smart Matching & Recommendations**
**Philosophy:** Personalize experience based on profile and behavior

#### Flow:
```
1. Browse Jobs (Public)
   ├─ Default: All jobs
   └─ "Get Personalized Recommendations" (requires login)

2. Personalized Dashboard (Authenticated)
   ├─ "Recommended for You" section
   ├─ Based on: Skills, Experience, Location, Preferences
   ├─ Match score (e.g., "95% match")
   └─ "Why this job?" explanation

3. Application Tracking (Authenticated)
   ├─ Application status timeline
   ├─ Interview scheduling
   ├─ Next steps
   └─ Communication history
```

#### Benefits:
- ✅ Better candidate-job fit
- ✅ Reduces application spam
- ✅ Higher quality applications
- ✅ Better user experience

#### Implementation:
- User profile: skills, experience, preferences
- Matching algorithm (simple scoring)
- Recommendations API endpoint
- Application tracking dashboard

---

### **Option 4: Hybrid Approach (Best of All)**
**Philosophy:** Combine multiple strategies for optimal conversion

#### Flow:
```
Phase 1: Discovery (Public)
├─ Browse all jobs
├─ See: Title, Department, Location, Salary, Short teaser (100 chars)
├─ "View Details" → Login prompt
└─ "Save for Later" → Login prompt

Phase 2: Engagement (Authenticated)
├─ View full job descriptions
├─ Save jobs to "My Jobs"
├─ Get personalized recommendations
└─ See application status

Phase 3: Application (Authenticated)
├─ Quick Apply (if profile complete)
├─ Full Apply (with draft saving)
└─ Application tracking
```

#### Features:

**1. Job Teaser (Public)**
```
┌─────────────────────────────────────┐
│ Senior Full-Stack Developer        │
│ Engineering • Remote • TZS 5M-8M   │
│                                    │
│ We're looking for an experienced   │
│ developer to join our team...      │
│ [View Full Details] [Save Job]     │
└─────────────────────────────────────┘
```

**2. Full Job Page (Authenticated)**
```
┌─────────────────────────────────────┐
│ [Full Description]                  │
│ [Requirements]                      │
│ [Benefits]                          │
│ [Company Culture]                   │
│                                    │
│ [Apply Now] [Save Job] [Share]     │
└─────────────────────────────────────┘
```

**3. My Jobs Dashboard (Authenticated)**
```
┌─────────────────────────────────────┐
│ Saved Jobs (3)                      │
│ ─────────────────────────────────── │
│ • Senior Developer - Saved 2d ago   │
│   [View] [Apply] [Remove]           │
│ • Product Manager - Saved 1w ago    │
│   [View] [Apply] [Remove]           │
│                                    │
│ My Applications (2)                 │
│ ─────────────────────────────────── │
│ • Frontend Developer - Under Review │
│   Applied 3d ago • Last update: 1d │
│ • Backend Engineer - Interview     │
│   Applied 1w ago • Interview: 2d    │
└─────────────────────────────────────┘
```

**4. Quick Apply (Authenticated, Profile Complete)**
```
┌─────────────────────────────────────┐
│ Quick Apply                          │
│ ─────────────────────────────────── │
│ Using: John Doe's profile            │
│ Resume: john-doe-resume.pdf          │
│ Email: john@example.com              │
│                                    │
│ [Optional: Add Cover Letter]        │
│                                    │
│ [Submit Application]                │
└─────────────────────────────────────┘
```

---

## Additional Features to Consider

### **1. Email Notifications**
- New jobs matching saved searches
- Application status updates
- Interview reminders
- Weekly digest of new positions

### **2. Application Status Tracking**
- Real-time status updates
- Timeline view of application progress
- Interview scheduling integration
- Communication history

### **3. Profile Builder**
- Skills assessment
- Portfolio upload
- Work experience
- Education history
- Preferences (remote, salary, etc.)

### **4. Social Proof**
- "X people applied" (anonymized)
- "Y people viewed" (anonymized)
- Company reviews/ratings
- Employee testimonials

### **5. Advanced Filtering**
- Skills-based search
- Experience level
- Salary range slider
- Remote/hybrid/onsite
- Company size
- Industry

### **6. Application Analytics (For Users)**
- Application success rate
- Average response time
- Interview conversion rate
- Skills gap analysis

### **7. Draft Management**
- Auto-save drafts every 30 seconds
- Multiple drafts per job
- Resume versioning
- Cover letter templates

### **8. Referral System**
- Share job with friends
- Referral tracking
- Bonus incentives

---

## Recommended Implementation Priority

### **Phase 1: Foundation (Week 1-2)**
1. ✅ Implement progressive disclosure (teaser → full details)
2. ✅ Add "Save Job" functionality
3. ✅ Create "My Jobs" dashboard
4. ✅ Application tracking page

### **Phase 2: Enhancement (Week 3-4)**
5. ✅ Quick Apply for profile-complete users
6. ✅ Email notifications (new jobs, status updates)
7. ✅ Advanced filtering
8. ✅ Draft auto-save improvements

### **Phase 3: Personalization (Week 5-6)**
9. ✅ Job recommendations
10. ✅ Profile builder
11. ✅ Skills matching
12. ✅ Application analytics

### **Phase 4: Advanced (Week 7+)**
13. ✅ Social proof features
14. ✅ Referral system
15. ✅ Interview scheduling
16. ✅ Mobile app features

---

## Technical Considerations

### **Database Schema Changes**
```sql
-- Saved jobs
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  job_posting_id UUID REFERENCES job_postings(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, job_posting_id)
);

-- Job views tracking
CREATE TABLE job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES job_postings(id),
  user_id UUID REFERENCES users(id) NULL, -- NULL for anonymous
  viewed_at TIMESTAMP DEFAULT NOW(),
  source TEXT -- 'listing', 'search', 'recommendation', etc.
);

-- User preferences for recommendations
ALTER TABLE users ADD COLUMN job_preferences JSONB;
-- { skills: [], locations: [], remote: true, salary_min: 0 }
```

### **API Endpoints**
```
GET  /api/careers/jobs              # Public: teasers, Auth: full
GET  /api/careers/jobs/[id]         # Public: teaser, Auth: full
POST /api/careers/jobs/[id]/save    # Auth: save job
GET  /api/careers/saved             # Auth: saved jobs
GET  /api/careers/recommendations   # Auth: personalized
GET  /api/careers/my-applications   # Auth: application status
POST /api/careers/quick-apply       # Auth: one-click apply
```

### **Authentication Flow Updates**
```
Unauthenticated:
  - See job teasers
  - "View Details" → /login?next=/careers/[id]
  - "Save Job" → /login?next=/careers/[id]?action=save

Authenticated:
  - See full job details
  - Save/unsave jobs
  - Quick apply
  - Track applications
```

---

## Success Metrics

### **Key Performance Indicators**
1. **Conversion Rate**: Anonymous → Registered → Applied
2. **Engagement**: Average jobs viewed per session
3. **Retention**: Return visitors, saved jobs usage
4. **Application Quality**: Completion rate, time to apply
5. **User Satisfaction**: NPS, feedback scores

### **Target Metrics**
- 30% of job viewers create account
- 50% of registered users save at least one job
- 40% of saved jobs result in applications
- 60% application completion rate
- 25% return visitor rate

---

## User Experience Principles

1. **Progressive Enhancement**: Start simple, add features for engaged users
2. **Value First**: Show value before asking for commitment
3. **Friction Reduction**: Make it easy to browse, save, and apply
4. **Transparency**: Clear application status, expectations
5. **Personalization**: Tailor experience to user preferences
6. **Mobile-First**: Ensure great experience on all devices

---

## Next Steps

1. **Review & Prioritize**: Decide which features align with business goals
2. **User Research**: Survey current users about pain points
3. **Prototype**: Build quick prototypes for key flows
4. **A/B Testing**: Test progressive disclosure vs. full access
5. **Iterate**: Launch Phase 1, gather feedback, improve
