"use client"

import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, Palette, History, FileText, Moon, Sun, Trash2, Clock } from "lucide-react"

// Available themes
const THEMES = [
  { id: "light", name: "Light", icon: Sun },
  { id: "dark", name: "Dark", icon: Moon },
  { id: "monokai", name: "Monokai", icon: Palette },
  { id: "ocean", name: "Ocean Blue", icon: Palette },
  { id: "forest", name: "Forest Green", icon: Palette },
  { id: "sunset", name: "Sunset Purple", icon: Palette },
] as const

type Theme = (typeof THEMES)[number]["id"]

interface FileHistory {
  id: string
  name: string
  content: string
  timestamp: number
  size: number
}

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MD)
  const [theme, setTheme] = useState<Theme>("light")
  const [fileHistory, setFileHistory] = useState<FileHistory[]>([])
  const [currentFileName, setCurrentFileName] = useState<string>("untitled.md")
  const [isClient, setIsClient] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const editorRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setIsClient(true)

    // Load saved content
    const savedContent = localStorage.getItem("markdart-content")
    if (savedContent) {
      setMarkdown(savedContent)
    }

    // Load saved theme
    const savedTheme = localStorage.getItem("markdart-theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }

    // Load file history
    const savedHistory = localStorage.getItem("markdart-history")
    if (savedHistory) {
      try {
        setFileHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("Failed to parse file history:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("markdart-content", markdown)

      // Auto-save to history every 30 seconds if content changed
      const timer = setTimeout(() => {
        if (markdown.trim()) {
          saveToHistory(currentFileName, markdown)
        }
      }, 30000)

      return () => clearTimeout(timer)
    }
  }, [markdown, currentFileName, isClient])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("markdart-theme", theme)
    }
  }, [theme, isClient])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("markdart-history", JSON.stringify(fileHistory))
    }
  }, [fileHistory, isClient])

  const saveToHistory = (name: string, content: string) => {
    const newFile: FileHistory = {
      id: Date.now().toString(),
      name,
      content,
      timestamp: Date.now(),
      size: new Blob([content]).size,
    }

    setFileHistory((prev) => {
      const filtered = prev.filter((f) => f.name !== name)
      const updated = [newFile, ...filtered].slice(0, 10) // Keep last 10 files
      return updated
    })
  }

  const loadFromHistory = (file: FileHistory) => {
    setMarkdown(file.content)
    setCurrentFileName(file.name)
  }

  const deleteFromHistory = (id: string) => {
    setFileHistory((prev) => prev.filter((f) => f.id !== id))
  }

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = currentFileName
    a.click()
    URL.revokeObjectURL(url)

    // Save to history on download
    saveToHistory(currentFileName, markdown)
  }

  const importMarkdown = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = String(evt.target?.result)
      setMarkdown(content)
      setCurrentFileName(file.name)
      saveToHistory(file.name, content)
    }
    reader.readAsText(file)
  }

  // Helper to wrap selected text with syntax
  const wrapSelection = (before: string, after = before) => {
    const el = editorRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = markdown.slice(start, end) || "text"
    const newText = markdown.slice(0, start) + before + selected + after + markdown.slice(end)
    setMarkdown(newText)

    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault()
      downloadMarkdown()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault()
      wrapSelection("**", "**")
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault()
      wrapSelection("*", "*")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={`h-screen flex flex-col ${getThemeClasses(theme)}`}>
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">markDart</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              {currentFileName}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Palette className="h-4 w-4" />
                  Theme
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {THEMES.map((t) => {
                  const Icon = t.icon
                  return (
                    <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)} className="gap-2">
                      <Icon className="h-4 w-4" />
                      {t.name}
                      {theme === t.id && <Badge className="ml-auto">Active</Badge>}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* File History */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <History className="h-4 w-4" />
                  Recent
                  {fileHistory.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {fileHistory.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Recent Files</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {fileHistory.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">No recent files</div>
                ) : (
                  fileHistory.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadFromHistory(file)}
                        className="flex-1 justify-start gap-2 h-auto p-2"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            <span className="text-sm font-medium truncate max-w-[180px]">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(file.timestamp)}
                            <span>•</span>
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFromHistory(file.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Import */}
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,text/markdown"
              onChange={importMarkdown}
              className="hidden"
            />

            {/* Download */}
            <Button size="sm" onClick={downloadMarkdown} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="w-1/2 flex flex-col border-r">
          <div className="p-3 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Editor</h3>
              <div className="text-xs text-muted-foreground">{markdown.length} characters</div>
            </div>
          </div>
          <textarea
            ref={editorRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-4 outline-none resize-none font-mono text-sm leading-relaxed bg-transparent"
            placeholder="Start writing your markdown here..."
          />
        </div>

        {/* Preview */}
        <div className="w-1/2 flex flex-col">
          <div className="p-3 border-b bg-muted/30">
            <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <Card className="p-6 h-full">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Custom components to ensure proper styling
                    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                    em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-foreground mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-foreground">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-foreground">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground mb-1">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">
                          {children}
                        </code>
                      ) : (
                        <code className={className}>{children}</code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
                    ),
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function getThemeClasses(theme: Theme): string {
  switch (theme) {
    case "dark":
      return "dark bg-background text-foreground"
    case "monokai":
      return "dark bg-[#272822] text-[#f8f8f2]"
    case "ocean":
      return "dark bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-blue-50"
    case "forest":
      return "dark bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 text-green-50"
    case "sunset":
      return "dark bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 text-purple-50"
    default:
      return "bg-background text-foreground"
  }
}

// Sample markdown content
const SAMPLE_MD = `# Welcome to markDart ✨

**markDart** is a powerful, beautiful markdown editor built for modern writers and developers.

## ✨ Features

- 🎨 **Beautiful Themes** - Choose from carefully crafted color schemes
- 📁 **File Management** - Import, export, and manage your markdown files
- 🕒 **Auto History** - Never lose your work with automatic file history
- ⚡ **Live Preview** - See your markdown rendered in real-time
- ⌨️ **Keyboard Shortcuts** - Work faster with built-in shortcuts

## 🚀 Getting Started

1. Start typing in the editor on the left
2. Watch your content come to life in the preview
3. Use **Ctrl+B** for bold, **Ctrl+I** for italic
4. **Ctrl+S** to download your file

## 📝 Markdown Support

markDart supports all standard markdown features plus GitHub Flavored Markdown:

### Code Blocks

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}! Welcome to markDart.\`;
}

console.log(greet("Developer"));
\`\`\`

### Python Example

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Themes | ✅ | 6 beautiful themes |
| History | ✅ | Auto-save & restore |
| Export | ✅ | Download as .md |
| Syntax Highlighting | ✅ | Multiple languages |
| Live Preview | ✅ | Real-time rendering |

### Task Lists

- [x] Build amazing markdown editor
- [x] Add beautiful themes
- [x] Implement file history
- [x] Add syntax highlighting
- [ ] Add collaborative editing
- [ ] Mobile app version
- [ ] Plugin system

### Blockquotes

> "The best way to predict the future is to create it."
> 
> — Peter Drucker

### Links and Images

Check out [GitHub](https://github.com) for more amazing projects!

### Mathematical Expressions

Simple inline math: E = mc²

### Lists

#### Ordered List
1. First item
2. Second item
   1. Nested item
   2. Another nested item
3. Third item

#### Unordered List
- Item one
- Item two
  - Nested bullet
  - Another nested bullet
- Item three

### Horizontal Rules

---

### Emphasis

*Italic text* and **bold text** and ***bold italic text***

You can also use _underscores_ for emphasis and __double underscores__ for strong emphasis.

### Strikethrough

~~This text is crossed out~~

---

**Happy writing with markDart!** 🎉

*Start editing this content or create your own masterpiece.*
`
