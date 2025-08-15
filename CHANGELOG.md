# Changelog

The purpose of this file is to record all changes to the scaffold app, including minor version updates, pull requests, and releases/tags.

## Relationship between CHANGELOG.md PROMPTLOG.md files
PROMPTLOG.md contains useful AI agent prompts to fix and enhance the scaffold app. The prompts will include some used during changes logged below. Remember that AI agent prompts aren't exact, and you should use them as a template for your own purposes, rather than as-is. Re-running prompts is not guaranteed to provide the same results.

---

## tag: [v1.0.0-beta] — 14th August, 2025
- 
- Improve standard repo management and instructional files
- Improve menu and navigation management
- Small UI changes for demo pages
- Bugfix: Android drawable resources must use underscores but had hypens, so fixed gipity-image-resizer.py
- SQL script for clients to remove the demo notes schema/table from DB
- Support additional master logo (inverted colour) and creation of all variants for web/pwa/native

---

## tag: [v1.0.0-alpha] — 5th August, 2025
- Initial release of the Gipity Scaffold
- Build native (iOS/Android), web and PWA apps with Replit Agent
- Supabase integrated for auth, data and file storage
- JWT-protected APIs, RLS, and dev/prod switching