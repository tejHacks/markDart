

# markDart ✨

A **beautiful, modern Markdown editor** built with Next.js, TailwindCSS, and shadcn/ui.  
Write, preview, and manage your markdown files effortlessly — with themes, auto-save history, syntax highlighting, and more.


## 🌟 Features

- 🎨 **Themes** — Switch between Light, Dark, Monokai, Ocean, Forest, and Sunset.
- 📝 **Live Preview** — Side-by-side Markdown editor and rendered preview.
- 📁 **File Management** — Import `.md` files and download your work instantly.
- 🕒 **Auto-Save History** — Keeps the last 10 files, so you never lose your progress.
- ⌨️ **Keyboard Shortcuts**
  - **Ctrl + B** → Bold  
  - **Ctrl + I** → Italic  
  - **Ctrl + S** → Save & download file
- 💡 **Syntax Highlighting** for code blocks with `rehype-highlight`.
- ✅ **GitHub Flavored Markdown** (tables, task lists, strikethrough, etc.).


## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/tejHacks/markDartv1.git
cd markDartv1
````

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to use markDart.

---

## 📂 Project Structure

```
markdart/
├── app/
│   ├── layout.tsx      # Root layout & theme provider
│   ├── page.tsx        # Home page with editor
├── components/
│   ├── markdown-editor.tsx  # The main editor UI
│   ├── theme-provider.tsx   # Next-themes wrapper
│   └── ui/                  # shadcn/ui components
├── public/
│   └── favicon.ico     # App icon
├── styles/
│   └── globals.css     # Tailwind base styles
```

---

## ⚡ Tech Stack

* [Next.js 13+](https://nextjs.org/) (App Router)
* [React](https://react.dev/)
* [Tailwind CSS](https://tailwindcss.com/)
* [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind)
* [react-markdown](https://github.com/remarkjs/react-markdown)
* [remark-gfm](https://github.com/remarkjs/remark-gfm) (GitHub Flavored Markdown)
* [rehype-highlight](https://github.com/rehypejs/rehype-highlight) (Syntax highlighting)
* [lucide-react](https://lucide.dev/) (Icons)

---

## 🎮 Usage

1. Type your markdown on the **left editor**.
2. See the **live preview** on the right.
3. Import or export `.md` files from the toolbar.
4. Switch between **themes** anytime.
5. Your work auto-saves in history and persists with `localStorage`.

---

## 📌 Roadmap for future features

* [ ] Collaborative editing (real-time)
* [ ] Plugin system for markdown extensions
* [ ] Mobile app version
* [ ] Export to PDF/HTML
* [ ] Cloud sync

---

## 🤝 Contributing

Pull requests are welcome!
If you have ideas for features or improvements, feel free to open an issue.

---

## 📜 License

MIT License © 2025 \[Olateju Olamide]

****
