# 📊 Phixels.io - Content Management Dashboard

The Phixels.io Admin Dashboard is a specialized CMS platform designed for non-technical users to manage engineering content, hero sections, and SEO data with precision and ease. It simplifies the bridge between content creation and live deployment through an intuitive, visual interface.

- **Live Demo**: [phixels-admin-eta.vercel.app](https://phixels-admin-eta.vercel.app)

---

## 🚀 Key Features

### 🖋️ Advanced WYSIWYG Content Engine
- **Custom Tiptap Implementation**: A modern, inline rich text editor that provides a Google Docs-style experience for managing website content.
- **Dynamic Styling Controls**: 
    - **Brand Gradients**: One-click application of the brand's signature signature red/deep-red gradient.
    - **Custom Gradient Builder**: Full control over `from` and `to` colors for bespoke text gradients.
    - **Solid Color Selection**: A curated palette of brand colors alongside a flexible custom hex picker.
- **Robust Parsing & Rendering**: Specialized logic ensures that complex marks like gradients and custom colors are correctly serialized, stored, and re-rendered with 100% fidelity.

### ⚡ Operational Efficiency & Workflow
- **Direct Save Mechanism**: Designed for speed, allowing users to sync changes immediately to the database in a single transaction from within editor modals.
- **Grid-Based Color Interface**: A responsive, scaled grid system for color selection that ensures precision and a premium user experience.
- **Tab-Based Information Architecture**: Content is organized by logical page sections (Home, Services, Blog, etc.), making it easy to navigate and manage large-scale sites.

### 🖼️ Seamless Media Handling
- **Integrated Image Processing**: Simple drag-and-drop or selection interface with automatic backend syncing.
- **Layout Precision**: Native support for controlling image sizing, alignment, and fit (cover/contain) directly within the content stream.

---

## 🛠️ Technical Stack

- **Core**: React 18, TypeScript, Vite
- **Rich Text**: Tiptap SDK (StarterKit, Color, TextStyle, Link, Underline, TextAlign, etc.)
- **Styling**: Tailwind CSS
- **Data Visuals**: Recharts
- **Icons**: Lucide React
- **API Communication**: Axios

---

## ⚙️ How It Works

1.  **Secure Access**: Users authenticate via JWT-protected routes to access the management environment.
2.  **Data Synchronization**: The dashboard fetches RAW HTML content from the MongoDB backend, which is then parsed by the Tiptap engine for visual editing.
3.  **Real-Time Editing**: Users modify content visually; the application handles the underlying HTML transformation automatically.
4.  **Atomic Updates**: On save, the serialized content is sent via a single `PUT` request to ensure data integrity and instant live updates.

---

## 📦 Installation & Setup

```bash
# Clone and navigate
git clone https://github.com/mdalifkhandev/phixels-admin.git
cd phixels-admin

# Install dependencies
npm install

# Setup environment
# Refer to .env.example for required keys
npm run dev
```

---

*This project showcases my ability to design complex administrative interfaces and implement custom WYSIWYG editing solutions.*
