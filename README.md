# 📊 Phixels.io - Content Management Dashboard

The Phixels.io Admin Dashboard is a specialized CMS platform designed for non-technical users to manage engineering content, hero sections, and SEO data with precision and ease.

---

## 🎯 Purpose and Vision
The dashboard was engineered to eliminate the friction between content creation and deployment. By providing a custom-built, highly intuitive interface, it empowers marketing teams to update high-fidelity website sections—including complex formatting like gradients and custom colors—without requiring developer intervention or deployment cycles.

---

## 🚀 Key Features

### 🖋️ Custom Rich Text Architecture
- **Tiptap Integration**: A fully customized implementation of the Tiptap framework, tailored for high-performance visual editing.
- **Brand-Aware Styling**: 
    - **Custom Gradients**: Direct support for the brand's signature signature red/deep-red gradient.
    - **Flexible Color Selection**: Full control over solid colors and custom from/to gradient combinations.
- **Consistent Rendering**: The editor is configured to use CSS inheritance, ensuring that headings and bold text reflect the chosen colors accurately across both the dashboard and the live site.

### ⚡ Operational Efficiency
- **Direct Save Implementation**: Removed redundant confirmation steps to enable a streamlined "Edit -> Save -> Live" workflow.
- **Tab-Based Navigation**: Organized content management by pages (Home, Services, Blog, etc.) for intuitive information architecture.
- **Real-Time Data Table**: Clean overview of all page sections with instant access to edit/delete operations.

### 🖼️ Media Management
- **Intelligent Uploads**: Drag-and-drop or select images with automatic integration to the Rich Text flow.
- **Layout Control**: Fine-tune image sizing and fit directly within the editor.

---

## 🛠️ Technical Stack

- **Core**: React 18, TypeScript, Vite
- **Rich Text**: Tiptap SDK (StarterKit, Link, Underline, TextAlign, Placeholder, etc.)
- **Styling**: Tailwind CSS
- **Data Visuals**: Recharts
- **Icons**: Lucide React
- **API Communication**: Axios

---

## ⚙️ How It Works

1.  **Authentication**: Users login to a secure environment via JWT-protected routes.
2.  **State Synchronization**: When a section is opened, the dashboard fetches the RAW HTML content from the MongoDB backend.
3.  **Visual Editing**: The Tiptap instance parses the HTML, identifies custom marks (like gradients), and provides a visual interface for editing.
4.  **Transaction Handling**: On save, the application serializes the edited content and sends a `PUT` request to update the page structure in a single transaction.

---

## 📦 Installation & Setup

```bash
# Clone and navigate
git clone https://github.com/mdalifkhandev/phixels-admin.git
cd phixels-admin

# Install dependencies
npm install

# Run development server
npm run dev
```

---

*This project showcases my ability to design complex administrative interfaces and implement custom WYSIWYG editing solutions.*
