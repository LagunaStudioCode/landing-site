# Laguna Studio Code - Design & Copy Spec

## 1. Brand & Tone

* **Identity**: A collective of enthusiastic senior software engineers who love building cool things. Not a traditional agency, but a studio of builders.
* **Tone**: Senior engineer but casual. Smart, experimental, trustworthy, friendly. "Shop-talk" is welcome. Less "synergy" and "ROI", more "latency" and "shipping".
* **Visual Theme**: "Dark Future / Deep Space" (Inherited).
  * **Background**: Deep darks (`#0B0C10`).
  * **Accents**: Neon Cyan (`#66FCF1`) & Deep Magenta (`#C3073F`).
  * **Glassmorphism**: Used for cards and overlays.
* **Logo**: `src/assets/laguna-bay-logo.png`

## 2. Page Structure & Copy

### **Header**

* **Logo**: Laguna Studio Code (Use image asset).
* **Nav**: Experiments, The Crew, Contact.

### **Hero Section**

* **Headline**: "We Build Cool Shit." (Or slightly more professional: "Building the Future, One Commit at a Time.") -> *Let's go with: "Engineering First. Everything Else Second."*
* **Subheadline**: We are a collective of senior engineers building experimental software, robust platforms, and digital experiences. Got a crazy idea? We might just build it with you.
* **CTA**: "Check the Build Log" (Secondary) / "Let's Build" (Primary - Anchor to Contact).

### **Section 1: What We Tinker With (Capabilities)**

* **Title**: "Our Stack & Playground"
* **Intro**: We don't just glue APIs together. We build systems.
* **Cards**:
  1. **Full-Stack Systems**: From React/Next.js frontends to distributed Go/Rust backends. If it runs on Linux, we can build it.
  2. **AI & Agents**: Beyond the hype. Practical LLM integrations, RAG pipelines, and autonomous agents that actually do work.
  3. **Creative Coding**: WebGL, interactive 3D, and experimental UI. Making the web feel magical again.
  4. **Infrastructure**: Kubernetes, Serverless, Edge. We obsess over deployment velocity and reliability.

### **Section 2: The Build Log (Recent Experiments)**

* **Title**: "Recent Experiments"
* **Intro**: Things we've shipped recently. Some for clients, some for fun.
* **Content**: (Placeholders for now)
  * *Project Alpha*: High-performance vector search engine wrapper.
  * *Project Beta*: Real-time collaboration canvas for music theory.
  * *Project Gamma*: Automated investing agent with strict risk rails.

### **Section 3: The Crew (About Us)**

* **Title**: "Who Are We?"
* **Content**: We aren't salespeople. We're the engineers you usually wish you could talk to directly. We've led teams at major tech companies but prefer the freedom of the studio.
* **Values**:
  * *Code over Slides*: We prefer prototypes to pitch decks.
  * *Open Source*: We contribute back whenever we can.
  * *No BS*: We'll tell you if your idea is technically impossible (or just a bad idea).

### **Section 4: Contact (Signals)**

* **Title**: "Open a Channel"
* **Subheadline**: Have a project in mind? Or just want to talk shop? We're open to interesting work requests and collaborations.
* **Form Context**:
  * **Name / Email**: Standard.
  * **Type of Signal**: "Project Request", "Collaboration Idea", "Just Saying Hi".
  * **Message**: "Tell us what you want to build. Technical details encouraged."
  * **Submit Button**: "Send Signal".

## 3. Asset Mapping

* **Logo**: `src/assets/laguna-bay-logo.png`
* **Backgrounds**: Keep existing CSS shapes/gradients.
* **Icons**: Use Heroicons (outline/solid) as existing.

## 4. Technical Constraints

* **Framework**: Astro + Tailwind CSS.
* **Interactivity**: Minimal JS, mostly CSS animations.
* **Forms**: `astro:actions` (Zod validation).
