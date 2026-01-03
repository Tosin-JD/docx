
# Docx Editor
This is a simple project with vanilla js and the use of a small library for editing docx file on the browser.

It is intended for use by people who do not have a word processor but need to urgently edit a word document on their device.

In the project I have had to learn the following

1. Converting base64 to unzipped ooxml files
2. Parse the ooxml file by parsing the xml to html


### How to Setup   
To serve a standard HTML file in the current directory, you need a server that defaults to `index.html`.

Here is the properly filled-out "How to Setup" section with the correct commands for each environment:

---

### How to Setup

1. **Clone the repository** or download the source code to your local machine.
2. **Open your terminal** or command prompt and navigate to the project folder.
3. **Start a local server** using one of the following methods:

#### Method A: Python (Easiest for most)

If you have Python installed, run this command. It will serve the files on `http://localhost:8000`.

```bash
# For Python 3.x
python -m http.server 8000

```

```bash
# For Mac and Ubuntu vairants Python 3.x
python3 -m http.server 8000

```

#### Method B: Node.js (Using `serve` or `http-server`)

If you have Node.js installed, you can use a package to serve the directory.

```bash
# Option 1: Using 'npx' (no installation required)
npx serve .

# Option 2: If you have 'http-server' installed
npx http-server .

```

#### Method C: VS Code Live Server

1. Open the project folder in **VS Code**.
2. Right-click on `index.html` in the file explorer.
3. Select **"Open with Live Server"**. (Note: Requires the "Live Server" extension by Ritwick Dey).

---

### Why a server is required

When building a `.docx` editor with JavaScript, you are likely using **ES Modules** (`import`/`export`) or fetching files via the **Fetch API**. Browsers block these features when opening files via `file://` (just double-clicking the HTML file) due to **CORS (Cross-Origin Resource Sharing)** security policies. A local server allows the browser to treat your code as a secure web application.