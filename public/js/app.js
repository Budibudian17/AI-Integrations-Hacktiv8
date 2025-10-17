// Global state
let selectedFile = null;

// File handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = `${(file.size / 1024).toFixed(1)} KB`;
        document.getElementById('uploadPreview').classList.remove('hidden');
        document.getElementById('uploadPreview').classList.add('flex');
        lucide.createIcons();
    };
    reader.readAsDataURL(file);
}

function removeFile() {
    selectedFile = null;
    document.getElementById('file').value = '';
    const preview = document.getElementById('uploadPreview');
    preview.style.display = 'none';
    preview.classList.add('hidden');
    preview.classList.remove('flex');
}

// Markdown parser
function parseMarkdown(text) {
    // Parse tables first
    text = parseMarkdownTables(text);
    
    // Parse headings
    text = text.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>');
    
    // Parse inline formatting
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
    
    return text;
}

// Parse markdown tables to HTML
function parseMarkdownTables(text) {
    const lines = text.split('\n');
    let result = [];
    let inTable = false;
    let tableRows = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if line is a table row (contains pipes)
        if (line.includes('|')) {
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
            
            // Skip separator rows (contains only dashes and pipes)
            if (cells.every(cell => /^[-:]+$/.test(cell))) {
                continue;
            }
            
            if (!inTable) {
                inTable = true;
                tableRows = [];
            }
            
            tableRows.push(cells);
        } else {
            // End of table
            if (inTable && tableRows.length > 0) {
                result.push(convertToHTMLTable(tableRows));
                tableRows = [];
                inTable = false;
            }
            result.push(line);
        }
    }
    
    // Handle table at end of text
    if (inTable && tableRows.length > 0) {
        result.push(convertToHTMLTable(tableRows));
    }
    
    return result.join('\n');
}

// Convert table rows to HTML table
function convertToHTMLTable(rows) {
    if (rows.length === 0) return '';
    
    let html = '<table class="min-w-full border-collapse border border-gray-300 my-4">';
    
    // First row as header
    html += '<thead class="bg-gray-100"><tr>';
    rows[0].forEach(cell => {
        const parsedCell = parseInlineMarkdown(cell);
        html += `<th class="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">${parsedCell}</th>`;
    });
    html += '</tr></thead>';
    
    // Rest as body
    if (rows.length > 1) {
        html += '<tbody>';
        for (let i = 1; i < rows.length; i++) {
            html += '<tr>';
            rows[i].forEach(cell => {
                const parsedCell = parseInlineMarkdown(cell);
                html += `<td class="border border-gray-300 px-3 py-2 text-sm">${parsedCell}</td>`;
            });
            html += '</tr>';
        }
        html += '</tbody>';
    }
    
    html += '</table>';
    return html;
}

// Parse inline markdown (for table cells)
function parseInlineMarkdown(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
}

