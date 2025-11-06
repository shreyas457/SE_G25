# Contributing to ByteBite

Thank you for your interest in contributing to **ByteBite** — a smart food redistribution system that connects restaurants, users, and shelters to reduce food waste.  
We welcome all contributions — from bug fixes and feature enhancements to documentation and testing support.

---

## How You Can Contribute

Here are several ways to get involved:

- **Bug Fixes:** Report and resolve issues in backend routes, database logic, or UI components.  
- **Feature Enhancements:** Propose new ideas such as advanced matching, recommendation engines, or reporting dashboards.  
- **Documentation:** Improve README sections, API docs, or add usage examples/tutorials.  
- **UI/UX Improvements:** Polish interfaces built with React, Vite interactions.  
- **Integration:** Extend APIs, data pipelines, or notification logic with third-party tools.  

---

## Project Tech Stack

- **Frontend:** React + Vite + CSS   
- **Backend:** Node.js + Express.js + MongoDB (Mongoose)  
- **Realtime:** Socket.IO   

---

## Getting Started

Follow these steps to contribute:

1. **Fork this repository**
   - Click the *Fork* button on the top-right of this page.

2. **Clone your fork**
   ```bash
    https://github.com/shreyas457/SE_G25.git

3. **Create a New Branch**
   ```bash
    git checkout -b feature/<short-feature-name>

4. **Make your changes**
- Implement your fix or feature in the appropriate directory.
- Run the project locally to verify it doesn’t break existing features.

5. **Commit your changes**
   ```bash
    git commit -m "feat: add <short-description>"

6. **Push your branch**
   ```bash
    git push origin feature/<short-feature-name>

7. **Make your changes**
- Go to your forked repository on GitHub.
- Click Compare & pull request.
- Clearly describe what your contribution does and why it’s needed.

---

## Code Style Guidelines

Please follow these conventions to maintain consistency across the project:
 
- Follow **semantic commit messages**:  
  - `feat:` – new feature  
  - `fix:` – bug fix  
  - `docs:` – documentation update  
  - `refactor:` – code refactoring  
- Keep functions **modular, reusable, and well-documented**.  
- Use **environment variables** for all API keys and secrets.  
- Add **inline comments** for complex logic or new routes.  

---

## Testing

Before submitting a Pull Request, make sure to test your changes thoroughly:

1. Run the backend server:
   ```bash
   npm run server
2. Run the frontend server:
   ```bash
   npm run dev
3. Check that your branch merges cleanly with main and passes all basic functionality checks.

---

## Communication and Support

- Use GitHub Issues to report bugs or request new features.
- For larger ideas, use GitHub Discussions.
- Tag maintainers in your PR description for review and feedback.

## Contributor License & Intellectual Property

- All contributions remain the intellectual property of their authors.
- By submitting a Pull Request, you agree to license your work under the project’s MIT License.
- This allows the ByteBite team to use, modify, and distribute your contribution with proper attribution.
