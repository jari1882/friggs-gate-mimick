# 📚 Frigg's Gate Frontend Technical Guide

This is the comprehensive technical textbook explaining how frontend technologies work. It focuses on **how the technology functions** conceptually, not implementation details or system architecture patterns.

---

# Table of Contents

[1. Browser Request Lifecycle: From Typed URL to Secure Request](#1-browser-request-lifecycle-from-typed-url-to-secure-request)  
[2. The 6 Categories Every Web Page Needs to Render](#2-the-6-categories-every-web-page-needs-to-render)
[3. Next.js: Application Framework](#3-nextjs-application-framework)  
[4. Node.js Runtime Environment](#4-nodejs-runtime-environment)  
[5. Yarn Package Management](#5-yarn-package-management)

---

# 1. Browser Request Lifecycle: From Typed URL to Secure Request

Before any user interface can be hydrated, styled, or made interactive, the browser must perform a complex sequence of actions — all of which happen before a single line of your app's front-end code executes. This is the **actual gateway** experience: when a user types a URL like `life-nervous-system.com` and presses Enter, initiating a full chain of network-layer cognition.

## Step 0: User Initiates Request in Chrome

### 🎯 Action  
The user opens Chrome and types a URL like:

- `life-nervous-system.com` (production)  
- `http://localhost:3000` or `http://127.0.0.1:3000` (local dev)

...then presses **Enter**.

### 🔍 Chrome: Initial Handling

1. **Scheme Handling**
   - If the user types a **full URL** (e.g. `https://...` or `http://...`), Chrome uses it as-is.
   - If the user types just a **domain** (e.g. `life-nervous-system.com`), Chrome decides whether to use HTTP or HTTPS.

2. **HSTS Enforcement Checks**
   - **HSTS Preload List**
     - Chrome checks its **internal HSTS preload list**.
     - This list is **maintained by Google** and shared via [https://hstspreload.org](https://hstspreload.org).
     - Other major browsers (Firefox, Safari, Edge, etc.) **import this list** to ensure consistent HTTPS enforcement across platforms.
     - If the domain is found in this list, Chrome **automatically upgrades** the request to `https://` without ever trying `http://`.
   - **Local HSTS State**
     - Chrome checks if this domain previously sent a `Strict-Transport-Security` header on a past HTTPS response.
     - If so, Chrome remembers this and **forces HTTPS** for this request as well.
   - ✅ In practice, nearly all public-facing domains are served over HTTPS.

3. **Local Cache Check**
   - Chrome checks:
     - **DNS cache**: Is the IP address already resolved?
     - **HTTP cache**: Is a valid HTTP response cached?

Only **after** these checks does Chrome proceed to DNS resolution.

## Step 1: DNS Resolution (Domain Name System)

### 🎯 Action  
Chrome needs an IP address for a domain like `life-nervous-system.com`. It uses DNS to turn the name into a number.

### 🌐 DNS: Step-by-Step

1. **Browser Cache Check**  
   Chrome first checks its own DNS cache.  
   If it finds a valid IP, it uses it right away.

2. **Delegates to OS**  
   If not cached, Chrome asks the OS to resolve the name.  
   This is a built-in OS function that contacts a DNS server.

3. **DNS Resolution Chain**  
   The DNS server looks it up in steps:  
   - 🏛 **Root Server** → says who handles `.com`  
   - 🧭 **TLD Server** → says who handles `life-nervous-system.com`  
   - 🧠 **Authoritative Server** → returns the IP address

4. **Return Path**  
   The DNS server sends the answer to the OS →  
   the OS gives it to Chrome →  
   Chrome now has the IP address of the server that will handle the request —  
   often a CDN edge server that's geographically optimized for the user's location —  
   and moves on to make a connection.

## Step 2: Making a Secure Connection to the Server

### 🎯 Action  
Now that Chrome knows the IP address of the server (e.g. `99.88.77.66`), it needs to talk to that server.  
First, it creates a connection. Then, if the website uses **HTTPS (HyperText Transfer Protocol Secure)**, it sets up **encryption** so nobody can spy on the data.

## 🔗 First: Set Up a Connection (TCP)

Chrome uses a basic "conversation rule" called **TCP (Transmission Control Protocol)**.  
It's how two computers agree to talk clearly and reliably.

### 🪜 1. Chrome says: "Can we talk?"  
Chrome sends a message called **SYN** to the server's IP address, asking to start a conversation.

### 🪜 2. Server replies: "Sure, I'm listening"  
The server sends back **SYN-ACK**, saying "yes, go ahead."

### 🪜 3. Chrome replies: "Great, let's go"  
Chrome sends one more message: **ACK**.  
Now both sides agree — the **connection is ready**.

## 🔒 Then: Make It Secure (TLS)

Since the site uses **HTTPS**, Chrome wants to **encrypt** everything — so hackers, Wi-Fi snoops, or bad routers can't read the data.

This uses a security system called **TLS (Transport Layer Security)** — it runs *on top of TCP*.  
That just means: first they talk, **then they make it private**.

### 🔐 4. Chrome says: "Let's talk privately"  
Chrome sends a **ClientHello** message. It says:
- "Here are the kinds of encryption I understand"
- "Here's the website I want to talk to"
- "Here's a random number to help create a secret"

### 🧾 5. Server replies: "Okay — here's who I am"  
The server responds with:
- A **certificate** (like a digital ID card) to prove who it is  
- A matching random number  
- Its own encryption info

### 🕵️ 6. Chrome checks the certificate  
It makes sure:
- The website name matches  
- The certificate is signed by a trusted company  
- It's not expired or fake  

If everything checks out, **Chrome trusts the server**.

### 🔑 7. They create a secret code  
Using the random numbers and some clever math, Chrome and the server **agree on a secret key**.  
They never send this key over the internet — they both just **calculate it**.

### ✅ 8. They say: "Ready to go!"  
They each send a final message (encrypted using the new secret key) that says:
- "I'm ready"
- "Let's start sending real data"

Now the **connection is secure**.

## ✅ Result  
Chrome and the server can now **talk privately and securely**.  
Next, Chrome sends the actual request:  
**"Give me the homepage, please."**

---

## Step 3: Browser Sends HTTP Request

### 🎯 What's Happening  
Now that the connection is secure, Chrome sends a message to the server saying:

> "Here's what I want."

This might be:
- A page (`GET /`)
- A file (`GET /style.css`)
- An API call (`POST /api/data`)
- A form submission (`POST /signup`)

### 🧾 What the Message Looks Like

```
GET / HTTP/1.1                     # I want the homepage  
Host: life-nervous-system.com      # This is for life-nervous-system.com  
User-Agent: Mozilla/5.0 (...)      # I'm Chrome (or another browser)  
Accept: text/html                  # I can read HTML  
Accept-Encoding: gzip, br          # You can compress your reply  
Connection: keep-alive             # Keep this connection open for more  
```

### 🔒 It's All Encrypted  
This entire message is locked with TLS.  
No one in the middle (Wi-Fi, ISP, hacker) can see what's inside — only the server can.

### 🚀 Sent Over the Internet  
Chrome sends the encrypted request to the server's IP address.  
The server gets it, decrypts it, and prepares a response.

### ✅ Result  
The server now knows exactly what you want — and it's ready to respond.

But what comes back isn't just "the homepage." Chrome receives a **renderable payload** — a structured, interdependent set of building blocks that define everything the browser needs to display the page. In modern stacks like LNS, that includes:

1. **HTML** — the skeletal structure  
2. **CSS** — all style definitions  
3. **JavaScript** — client-side behavior  
4. **Data payloads** — actual content  
5. **Assets** — images, icons, fonts  
6. **Bootstrapping code** — hydration and runtime state

These aren't optional — they are the six non-negotiables of browser rendering. Without them, the page doesn't exist.

---

# 2. The 6 Categories Every Web Page Needs to Render

If you walked up to a web developer and said:

> "There are six categories of information the browser needs to render any web page,"

—they'd say, *"Who are you, and why are you telling me something completely correct?"*  
Then probably squint and add, *"Are you some kind of rendering psycho?"*

And you'd say: *"Maybe. But Chrome agrees with me — here's how it works."*

- Chrome parses **HTML** to build the DOM — the structured skeleton of the page.  
- It parses **CSS** next, building a CSSOM that controls what everything should look like.  
- It runs **JavaScript** to attach behavior, modify content, and react to interaction.  
- It fetches **data payloads** to populate the UI with dynamic, real-world content.  
- It loads **assets** like images, fonts, and icons to make the page feel complete.  
- And finally, it runs **bootstrapping code** to wire everything up and bring the app to life.

This is that list — explained not just as what they are, but what they *do*, *why they matter*, and *how they fit* into the system.

## 1. HTML Structure

HTML is the **skeleton** of every page. It defines the elements — text blocks, inputs, buttons, images — and the relationships between them (nesting, grouping, flow).

Without HTML, the browser has no frame to render, no targets to style, and no content to interact with.

HTML defines the **Document Object Model** — the **DOM** — which is the tree-like structure the browser builds in memory to represent the page.

Each HTML tag becomes a **node** in this tree:
- `<div>` → element node  
- Text inside → text node  
- Nested tags → branches  

The DOM is what everything else talks to:
- **CSS** targets DOM elements to style them  
- **JavaScript** reads and modifies the DOM to add behavior or update content  

The browser constructs the DOM from the HTML source, even if the HTML is badly written — it auto-corrects to make the DOM usable.

> HTML defines the **page structure** — the DOM is what the browser **renders** and **scripts act upon**.

If there's no HTML, there's no DOM. And without the DOM, the page literally doesn't exist.

In the LNS stack, HTML is not written manually — it is dynamically generated by React components (via Next.js) during server-side or client-side rendering.

## 🎨 2. CSS Styling

CSS (Cascading Style Sheets) defines the **visual appearance** of the DOM.  
It tells the browser **how each element should look**, without changing what the element *is*.

CSS controls:
- **Color** (text, background, borders)
- **Layout** (positioning, alignment, spacing)
- **Typography** (fonts, size, weight, line height)
- **Responsive behavior** (via media queries)
- **Visual effects** (hover states, transitions, animations)

CSS rules are applied by the browser's **rendering engine** after the DOM is built.  
They can come from:
- External `.css` files
- `<style>` blocks in HTML
- Inline `style=""` attributes
- JS-driven systems (e.g. Emotion, Tailwind, Chakra)

> CSS doesn't add or remove content — it defines **what the content should *look* like**.

Without CSS, a web page still functions, but it looks unstyled, inaccessible, and unprofessional.

### Four Layers of Styling

In modern UI systems, CSS isn't written as one giant stylesheet. It's layered — from global defaults down to one-off overrides. In your stack (Tailwind + Chakra + Emotion), those layers are clearly defined.

#### 🧠 1. Foundational Styling

Foundational styling sets the **default look and behavior** of the entire app before any individual components are styled. It creates the baseline visual system: fonts, spacing, background colors, link behavior, and layout rules.

These are the **core baseline pieces** every interface needs:

- Global font (family, size, weight)
- Base background color
- Text color defaults
- Link styling (color, underline, hover)
- Universal layout rules (e.g. box-sizing, height defaults)
- Theme tokens (spacing, color, typography scales)

##### 📦 Where These Come From in Your Stack

| Foundational Element                      | Comes From                                                           |
|-------------------------------------------|----------------------------------------------------------------------|
| Font family, size, weight                 | `globals.css` + Chakra theme via `ChakraProvider`                   |
| Base background color                     | `globals.css`, Chakra theme, or inline styles                       |
| Text color defaults                       | Chakra color tokens + Tailwind classes                              |
| Link behavior                             | `globals.css` overrides for `a` tags                                |
| Layout rules (`box-sizing`, height)       | Tailwind utilities + base CSS setup                                 |
| Theme tokens (color, spacing, font sizes) | Chakra theme configuration                                          |

> **Mental model:** Foundational styles define the "starting point" for how things look. Every component inherits from this.

#### 🧱 2. Layout & Positioning

Layout defines **how elements are arranged** in space — how they flow, align, nest, and respond to different screen sizes.

These are the layout concerns every UI must handle:

- Flex and grid structures
- Widths, heights, constraints
- Padding, margins, gaps
- Responsive stacking and alignment
- Full-page height or sectional layout

##### 📦 Where These Come From in Your Stack

| Layout Concern                           | Comes From                                                             |
|------------------------------------------|------------------------------------------------------------------------|
| Flex/grid positioning                    | Tailwind (`flex`, `grid`, `justify-between`)                          |
| Spacing (padding, margin, gap)           | Tailwind (`p-4`, `gap-6`) + Chakra props (`p`, `m`)                   |
| Widths and heights                       | Tailwind (`w-full`, `h-screen`) + Chakra (`w`, `h`, `minW`, `maxH`)   |
| Alignment                                | Tailwind (`items-center`) + Chakra (`align`, `justify`)              |
| Section/container nesting                | Chakra `Box`, `Flex`, `Stack`, `Container` components                 |

> **Mental model:** Layout is **structure**. It controls where things go and how they behave in space — not what they look like.

#### 🎨 3. Component Appearance

Appearance defines the **reusable visual identity** of UI components — color, shape, shadows, and states like hover or focus. This layer makes buttons look like buttons and cards look like cards.

Key appearance elements:

- Background and text color
- Borders, shadows, radius
- Font size, weight, casing
- Internal padding
- Visual variants (e.g. solid, outline)
- State styles (hover, active, disabled)

##### 📦 Where These Come From in Your Stack

| Appearance Feature                       | Comes From                                                                |
|------------------------------------------|---------------------------------------------------------------------------|
| Color (bg, text)                         | Chakra props (`bg`, `color`, `colorScheme`) + Tailwind (`bg-`, `text-`)  |
| Borders and radius                       | Chakra props (`border`, `borderRadius`) + Tailwind (`rounded-lg`)        |
| Typography                               | Chakra (`fontSize`, `fontWeight`, `textTransform`) + Tailwind utilities  |
| Padding inside components                | Chakra (`px`, `py`, `p`) + Tailwind (`p-4`)                               |
| Visual variants                          | Chakra `variant` prop on Button, Input, etc.                             |
| State styling                            | Chakra internal states + Tailwind classes like `hover:bg-blue-600`       |

> **Mental model:** Appearance makes components **recognizable and consistent**. It's not layout — it's visual branding.

#### 🎯 4. One-Off Customization

One-off styles are **specific, localized tweaks** — for unique cases that don't generalize. These are exceptions, not reusable patterns.

Use cases:

- Temporary overrides
- Conditional styling logic
- Visual edge cases
- Dev-only or experimental visuals
- Per-page exceptions

##### 📦 Where These Come From in Your Stack

| Customization Type                       | Comes From                                                               |
|------------------------------------------|---------------------------------------------------------------------------|
| Inline tweaks                            | JSX `style={{ ... }}`                                                   |
| Unique class combinations                | Tailwind `className="..."` used once                                    |
| Conditional logic                        | Chakra dynamic props (`color={isActive ? 'green' : 'gray'}`)            |
| Prototype visuals                        | Hardcoded styles or temporary overrides                                 |
| Page-specific design                     | Tailwind or Chakra styles scoped to file or route                       |

> **Mental model:** One-off styling is **surgical**. It's precise, local, and intentionally isolated from global systems.

### ✅ Summary

CSS is more than decoration — it's a layered system that defines how content is visually expressed. In your stack:

- **Tailwind** handles utility-first layout and structure.
- **Chakra** manages theme-based appearance and component consistency.
- **Emotion** enables dynamic, scoped, CSS-in-JS logic.
- **Globals.css** defines core behavior defaults (font, box-sizing, spacing).

> These tools work together to let you build UIs that are fast to prototype, visually consistent, and deeply composable.

## 🚀 3. JavaScript Logic: The Behavioral Layer

JavaScript is the **behavioral layer** of web applications. It brings pages to life by listening for user input, fetching data, updating the DOM, and handling business logic. It runs inside the browser's **JavaScript engine** (e.g. V8 in Chrome) and transforms static documents into interactive applications.

> JavaScript defines **what happens** when something changes, clicks, or loads.

### Four Layers of JavaScript Logic

In modern applications, JavaScript operates across four distinct layers — from low-level browser interactions up to high-level business intelligence. Each layer connects directly to how browsers render web pages, handling everything from DOM manipulation to data orchestration.

#### 🔧 1. DOM Interaction Layer

The DOM interaction layer handles **direct communication with browser APIs** and raw DOM manipulation. This is where JavaScript interacts with the **actual rendered page** — the HTML structure and loaded assets — responding to user input and invoking built-in browser capabilities.

##### Core Browser Interactions

These are the low-level operations where JavaScript interfaces directly with the browser's runtime environment. While frameworks like React wrap and abstract much of this, your components still ultimately rely on these primitives to create dynamic, interactive behavior.

- **Event listeners** – capture user input like clicks, key presses, scrolling, or window resizing. React wraps these with `onClick`, `onChange`, etc., but under the hood it's still `addEventListener`

- **DOM API** – element selection and traversal. JavaScript doesn't interact with HTML directly — it uses the DOM API to access and manipulate the document. React typically handles this via its virtual DOM, but manual refs (`useRef`) or portal logic often require direct DOM access

- **Attribute and content manipulation** – update what elements say and how they behave by modifying text, classes, IDs, and data attributes. In React, this happens via props and state — but it compiles down to direct DOM changes

- **Browser API access** – the browser exposes system-level capabilities for storage, networking, and navigation. You typically use these through React effects or utility functions, not directly:
  - `localStorage`, `sessionStorage` – persist user data between visits or reloads
  - `fetch()` – request or submit data over HTTP
  - `history.pushState`, `location` – update the URL or handle routing without full reloads

- **Performance measurements** – capture metrics like render time, load duration, or layout shifts using the Performance API. React tools may surface some of this, but custom tracking hooks often go directly to the source

- **Media controls** – manipulate `<audio>`, `<video>`, or `<canvas>` content. React handles structure, but playback, drawing, and timing still rely on direct API calls

- **Asset loading** – JavaScript can dynamically create and insert tags like `<img>`, `<link>`, and `<script>` to load images, fonts, and scripts when needed. Frameworks like React offer lazy loading to delay this until a component or asset is actually required. However, it's still the browser that performs the actual network requests and handles rendering once the asset is requested

> **Mental model:** The DOM layer is where JavaScript **touches reality** — actual browser APIs, rendered elements, and loaded assets.

#### 🎭 2. Component Logic Layer

Component logic defines **how individual UI pieces behave** — their internal state, computed values, and local interactions. This layer encapsulates the JavaScript behavior within components, making them modular, reusable, and self-contained.

##### Component Concerns

- **Local state management** – track values that change over time within the component
- **Props validation and defaults** – receive, validate, and provide fallback behavior for parent-provided inputs
- **Computed/derived values** – create values based on existing state or props
- **Event handler methods** – define internal functions that respond to user actions
- **Side effects and cleanups** – manage lifecycle-sensitive behavior like subscriptions or timeouts
- **Conditional rendering logic** – decide when to show/hide parts of the UI based on internal conditions

> **Mental model:** Component logic is **encapsulated behavior**. Each component manages its own mini-universe of state and actions.

#### 🌐 3. Application State Layer

Application state manages shared, dynamic data that flows across your app. It keeps multiple parts of the UI in sync by holding information that persists beyond individual components and survives navigation.

**What kind of data lives here?**
- User authentication – identity, permissions
- Navigation – current route or view
- Server cache – fetched API data, real-time updates
- Global UI – modals, theme, loading states
- Form state – filters, multi-step progress
- System status – online/offline, sync, errors

🧠 **Mental Model: Single Source of Truth**
Think of application state as a shared control center. It holds important app-wide information in one place, allowing all components to read from or update it as needed.

🔁 **How It Works (React)**
Application state lives in memory using React's `useState`, `useReducer`, Context, or libraries like Redux. Components subscribe to just the parts they need, and React re-renders them automatically when that data changes—no manual DOM updates.

🧭 **Analogy**
A shared dashboard in a control room: every component watches it to know what's happening, and when the dashboard updates, they all respond immediately.

#### 🏭 4. Business Logic Layer

Business logic contains domain-specific rules and workflows that orchestrate your application's intelligence. This layer handles the bootstrapping code and complex decision-making that makes your app more than just a collection of UI components.

In our architecture, **JavaScript retains the ability to perform all of these functions**, but **we strategically offload as much cognitive work as possible to the Bifröst backend**. This keeps the frontend responsive, maintainable, and focused on delegation rather than decision-making.

**JavaScript Can Still Handle:**
- **Data validation rules** – ensuring input integrity before making Cypher calls
- **Calculation engines** – lightweight or fallback computations (e.g., totals, client-side logic)
- **Workflow orchestration** – UI-level sequencing, optimistic updates, or retry logic
- **API integration logic** – transforming Cypher inputs/outputs, managing fetch states
- **Format transformations** – local formatting for display (e.g., currency, i18n)
- **Permission/access rules** – enforcing role gates or feature flags before invoking backend

**Backend Delegation:** Whenever feasible, we push heavy logic (reasoning, decision trees, chaining, data processing) to **Bifröst Cyphers**, treating frontend logic as a routing and formatting layer that invokes structured cognition downstream.

**Mental model:** JavaScript remains capable of executing business logic, but in LNS, it acts as a **facilitator and interpreter** — shaping and interpreting requests to/from Cyphers, rather than owning the complexity itself.

### Technical Context

#### Language to CPU Execution

When you write JavaScript, it flows through a layered system:

1. **JavaScript Source** → Your `.js` files
2. **V8 Runtime** → Object model, types, memory, host APIs  
3. **JIT Compilation** → Bytecode compiled to native machine code during runtime
4. **CPU Execution** → Direct machine code execution for performance

This differs from interpreted languages like Python, where code runs through a virtual machine. JavaScript's Just-In-Time compilation makes it exceptionally fast for interactive applications.

#### From Scripts to Systems: JavaScript Evolution

##### The Early Days
Originally, JavaScript was basic. You'd drop a single `<script>` tag into a page. All logic lived in one file. Everything was global. That was manageable for short scripts — buttons, alerts, forms.

But that approach doesn't scale to modern applications. As complexity grew, the language evolved.

##### The ES6 Breakthrough
ES6 (ECMAScript 2015) was a pivotal upgrade. It didn't replace JavaScript — it is JavaScript, just modernized.

ES6 added essential tools for building real applications:
- `let` and `const` for block-scoped variables
- Arrow functions for cleaner function syntax
- `async/await` for asynchronous flows
- And crucially: **modules**

##### Modules: JavaScript With Structure
Modules introduced file-level isolation and dependency management. Instead of dumping logic into a giant global namespace, you now split your logic into self-contained files:

- Each file has its own scope
- Dependencies are declared via `import` and `export`
- Only what's explicitly shared is exposed

This gave JavaScript the architectural spine that large systems require.

While modern browsers can run ES6 modules directly using `<script type="module">`, that's not how production systems like LNS actually deliver JavaScript. Instead, **Next.js handles bundling and optimization automatically**, using either Turbopack or Webpack depending on the version. These tools are built into the framework and compile your modular code into a fast, production-ready bundle. So while native module support helps form a mental model of how `import`/`export` works, you don't ship raw modules — **the framework abstracts that away under the hood**.

## 4. Data Payloads

A web page without content is just a shell. Data payloads provide the **actual information** that fills in the interface: chat messages, blog posts, search results, etc.

They can come from:
- APIs (fetched via `fetch()` or `XMLHttpRequest`)
- Server-rendered JSON blobs embedded in HTML
- Client-side storage (e.g. `localStorage` or cache)

Data is usually structured (e.g. JSON), and is injected into components via JavaScript.

> Data answers the question: **"What should this UI display?"**

## 5. Assets

Assets are **non-code resources** that the browser loads to render the page completely:
- Images (`<img>`)
- Fonts (`@font-face`, Google Fonts)
- Icons (`.svg`, `.ico`)
- Videos/audio
- PDFs, documents, downloadable files

They're not functional by themselves, but without them, a page looks incomplete or broken. A profile page with a missing avatar or broken font feels wrong, even if it works.

> Assets make the page **feel finished, branded, and visual**.

## 6. Runtime Bootstrapping

This is the part that connects the dots — where the browser initializes the app and prepares it to run as an interactive experience.

It includes:
- **Hydration** (React/Vue/etc.): binding static HTML to live components
- **Routing**: setting up the correct page state
- **App init logic**: configuring state, context, services
- **Code execution hooks**: `window.onload`, `DOMContentLoaded`, framework entry points

No matter how good your code is, if bootstrapping doesn't happen, the app doesn't run.

> Bootstrapping is the **ignition system** — it turns a rendered page into a live, interactive application.

## 🧠 Browser Rendering Mental Model

Once the browser has the six required categories — **HTML**, **CSS**, **JavaScript**, **data payloads**, **assets**, and **bootstrapping** — it uses **three core engines** to turn them into a live, visible, interactive application:

| **Engine**               | **Role**                            | **What It Powers**                                                       |
|--------------------------|-------------------------------------|---------------------------------------------------------------------------|
| 🖼 **Rendering Engine**    | *Appearance engine*                  | Parses **HTML**, **CSS** → builds layout and paints UI on screen         |
| ⚙️ **V8 Engine**           | *Behavior engine*                    | Executes **JavaScript**, processes **data**, runs **bootstrapping logic** |
| 📥 **Resource Loader**     | *Fetcher/asset manager*              | Loads external **assets** (images, fonts, videos, etc.)                   |

### 🧬 Summary

- 🖼 **Rendering Engine** = *"What you see"* → structure and styles  
- ⚙️ **V8 Engine** = *"What it does"* → behavior, data, control flow  
- 📥 **Resource Loader** = *"What it pulls in"* → static files and media

> Together, these engines transform your code and content into a living application — rendered, wired, and interactive.

## Summary

Together, these six are not just things the browser can use — they are the **minimum complete set** required to deliver a functional, styled, data-driven, interactive experience.

---

# 3. Next.js: Application Framework

🟢 **First Principle: The Browser Doesn't Care About Your Stack**

The browser only wants a payload:
- **HTML** — structure
- **CSS** — appearance  
- **JavaScript** — behavior
- **Data** — content
- **Assets** — images/fonts/media
- **Bootstrapping** — scripts to wire it together

It doesn't care how that payload was generated — just that it's valid and complete.

Everything else — Next.js, React, JSX, TypeScript, Tailwind, Chakra UI, LangChain — exists to help you generate that payload efficiently, correctly, and declaratively.

---

## 🔄 Author → Transform → Compile Pipeline

| Stage | Description |
|-------|-------------|
| **Author** | You write in `.tsx` using JSX, TypeScript, component trees |
| **Transform** | Next.js/SWC compiles JSX → React.createElement; TypeScript → JS |
| **Compile** | Next.js bundles JS/CSS/HTML, applies SSR/SSG/CSR, and emits payload |

---

## 🧱 Layer-by-Layer Breakdown

### 1. Next.js 13.5.4 (App Router) = **Node.js-Powered Request/Response Orchestrator**

- Runs on a **Node.js server**, launched with:
  - `npm run dev` or `yarn dev` → runs `next dev` (development)
  - `npm run start` or `yarn start` → runs `next start` (production)
- Both commands start the Next.js server from the `frontend/` directory, which loads your App Router application beginning with `frontend/app/layout.tsx` and `frontend/app/page.tsx`.
- Handles incoming **HTTP requests** from the browser.
- Matches request paths like `/`, `/chat`, or `/api/send` to files in the `app/` directory:
  - e.g. `app/page.tsx`, `app/api/send/route.ts`
- Uses **App Router** to determine **how to render** the response:
  - SSR (Server-Side Rendering) for dynamic content like your chat interface.
  - Static or dynamic API responses via handlers in the `app/api` folder.
- Gathers and assembles the output:
  - Server-rendered HTML from your React components.
  - Bundled JavaScript for hydration and interactivity.
  - CSS extracted from Tailwind, Chakra, and Emotion.
  - Any JSON or embedded data needed by the UI.
- Returns the complete **browser-ready payload**: HTML, CSS, JS, and data.

📁 **Entry Point Flow:**
1. **`layout.tsx`** defines the root HTML shell, global styles (`globals.css`), metadata, and `<body>` setup — including the dark theme and font.
2. **`page.tsx`** is injected as `{children}` into the layout, and sets up:
   - ChakraProvider for theme context
   - ToastContainer for notifications
   - `<ChatWindow conversationId={uuidv4()} />` — the main chat UI
3. **`ChatWindow.tsx`** holds the full interface logic: user input, model selection, message history, streaming, citations.

✅ **Think of Next.js as the Node.js-based brain that maps URL paths to files, renders the appropriate component tree starting at `layout.tsx`, and packages the output into an executable response for the browser.**

### 2. React Components + JSX = UI Blueprint
You write functions like:
```tsx
// frontend/app/page.tsx
export default function Home() {
  return (
    <ChakraProvider>
      <ToastContainer />
      <ChatWindow conversationId={uuidv4()} />
    </ChakraProvider>
  );
}
```

This is not HTML. It's JSX — a syntax that compiles to:
```js
React.createElement(ChakraProvider, null, 
  React.createElement(ToastContainer),
  React.createElement(ChatWindow, { conversationId: uuidv4() })
)
```

This creates the **Component Tree**: a nested structure of component definitions.

🧠 **The Component Tree is your declarative structure. Not DOM. Not HTML. Not even runtime JS yet.**

### 3. React 18.2.0 Engine = Virtual DOM + Concurrent Features
- Executes the component tree
- Builds a Virtual DOM (V-DOM): a memory-based tree of UI descriptions
- On state change:
  - Builds a new V-DOM
  - Diffs old vs. new  
  - Efficiently patches real DOM
- Uses concurrent rendering for better UX during LLM streaming

🔥 **This diffing model is what makes React reactive and performant. No manual DOM updates.**

### 4. TypeScript 5.1.6 = Developer Safety Net
- Provides static typing for props, state, functions
- Catches errors at compile time
- Completely removed during build — does not ship to the browser

🛡️ **It's your type guard, not part of the runtime.**

### 5. Tailwind CSS 3.3.3 = Utility-First Styling
```tsx
<div className="p-4 bg-gray-800 text-white">Hello</div>
```
- Each class corresponds to a CSS rule
- Compiled to a static stylesheet at build time
- Works alongside Chakra UI for rapid prototyping

📦 **Descriptive inline styling, no runtime logic required.**

### 6. Chakra UI 2.8.1 = Styled Component Primitives
```tsx
<Flex direction="column" p={4} bg="gray.800" color="white">
  <Heading>Chat Interface</Heading>
  <IconButton icon={<ArrowUpIcon />} />
</Flex>
```
- Chakra components translate props into class names or inline styles
- Uses Emotion 11.11.0 under the hood for CSS-in-JS
- Supports themes, tokens, and responsive props
- Provides accessible components out of the box

🎨 **You're composing UI with expressive, reusable building blocks.**

### 7. Enhanced User Experience Stack
- **React Toastify 9.1.3** — error notifications and feedback
- **Framer Motion 10.16.4** — smooth animations and transitions
- **Marked 7.0.2** — markdown parsing for LLM responses
- **Highlight.js 11.8.0** — code syntax highlighting
- **DOMPurify 3.0.8** — XSS protection for user content
- **React Textarea Autosize 8.5.3** — adaptive input fields

✨ **Each library handles one concern exceptionally well.**

---

## 🧾 What the Browser Gets

| File | Source |
|------|--------|
| `index.html` | From React → rendered by Next.js App Router |
| `styles.css` | From Tailwind + Chakra + Emotion output |
| `bundle.js` | Compiled JS from TypeScript + JSX + LangChain |
| `data.json` | LLM responses and chat state |
| `/public/*` | Static assets (favicon, images) |

✅ **The browser never sees your `.tsx`, your JSX, or your component tree. It only sees executable payloads.**

---

## 🧠 Frigg's Gate Component Architecture

```
page.tsx (Home)
├── ChakraProvider (UI theme context)
│   ├── ToastContainer (notifications)
│   └── ChatWindow (main app shell)
│       ├── LLM Selector (model switching)
│       ├── EmptyState (suggestion boxes)
│       ├── ChatMessageBubble[] (conversation history)
│       ├── SourceBubble (citations)
│       ├── AutoResizeTextarea (input)
│       └── InlineCitation (references)
```

**Key Data Flow:**
1. User types → `ChatWindow` state
2. Submit → API call to Bifröst backend  
3. LLM response → streaming updates
4. Markdown parsing → rendered bubbles
5. Source extraction → citation bubbles

---

## 🧬 Final Abstractions

| Concept | You Write | What It Becomes |
|---------|-----------|-----------------|
| **JSX** | `<Flex>Hi</Flex>` | `React.createElement(...)` |
| **Component** | `function ChatWindow()` | A reusable rendering function |
| **Component Tree** | Nested JSX | React executes to build V-DOM |
| **V-DOM** | Render result | Diffed + patched into real DOM |
| **Tailwind Class** | `p-4 bg-gray-800` | CSS rule in stylesheet |
| **Chakra Component** | `<Flex p={4} />` | Styled div with emotion CSS |
| **LangChain Call** | `await llm.invoke()` | HTTP request to provider API |
| **Hydrated Page** | HTML + script tags | Interactive chat interface |

---

## 🎯 Summary: You're Not Writing UI

You're not writing:
- HTML files
- CSS files  
- DOM manipulation logic
- API integration code

You're writing:
- Component functions
- Declarative JSX structures
- Type-safe business logic
- LLM conversation flows

And letting **Next.js + React + LangChain**:
- Compile
- Transform  
- Bundle
- Route
- Stream
- Hydrate

**The browser just wants HTML/CSS/JS — you're building an AI-powered engine that generates it declaratively.**

## 🔁 Next.js Framework Pipeline: Development vs. Production

| **Stage**     | **Development**                                                                                                                                           | **Production**                                                                                                                                                  |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1. Transform** | `.tsx` files (JSX + TypeScript) are transformed by SWC on-demand. JSX becomes `React.createElement`, types are stripped. Happens in-memory, per file save. | Same transformation logic. JSX and types are eliminated ahead of time during `next build`, not per request. Still handled by SWC.                              |
| **2. Bundle**    | Modules are dynamically bundled in memory using Webpack or Turbopack. Supports HMR, lazy loading, and incremental rebuilds. CSS is injected live into `<head>`. | All JS/CSS modules are statically bundled into optimized chunks. Dead code is pruned. Tailwind/Chakra/Emotion CSS is extracted and minified.                  |
| **3. Render**    | React components are rendered on the fly for each request. Fast Refresh updates only affected parts. HTML is generated in memory and served immediately. | HTML is generated by executing the component tree during SSR (on request) or SSG (at build). Output may be fully prebuilt or streamed.                         |
| **4. Compile**   | No files are written. All code and assets are kept in memory. The app is served live. "Compile" is a misnomer here — it just means "ready to serve."     | This is the asset emission phase. The framework writes `.html`, `.js`, `.css`, and optional `.json` to `.next/` — the actual browser payload.                 |
| **5. Route**     | The App Router dynamically loads updated components as you save them. No restarts needed. Every file change is picked up instantly.                     | Routes are pre-processed and statically analyzed. Middleware and dynamic segments are embedded into the output. Optimized for stability and scale.            |
| **6. Stream**    | Streaming may occur, but is often simplified or skipped for dev performance. You see full HTML rendered quickly, even if not streamed.                  | Streaming is fully active using React 18. HTML is progressively sent to the browser as parts of the tree resolve — enabling faster UX for LLMs, etc.          |
| **7. Hydrate**   | React hydrates the HTML once it hits the browser — wiring up interactivity. Dev tools are active, source maps are present, and logs are verbose.        | Hydration behaves the same, but with minified JS and no dev tools. Startup is faster, but introspection is limited.                                            |

---

# 4. Node.js Runtime Environment

**Node.js** is a JavaScript runtime built on Chrome's V8 engine, purpose-built for building fast, scalable network applications. For Frigg's Gate, it acts as the **server-side execution layer**, supporting real-time rendering and high-concurrency responsiveness. Created by Ryan Dahl in 2009 and supported early by Joyent, Node.js quickly gained traction for its event-driven, non-blocking I/O model.

Governance transitioned in 2015 to the **Node.js Foundation** under the Linux Foundation, bringing in major players like IBM, Microsoft, and PayPal. In 2019, it merged with the JS Foundation to form the **OpenJS Foundation**, now stewarding Node.js and other core JavaScript projects with backing from Google, Microsoft, Meta, and others.

Node.js extended JavaScript beyond the browser, enabling a unified full-stack development model. This eliminated the frontend-backend language split, paving the way for ecosystems like Next.js and platforms like Electron.

## Why Node.js

Node.js is designed for speed, efficiency, and responsiveness—traits that make it a natural fit for modern, real-time applications. Its architecture allows systems to remain lightweight while handling high volumes of concurrent activity with minimal delay or resource strain.

### Single-threaded Operations
Node.js runs on a single main thread, avoiding the complexity and overhead of managing multiple threads. This approach keeps memory usage low and reduces coordination challenges, enabling simpler, more predictable system behavior under load.

### Non-blocking I/O
Rather than waiting for slow tasks like file access or network requests to finish, Node.js moves on immediately and picks up the result later. This allows the system to stay responsive and continue handling new work while background operations complete.

### Event-driven Architecture
At the core of Node.js is an event loop that listens, reacts, and coordinates activity as it becomes ready. This model supports continuous, real-time flows—ideal for use cases that require many things happening at once without disrupting the overall responsiveness of the application.

---

## Functional Roles of Node.js

### 4.A. SSR & Static Rendering (Frigg's Gate Server Runtime)

🧱 **LNS Mapping:**  
Node.js powers the **entire SSR lifecycle of Frigg's Gate** — both in local development (`next dev`) and production deployments (whether on **Vercel**, **Docker**, or **self-hosted Node servers**). It is the **runtime environment executing Frigg's Gate's server logic**, enabling:

- Low-latency hydration  
- Streamed React rendering  
- Seamless bootstrapping of interactive UI

This holds true across all hosting models — Node.js is always the execution layer behind Frigg's Gate.

📊 *Consider a simple diagram mapping the Node.js rendering lifecycle:*
`Request → Node.js → React Server Renderer → HTML Stream → Browser Hydration`

🔧 **Technical Note:**  
This rendering environment is often referred to as a **"React server"**, but in practice, it runs **inside a Node.js process**. Node.js executes the React server renderer to generate HTML and prepare all six critical browser inputs — **HTML**, **CSS**, **JavaScript**, **data payloads**, **assets**, and **bootstrapping code** — packaging them into a complete, streamable web page.

🛠️ **Development vs. Production: JIT vs. Compiled Execution:**  
In a Next.js + Node.js architecture like Frigg's Gate, the system behaves fundamentally differently depending on whether it's in **development** or **production** mode. The distinction centers on whether code is executed **Just-In-Time (JIT)** or **compiled in advance**.

**Static Rendering (Not Used in LNS)**

❗ **Not Adopted in LNS**

Static rendering (or **Static Site Generation**, SSG) means HTML is built once at compile time — not on every request.

✅ **Best For:**  
- Blogs, docs, marketing pages  
- Static, non-personalized content  
- CDN delivery and caching

❌ **Not Suitable for LNS:**  
- LNS requires real-time, user-aware rendering  
- Markdown streaming and citation logic are dynamic  
- Prebuilt HTML would break hydration and data flow

## 4.B NPM (Node Package Manager)

### Node.js Package Ecosystem

**Note: This project uses Yarn instead of NPM**

NPM functions as the execution and lifecycle shell of the JavaScript layer in LNS. It's how Frigg's Gate is bootstrapped, scripted, and automated:

- `yarn create next-app`, `create-turbo` — project scaffolding (using Yarn)  
- `zod`, `lucide-react`, `framer-motion` — utility layers  
- `dotenv`, `openai`, `langchain` — integration glue  
- `"scripts"` in `package.json` — execution entrypoints

🧩 **Comparison: NPM vs. Poetry**

In this role, **NPM is functionally equivalent to [Poetry](https://python-poetry.org)** in Python. Both manage dependencies, project scaffolding, and lockfile discipline — but **NPM goes further**, acting as:

- A built-in script runner  
- A frontend-aware toolchain coordinator  
- A unified interface for JS/TS development lifecycle

*💡 Key Insight*

NPM isn't just a package manager — it's a **project orchestrator** and **runtime harness** for the entire JavaScript ecosystem.

🌐 Registry Model

NPM uses [npmjs.org](https://www.npmjs.com), the **largest module registry in any language**, hosting over **2 million packages** — making it the default distribution layer for full-stack JS.

📤 Publishing in LNS

LNS can publish scoped internal packages like `@lns/insight-core` or `@lns/gatetester-bridge` to share logic across **Frigg's Gate**, **GateTester**, and **Bifröst** — all without exposing code publicly.

📈 Semver Discipline

NPM adheres to **Semantic Versioning (Semver)** — a universal versioning standard that lets developers express exactly what kind of change a package introduces. Each version has a three-part format: `MAJOR.MINOR.PATCH`, and NPM uses version prefixes to control how packages are updated:

- `^1.2.3` — allows upgrades to newer minor and patch versions (e.g. `1.3.0`, `1.2.9`)  
- `~1.2.3` — allows patch upgrades only (e.g. `1.2.4`, but not `1.3.0`)  
- `1.2.3` — strict pinning to that exact version

✅ This gives **tight control over dependency updates**, ensuring predictability and minimizing the risk of pulling in unintended changes or breaking behavior during LNS deployments.

💡 **Why does this exist?**  
Semver was created by developers who got tired of versioning chaos — when a "minor" update broke everything or two libraries silently became incompatible. These "versioning fanatics" formalized a spec at [semver.org](https://semver.org) to solve this at scale. It's now a cornerstone of safe package management, powering ecosystems like npm, pip, Cargo, and more. Their fanaticism pays off: **Semver lets software scale without turning into dependency hell.**

## 4.C HTTP & Networking

**Node.js provides the networking backbone that powers Frigg's Gate's server responses.**

In the **SSR** context, Node.js uses its low-level networking capabilities to serve fully rendered web pages to browsers. It listens for incoming requests and responds with HTML, CSS, JavaScript, and data payloads — all packaged into a complete, streamable web experience.

More broadly, Node can handle any network protocol or data format: JSON APIs, file uploads, WebSocket connections, or proxy forwarding. While **Frigg's Gate currently uses FastAPI** for backend orchestration, Node's networking layer is fully capable of serving structured API responses directly. The ability to handle raw requests and return dynamic responses makes Node a complete application server, not just a frontend renderer.

This networking foundation enables Node to act as both the **rendering engine** for Frigg's Gate and the **delivery mechanism** that gets content to users with minimal latency.

## 4.D File System & OS Access

**Node gives JS the power to manipulate the real world: file systems, directories, environments — all from a single runtime.**

Unlike browser-based JavaScript, Node provides direct access to the operating system through APIs like `fs`, `path`, and `os`. You can stream large files, create temporary directories, watch for file changes, and perform path-safe operations — all from within JavaScript.

In the context of the **NPM / Orchestration** category, this capability is critical. Every CLI tool, script runner, or bundler built on Node — like `next build`, `turbo`, or even `yarn` itself — uses file system access to read configs, resolve dependencies, and emit outputs.

While Frigg's Gate itself doesn't heavily depend on raw file reads or OS queries at runtime, this capability **underpins its entire build and deployment toolchain**, from local dev to production build artifacts. Without it, Node couldn't orchestrate projects or integrate into real infrastructure.

## 4.E Process & Execution Control

**This category is about Node.js interacting with the operating system to run _other programs_, manage _system-level tasks_, and control the overall runtime environment.**

### 🔧 What this means

Node.js isn't just for running JavaScript — it can also **instruct the OS to run other things**.

Examples include:
- Running a shell command like `git status` or `python script.py`
- Spawning a background task for processing
- Managing threads for parallel execution
- Reading environment variables or exit codes

Node provides built-in modules for this:
- `child_process`: spawn subprocesses (e.g. shell commands)
- `worker_threads`: run JS code in multiple threads
- `process`: inspect CLI args, env variables, exit status

### 🧠 Why this matters conceptually

This category **elevates Node from just a server runtime to a system-level orchestrator**.

With these tools, Node can:
- Act like a scripting language (comparable to Python or Bash)
- Automate workflows and pipelines
- Launch and manage other programs
- Coordinate system behavior from JavaScript

### 🧱 In Frigg's Gate / LNS

> **This category exists but is not directly used in LNS.**

Frigg's Gate **does not use Node to spawn processes or manage threads**. 

❌ *Not used in LNS directly, as cross-runtime orchestration is handled by Python-based GateTester for tighter integration with ML flows and local system commands.*

However, many of the tools we rely on — like **Next.js**, **Turbopack**, and **Vercel CLI** — internally use these Node features to:
- Compile code
- Start servers
- Run local development pipelines

So this capability is part of the **infrastructure we inherit**, not infrastructure we directly build on.

## 4.F Real-Time & Event-Driven Systems

**This category is what transforms JavaScript from a browser scripting language into a full-stack runtime — by extending its event-driven architecture to the server.**

### 🔧 What this means

JavaScript was born as an event-driven language — handling clicks, timers, and UI updates in the browser.  
**Node.js takes that same architecture and applies it to the server**, enabling real-time, asynchronous, high-concurrency systems.

Core primitives include:

- **Event loop** – coordinates all asynchronous activity
- **EventEmitter** – publish/subscribe pattern for internal messaging
- **Streams** – chunked, non-blocking data processing (e.g. HTML, files, network)
- **WebSockets** – two-way persistent connections
- **Timers & async scheduling** – `setTimeout`, `setImmediate`, microtask queue

### 🧠 Why this matters conceptually

This is **the architectural layer that makes JavaScript full-stack**.

By reusing the same concurrency model (event loop + async callbacks) on both client and server, Node enables:

- **One mental model** for programming across the stack
- **Shared tools, libraries, and patterns** between frontend and backend
- **Real-time systems** (chat, dashboards, collaborative editing) without switching languages
- **Scalable concurrency without threads** — perfect for I/O-bound workloads

Put simply: this category is what lets JavaScript **leave the browser without abandoning its identity**.

### 🧱 In Frigg's Gate / LNS

> This capability is foundational to Frigg's Gate — but used **explicitly in the browser**, and **implicitly on the server**.

- On the **client**, event-driven logic is everywhere: React uses it for state, effects, interactions, and hydration.
- On the **server**, Frigg's Gate does **not directly use** `EventEmitter`, `WebSocket`, or manual stream coordination.  
  Instead, tools like **Next.js**, **React Server Components**, and **Vercel's runtime** are built on top of Node's event loop and stream architecture.

**So while LNS doesn't manually implement event-driven flows in Node**, it inherits them through the underlying platform — enabling:

- HTML streaming via React Server Components  
- Non-blocking request handling  
- Seamless server-to-client data flow

> This is how Frigg's Gate achieves real-time, interactive UI **without leaving JavaScript**, even if the backend never explicitly touches Node's event primitives.

---

# 5. Yarn Package Management

## 5.1 Yarn as the JavaScript Shell

While NPM is the default package manager for Node.js, **this project uses [Yarn](https://yarnpkg.com)** — a modern alternative developed by **Meta (Facebook)** in 2016. Yarn was created to address key shortcomings in NPM, including:

- Slow dependency resolution  
- Inconsistent lockfile behavior  
- Limited support for large-scale projects  
- Security concerns around automatic script execution

Yarn provides a more stable, performant, and predictable foundation for managing JavaScript project lifecycles.

### Example: Installing dependencies
```bash
yarn install
```
This installs all dependencies listed in `package.json`, using the strict version mapping defined in `yarn.lock`.

## 5.2 Why Yarn Is Popular

Yarn gained widespread adoption because of the following core strengths:

- **Deterministic installs** — guarantees everyone gets the exact same dependency tree.  
- **Parallelized dependency resolution** — significantly speeds up installs.  
- **Offline caching** — once a dependency is downloaded, it can be reused without internet.  
- **Workspaces support** — enables clean and scalable monorepo management.

### Example: Install with caching
```bash
yarn install --offline
```
This reuses cached packages for local development or CI pipelines without hitting the network.

## 5.3 Common Yarn Commands

Yarn is often used as the execution shell for JavaScript project automation. Some commonly used commands include:

- **Create a new project scaffold**
```bash
yarn create next-app
```
This initializes a new Next.js project with sensible defaults.

- **Run local development server**
```bash
yarn dev
```
Starts the dev server defined in your `package.json` scripts.

- **Run a custom script**
```bash
yarn lint
```
Executes the `lint` script defined in `package.json`, often used for code style checks.

- **Build the project**
```bash
yarn build
```
Compiles the app into optimized production output.

- **Run tests**
```bash
yarn test
```
Runs the test suite defined in your scripts.

- **Use a CLI tool without installing globally**
```bash
yarn dlx create-turbo
```
Runs one-off commands like scaffolding tools or linters without polluting global state.

## 5.4 Yarn vs. NPM

| Feature                    | Yarn                                      | NPM                                |
|---------------------------|-------------------------------------------|------------------------------------|
| Lockfile format           | `yarn.lock` (strict and reproducible)     | `package-lock.json` (less strict) |
| Monorepo support          | Built-in via Workspaces                   | Workspaces added later             |
| Speed                     | Fast with caching and parallel install    | Slower in large graphs             |
| Script runner             | Supports `"scripts"` in `package.json`    | Same                               |
| Registry                  | Uses [npmjs.org](https://www.npmjs.com)   | Uses [npmjs.org](https://www.npmjs.com) |

### Example: Workspaces in Yarn
```json
{
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```
This setup allows multiple related packages to be developed together in a monorepo with shared dependencies and scripts.

---

*This technical guide covers the fundamental technologies powering modern web applications. For conceptual understanding of how these pieces fit together in Frigg's Gate specifically, see `docs/mental-model.md`. For setup instructions, see `docs/installation-guide.md`.*