// Message handling
function addMessage(type, content, imageUrl = null) {
    const chatArea = document.getElementById('chatArea');
    const emptyState = chatArea.querySelector('.flex.flex-col.items-center');
    if (emptyState && emptyState.parentElement === chatArea) {
        chatArea.innerHTML = '';
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-slide py-6 ${type === 'user' ? 'bg-white' : 'bg-gray-50'}`;

    if (type === 'user') {
        messageDiv.innerHTML = `
            <div class="max-w-3xl mx-auto px-4">
                <div class="flex gap-4 items-start justify-end">
                    <div class="flex-1 flex flex-col items-end">
                        <div class="bg-black text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-lg">
                            <div class="text-sm">${content}</div>
                            ${imageUrl ? `<img src="${imageUrl}" class="max-w-xs rounded-lg mt-2 border border-gray-300" alt="Uploaded">` : ''}
                        </div>
                    </div>
                    <div class="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <i data-lucide="user" class="w-4 h-4 text-white"></i>
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'ai') {
        const parsedContent = parseMarkdown(content);
        messageDiv.innerHTML = `
            <div class="max-w-3xl mx-auto px-4">
                <div class="flex gap-4 items-start">
                    <div class="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                        <i data-lucide="bot" class="w-4 h-4 text-white"></i>
                    </div>
                    <div class="flex-1">
                        <div class="text-sm text-gray-900 prose prose-sm max-w-none">${parsedContent}</div>
                        <div class="flex items-center gap-2 mt-3">
                            <button onclick="copyText(this)" class="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded text-xs transition-colors text-gray-600">
                                <i data-lucide="copy" class="w-3 h-3"></i>
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    lucide.createIcons();
}

// Loading state
function showLoading() {
    const chatArea = document.getElementById('chatArea');
    const emptyState = chatArea.querySelector('.flex.flex-col.items-center');
    if (emptyState && emptyState.parentElement === chatArea) {
        chatArea.innerHTML = '';
    }

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'py-6 bg-gray-50';
    loadingDiv.id = 'loadingMessage';
    loadingDiv.innerHTML = `
        <div class="max-w-3xl mx-auto px-4">
            <div class="flex gap-4 items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <i data-lucide="bot" class="w-4 h-4 text-white"></i>
                </div>
                <div class="flex-1">
                    <div class="loading flex gap-1 py-2">
                        <span class="w-2 h-2 bg-gray-600 rounded-full"></span>
                        <span class="w-2 h-2 bg-gray-600 rounded-full"></span>
                        <span class="w-2 h-2 bg-gray-600 rounded-full"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    chatArea.appendChild(loadingDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    lucide.createIcons();
}

function removeLoading() {
    const loading = document.getElementById('loadingMessage');
    if (loading) loading.remove();
}

// Alert/notification
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg alert-slide flex items-center gap-2 z-50 ${
        type === 'error' ? 'bg-red-500 text-white' : 'bg-black text-white'
    }`;
    alert.innerHTML = `
        <i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle'}" class="w-4 h-4"></i>
        <span class="text-sm">${message}</span>
    `;
    document.body.appendChild(alert);
    lucide.createIcons();

    setTimeout(() => {
        alert.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Copy text to clipboard
function copyText(button) {
    const messageContent = button.closest('.flex-1').querySelector('.text-sm');
    if (!messageContent) return;
    
    // Create a clean text version without HTML
    let text = '';
    
    // Process each child node
    const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeName === 'BR') {
            text += '\n';
        } else if (node.nodeName === 'TABLE') {
            // Convert table to plain text format
            const rows = node.querySelectorAll('tr');
            rows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll('th, td');
                const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());
                text += cellTexts.join('\t') + '\n';
                
                // Add separator after header row
                if (rowIndex === 0 && row.closest('thead')) {
                    text += cellTexts.map(() => '---').join('\t') + '\n';
                }
            });
        } else if (node.nodeName === 'H1' || node.nodeName === 'H2' || node.nodeName === 'H3') {
            text += '\n' + node.textContent + '\n';
        } else if (node.nodeName === 'STRONG') {
            text += '**' + node.textContent + '**';
        } else if (node.nodeName === 'EM') {
            text += '*' + node.textContent + '*';
        } else if (node.nodeName === 'CODE') {
            text += '`' + node.textContent + '`';
        } else {
            // Recursively process child nodes
            node.childNodes.forEach(child => processNode(child));
        }
    };
    
    messageContent.childNodes.forEach(node => processNode(node));
    
    if (text.trim()) {
        navigator.clipboard.writeText(text.trim()).then(() => {
            showAlert('Copied to clipboard!');
        });
    }
}

// Clear chat
function clearChat() {
    const chatArea = document.getElementById('chatArea');
    chatArea.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-gray-400 px-4">
            <i data-lucide="message-circle" class="w-16 h-16 mb-4 stroke-1"></i>
            <p class="text-lg">Ask anything or upload an image</p>
            <p class="text-sm mt-2">Image upload is optional</p>
        </div>
    `;
    removeFile();
    lucide.createIcons();
}

// Form submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const prompt = document.getElementById('prompt').value;
    const temperature = document.getElementById('temperature').value;
    const sendBtn = document.getElementById('sendBtn');
    const promptInput = document.getElementById('prompt');
    const fileToSend = selectedFile;

    sendBtn.disabled = true;
    promptInput.value = '';
    removeFile();

    try {
        let response;
        
        if (fileToSend) {
            await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    addMessage('user', prompt, e.target.result);
                    resolve();
                };
                reader.readAsDataURL(fileToSend);
            });

            showLoading();

            const formData = new FormData();
            formData.append('file', fileToSend);
            formData.append('prompt', prompt);
            formData.append('temperature', temperature);

            response = await fetch('/generate-multimodal', {
                method: 'POST',
                body: formData
            });
        } else {
            addMessage('user', prompt);
            showLoading();

            response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, temperature })
            });
        }

        removeLoading();

        if (!response.ok) {
            const error = await response.json();
            addMessage('ai', `Error ${response.status}: ${error.error || 'Unknown error'}`);
            showAlert('Error generating response', 'error');
        } else {
            const data = await response.json();
            addMessage('ai', data.result);
            showAlert('Response generated successfully!');
        }
    } catch (err) {
        removeLoading();
        addMessage('ai', `Network Error: ${err.message}`);
        showAlert('Failed to connect to server', 'error');
    } finally {
        sendBtn.disabled = false;
    }
});

// Enter key submit
document.getElementById('prompt').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('uploadForm').dispatchEvent(new Event('submit'));
    }
});

// Paste image from clipboard
document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            
            const blob = item.getAsFile();
            if (!blob) continue;

            const fileName = `pasted-image-${Date.now()}.png`;
            const file = new File([blob], fileName, { type: blob.type });
            
            selectedFile = file;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('previewImage').src = e.target.result;
                document.getElementById('fileName').textContent = fileName;
                document.getElementById('fileSize').textContent = `${(file.size / 1024).toFixed(1)} KB`;
                document.getElementById('uploadPreview').classList.remove('hidden');
                document.getElementById('uploadPreview').classList.add('flex');
                lucide.createIcons();
                
                showAlert('Image pasted successfully!');
            };
            reader.readAsDataURL(file);
            
            break;
        }
    }
});

// Initialize Lucide icons on page load
lucide.createIcons();
