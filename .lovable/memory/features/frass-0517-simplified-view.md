---
name: FRASS-0517 Simplified View Mode
description: Platform-wide View Preference — Standard vs Simplified (conversation-first) view, same data and capability, remembered per member
type: feature
---
One platform, two presentations. Standard View = full dashboards and tools.
Simplified View = greeting + Frassy + conversation + voice + text input + the one
current task with Approve/Next, and nothing else.

Rules:
- Both views reach the exact same data, workflows and capabilities. Presentation
  only. Reduced distraction, never reduced features.
- Never create another Daily or duplicate a Workshop for it. Wrap the existing
  workspace with the shared frame instead.
- Preference is platform-wide, stored on `profiles.view_mode` (plus localStorage
  for instant/offline), and applies to every compatible area until switched.
- The switch is always visible in the upper-right of a supporting workspace.
- In Simplified View, Frassy is the interface: she navigates for the member
  (FRASS-0513) rather than sending them through menus.
- Especially for new members, seniors, the less technical, cognitive overload,
  mobile and voice-first members. Every Business Vault supports both views.
