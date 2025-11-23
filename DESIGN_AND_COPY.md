# Spacewalkers Marketing Site - Design & Copy Spec

## 1. Page Sections & Roles
Based on the plan and reference inspiration:

1.  **Hero**: High impact, sets the "AI Enablement" context.
    *   *Role*: Grab attention, define value prop ("Make sense of your AI tooling"), primary CTA.
2.  **The Problem/Who We Help**: Contextualize the struggle.
    *   *Role*: Resonate with target audience (companies, teams, individuals) feeling overwhelmed by AI hype/tooling.
3.  **Services (What We Do)**: Concrete offerings.
    *   *Role*: Show actionable services (Assessment, Workflow, Training, Governance).
4.  **Process (How We Work)**: The journey.
    *   *Role*: Reduce risk perception by showing a clear 4-step engagement model.
5.  **Proof/Credibility**: Trust signals.
    *   *Role*: "Trusted by" or "Experience at" logos/blurbs to establish seniority.
6.  **About Spacewalkers**: The Team/Philosophy.
    *   *Role*: Humanize the "Space" theme + Senior Engineering expertise.
7.  **Contact/Lead Gen**: Detailed form.
    *   *Role*: Capture qualified leads with detailed context.

---

## 2. Copy Draft

### **Hero Section**
*   **Headline**: Navigate the AI Frontier with Confidence.
*   **Subheadline**: We help engineering teams and forward-thinking companies cut through the noise, select the right tools, and build practical AI workflows that actually deliver value.
*   **Primary CTA**: Start Your Mission
*   **Secondary CTA**: Explore Our Services

### **Who We Help (The Crew)**
*   **Section Title**: AI Enablement for Every Scale
*   **Card 1: Forward-Thinking Companies**
    *   *Copy*: You need a strategy that goes beyond chatbots. We align AI adoption with your business goals, ensuring ROI and security.
*   **Card 2: Engineering Teams**
    *   *Copy*: Drowning in new tools? We help you build a coherent stack, automate grunt work, and ship AI-powered features faster.
*   **Card 3: Professionals & Individuals**
    *   *Copy*: Master the tools that matter. We provide focused training and workflow design to supercharge your personal productivity.

### **Services (Mission Objectives)**
*   **Section Title**: Practical AI Enablement
*   **Service 1: Tooling Assessment & Strategy**
    *   *Copy*: Stop guessing. We evaluate your current stack and needs to recommend the best-in-class AI tools for your specific context.
*   **Service 2: Workflow Design & Automation**
    *   *Copy*: AI isn't magic; it's engineering. We design robust workflows that integrate seamlessly into your existing processes.
*   **Service 3: Team Training & Workshops**
    *   *Copy*: Level up your team. Hands-on sessions to move from "prompt guessing" to systematic engineering.
*   **Service 4: Governance & Safety**
    *   *Copy*: Innovate responsibly. We help establish guardrails and policies to use AI securely and ethically.

### **Process (Flight Plan)**
*   **Section Title**: Your Flight Plan to AI Maturity
*   **Step 1: Discovery**
    *   *Copy*: We analyze your current state, identifying bottlenecks and high-impact opportunities.
*   **Step 2: Roadmap**
    *   *Copy*: We build a tailored strategy, selecting the right tools and defining clear milestones.
*   **Step 3: Pilot**
    *   *Copy*: We implement a proof-of-concept workflow to validate value before scaling.
*   **Step 4: Liftoff (Scale)**
    *   *Copy*: We roll out the solution, training your team and ensuring long-term adoption.

### **Proof/Credibility**
*   **Section Title**: Captained by Industry Veterans
*   **Content**: "Our team brings decades of software engineering experience and practical AI application. We don't just talk about AI; we build with it every day."
*   *(Placeholder for logos: "Trusted by teams at...")*

### **Contact (Mission Control)**
*   **Headline**: Ready to Launch?
*   **Subheadline**: Tell us about your mission. We'll help you chart the course.
*   **(Form Fields as defined in plan)**

---

## 3. Design Spec (Reference Implementation)

**Visual Theme**: "Dark Future / Deep Space"
*   **Background**: Dark almost-black (`#0B0C10` or similar) with subtle noise/grain.
*   **Accent Colors**:
    *   Primary: Cyan/Teal (`#66FCF1`) for primary buttons, key highlights.
    *   Secondary: Deep Purple/Magenta (`#C3073F` or gradient `45A29E`) for gradients and secondary accents.
*   **Typography**:
    *   Headings: Sans-serif, wide tracking, bold/uppercase for section headers (e.g., 'Inter', 'Space Grotesk', or system sans).
    *   Body: Highly legible sans-serif with good contrast (light grey on dark).

**Layout Specs (CSS Variables)**:
*   `--section-spacing`: `8rem` (generous vertical space).
*   `--container-width`: `1200px`.
*   `--radius`: `8px` (slightly rounded corners for cards/inputs).
*   `--glass-bg`: `rgba(255, 255, 255, 0.05)` with backdrop-blur.

**Section Breakdown**:
1.  **Hero**:
    *   Left: Text block (H1: 3.5rem+, H2: 1.25rem).
    *   Right: Large abstract "nebula" or "constellation" graphic.
    *   Background: Radial gradient from top-right (purple/blue).
2.  **Grid Sections (Services/Who We Help)**:
    *   3-column grid.
    *   Cards: Glassmorphism effect (dark semi-transparent bg, thin border).
    *   Hover: Glow effect (border color shift to Cyan).
3.  **Alternating Feature Blocks (Process)**:
    *   Row 1: Text Left, Image Right.
    *   Row 2: Image Left, Text Right.
    *   Connecting vertical line or dotted path to signify "flow".
4.  **Contact Form**:
    *   Two-column layout:
        *   Left: "Let's Talk" text + Contact Info.
        *   Right: The Form.
    *   Form styling: Dark inputs, light text, focus ring = Cyan.

---

## 4. Asset List

| Asset Name | Type | Description | Dimensions (Approx) |
| :--- | :--- | :--- | :--- |
| `hero-nebula.svg` | Vector/SVG | Abstract, dark purple/blue gradient mesh or nebula shape. Positioned absolute in Hero. | Full width/height cover |
| `icon-strategy.svg` | SVG Icon | Simple line icon representing strategy/assessment (e.g., compass or chart). | 48x48px |
| `icon-workflow.svg` | SVG Icon | Icon for workflow/automation (e.g., cog, flow nodes). | 48x48px |
| `icon-training.svg` | SVG Icon | Icon for training (e.g., graduation cap or presentation board). | 48x48px |
| `icon-governance.svg` | SVG Icon | Icon for safety/governance (e.g., shield or lock). | 48x48px |
| `process-step-1.svg` | Spot Illustration | Abstract visual for "Discovery" (e.g., magnifying glass in space). | 400x300px |
| `process-step-2.svg` | Spot Illustration | Abstract visual for "Roadmap" (e.g., star chart). | 400x300px |
| `process-step-3.svg` | Spot Illustration | Abstract visual for "Pilot" (e.g., rocket prototype). | 400x300px |
| `process-step-4.svg` | Spot Illustration | Abstract visual for "Scale" (e.g., fleet of ships). | 400x300px |
| `bg-stars.svg` | Pattern | Subtle repeatable star pattern for section backgrounds. | Tiled |

*(Note: For implementation, we will use CSS gradients and simple SVG shapes/placeholders if actual assets aren't provided immediately.)*

