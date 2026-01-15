---
title: Campaign Manager System
status: open
priority: 1
issue-type: task
assignee: 
created-at: 2026-01-15T00:00:00Z
blocks: []
---

Implement a Campaign Manager with 3 save slots and campaign switching.

- Create `src/components/CampaignManager.jsx` for selecting, creating, loading, deleting campaigns
- Create `src/components/OnboardingScreen.jsx` for new campaign/party setup
- Store campaigns in localStorage with metadata (name, created, last played, hero names, etc.)
- Add campaign utility functions in `src/utils/campaignStorage.js`
- Update `useGameState.js` and `App.jsx` for multi-campaign support

**Success Criteria:**  
- [ ] Campaign Manager shows 3 save slots  
- [ ] Can create, load, delete, export, import campaigns  
- [ ] OnboardingScreen walks through party creation  
- [ ] Per-character gold is rolled and pooled  
- [ ] Campaign list shows hero names  
- [ ] Auto-save after tile generation  
- [ ] Switch between campaigns seamlessly  
- [ ] All components accessible (ARIA labels)  
- [ ] No functionality broken
