let selectedFile = null;
let conversationHistory = [];
let uploadedFiles = [];
let sessionId = 'session_' + Date.now();
let userIsScrolling = false;

// Auto-expand textarea
function autoExpandTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

// Smart scroll - only auto-scroll if user is at bottom
function smartScroll(element) {
    if (!element) return;
    
    // Check if user is near bottom (within 100px threshold)
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    
    // Only auto-scroll if user is at/near bottom or not manually scrolling
    if (isNearBottom || !userIsScrolling) {
        element.scrollTop = element.scrollHeight;
    }
}

// Initialize textarea auto-expand on load
document.addEventListener('DOMContentLoaded', () => {
    // Move form to centered position initially
    moveFormToCentered();
    
    // Initialize icons
    lucide.createIcons();
    
    const promptInput = document.getElementById('prompt');
    if (promptInput) {
        promptInput.addEventListener('input', function() {
            autoExpandTextarea(this);
        });
    }
    
    // Track user scroll behavior
    const chatArea = document.getElementById('chatArea');
    if (chatArea) {
        chatArea.addEventListener('scroll', () => {
            const isAtBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight < 100;
            userIsScrolling = !isAtBottom;
        });
    }
    
    // Close file type menu when clicking outside
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('fileTypeMenu');
        const fileTypeButton = document.querySelector('[onclick*="toggleFileTypeMenu"]');
        
        // Don't close if clicking the toggle button or inside the menu
        if (menu && !menu.classList.contains('hidden')) {
            const isClickInsideMenu = menu.contains(e.target);
            const isClickOnButton = fileTypeButton && fileTypeButton.contains(e.target);
            
            if (!isClickInsideMenu && !isClickOnButton) {
                menu.classList.add('hidden');
            }
        }
    });
});

function moveFormToCentered() {
    const centeredForm = document.getElementById('centeredForm');
    const bottomFormInner = document.querySelector('#bottomFormContainer .max-w-3xl');
    
    // Move all form elements from bottom to centered
    if (bottomFormInner) {
        while (bottomFormInner.firstChild) {
            centeredForm.appendChild(bottomFormInner.firstChild);
        }
    }
}

function moveFormToBottom() {
    const form = document.getElementById('uploadForm');
    const uploadPreview = document.getElementById('uploadPreview');
    const centeredForm = document.getElementById('centeredForm');
    const bottomFormContainer = document.getElementById('bottomFormContainer');
    const bottomFormInner = bottomFormContainer.querySelector('.max-w-3xl');
    
    // Move all elements from centered to bottom
    while (centeredForm.firstChild) {
        bottomFormInner.appendChild(centeredForm.firstChild);
    }
    
    // Hide empty state, show chat area and bottom form
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('chatArea').classList.remove('hidden');
    document.getElementById('chatArea').classList.add('flex-1', 'overflow-y-auto');
    document.getElementById('bottomFormContainer').classList.remove('hidden');
}

function toggleFileTypeMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    const menu = document.getElementById('fileTypeMenu');
    menu.classList.toggle('hidden');
    lucide.createIcons();
}

function selectFileType(type) {
    const fileInput = document.getElementById('file');
    const menu = document.getElementById('fileTypeMenu');
    
    // Set accept attribute based on type
    const acceptTypes = {
        'image': 'image/*',
        'audio': 'audio/*',
        'document': 'application/pdf,.txt,.doc,.docx,.csv,.json,.xml,.html'
    };
    
    fileInput.accept = acceptTypes[type];
    
    // Hide menu
    menu.classList.add('hidden');
    
    // Trigger file input
    fileInput.click();
}

function setTemperature(value, button) {
    document.getElementById('temperature').value = value;
    
    document.querySelectorAll('.temperature-btn').forEach(btn => {
        btn.classList.remove('border-black', 'bg-black', 'text-white');
        btn.classList.add('border-gray-300');
        btn.querySelectorAll('.text-xs').forEach(text => {
            text.classList.remove('opacity-70');
            text.classList.add('text-gray-500');
        });
    });
    
    button.classList.remove('border-gray-300');
    button.classList.add('border-black', 'bg-black', 'text-white');
    button.querySelectorAll('.text-xs').forEach(text => {
        text.classList.remove('text-gray-500');
        text.classList.add('opacity-70');
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedFile = file;
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    
    document.getElementById('fileName').textContent = file.name;
    const fileSizeKB = file.size / 1024;
    const fileSizeText = fileSizeKB > 1024 
        ? `${(fileSizeKB / 1024).toFixed(1)} MB` 
        : `${fileSizeKB.toFixed(1)} KB`;
    document.getElementById('fileSize').textContent = fileSizeText;
    
    const previewImage = document.getElementById('previewImage');
    
    if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        previewImage.classList.add('hidden');
        const fileExt = file.name.split('.').pop().toUpperCase();
        const icon = isAudio ? 'music' : 'file-text';
        const bgColor = isAudio ? 'bg-purple-100 text-purple-700' : 'bg-gray-200';
        
        document.getElementById('fileName').innerHTML = `
            <div class="flex items-center gap-2">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
                <span>${file.name}</span>
                <span class="text-xs ${bgColor} px-2 py-1 rounded font-semibold">${fileExt}</span>
            </div>
        `;
    }
    
    document.getElementById('uploadPreview').classList.remove('hidden');
    document.getElementById('uploadPreview').classList.add('flex');
    lucide.createIcons();
    
    if (isAudio) {
        showAudioQuickActions();
    } else {
        hideAudioQuickActions();
    }
}

function removeFile() {
    selectedFile = null;
    document.getElementById('file').value = '';
    const preview = document.getElementById('uploadPreview');
    preview.style.display = 'none';
    preview.classList.add('hidden');
    preview.classList.remove('flex');
    hideAudioQuickActions();
}

function showAudioQuickActions() {
    const quickActions = document.getElementById('audioQuickActions');
    if (quickActions) {
        quickActions.classList.remove('hidden');
    }
}

function hideAudioQuickActions() {
    const quickActions = document.getElementById('audioQuickActions');
    if (quickActions) {
        quickActions.classList.add('hidden');
    }
}

function setAudioPrompt(prompt) {
    const promptInput = document.getElementById('prompt');
    promptInput.value = prompt;
    promptInput.focus();
}

function parseMarkdown(text) {
    text = parseMarkdownTables(text);
    
    text = text.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>');
    
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
    
    return text;
}

function parseMarkdownTables(text) {
    const lines = text.split('\n');
    let result = [];
    let inTable = false;
    let tableRows = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes('|')) {
            const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
            
            if (cells.every(cell => /^[-:]+$/.test(cell))) {
                continue;
            }
            
            if (!inTable) {
                inTable = true;
                tableRows = [];
            }
            
            tableRows.push(cells);
        } else {
            if (inTable && tableRows.length > 0) {
                result.push(convertToHTMLTable(tableRows));
                tableRows = [];
                inTable = false;
            }
            result.push(line);
        }
    }
    
    if (inTable && tableRows.length > 0) {
        result.push(convertToHTMLTable(tableRows));
    }
    
    return result.join('\n');
}

function convertToHTMLTable(rows) {
    if (rows.length === 0) return '';
    
    let html = '<table class="min-w-full border-collapse border border-gray-300 my-4">';
    
    html += '<thead class="bg-gray-100"><tr>';
    rows[0].forEach(cell => {
        const parsedCell = parseInlineMarkdown(cell);
        html += `<th class="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">${parsedCell}</th>`;
    });
    html += '</tr></thead>';
    
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

function parseInlineMarkdown(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
}

function addMessage(type, content, fileUrl = null, fileInfo = null) {
    const chatArea = document.getElementById('chatArea');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-slide py-6 ${type === 'user' ? 'bg-white' : 'bg-gray-50'}`;

    if (type === 'user') {
        let filePreview = '';
        if (fileUrl && fileInfo) {
            if (fileInfo.type.startsWith('image/')) {
                filePreview = `<img src="${fileUrl}" class="max-w-xs rounded-lg mt-2 border border-gray-300" alt="Uploaded">`;
            } else {
                const fileExt = fileInfo.name.split('.').pop().toUpperCase();
                const isAudio = fileInfo.type.startsWith('audio/');
                const icon = isAudio ? 'music' : 'file-text';
                const iconBg = isAudio ? 'bg-purple-500' : 'bg-gray-500';
                
                filePreview = `
                    <div class="mt-2 p-3 bg-white/20 rounded-lg border border-white/30 flex items-center gap-2">
                        <div class="${iconBg} p-2 rounded">
                            <i data-lucide="${icon}" class="w-4 h-4 text-white"></i>
                        </div>
                        <div class="flex-1 text-xs">
                            <div class="font-semibold">${fileInfo.name}</div>
                            <div class="opacity-70">${(fileInfo.size / 1024).toFixed(1)} KB • ${fileExt}</div>
                        </div>
                    </div>
                `;
            }
        }
        
        messageDiv.innerHTML = `
            <div class="max-w-3xl mx-auto px-4">
                <div class="flex gap-4 items-start justify-end">
                    <div class="flex-1 flex flex-col items-end">
                        <div class="bg-black text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-lg">
                            <div class="text-sm user-message-text">${content}</div>
                            ${filePreview}
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
    smartScroll(chatArea);
    lucide.createIcons();
}

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
    smartScroll(chatArea);
    lucide.createIcons();
}

function removeLoading() {
    const loading = document.getElementById('loadingMessage');
    if (loading) loading.remove();
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500 text-white' : 
                    type === 'info' ? 'bg-blue-500 text-white' : 
                    'bg-black text-white';
    alert.className = `fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg alert-slide flex items-center gap-2 z-50 ${bgColor}`;
    const icon = type === 'error' ? 'alert-circle' : type === 'info' ? 'info' : 'check-circle';
    alert.innerHTML = `
        <i data-lucide="${icon}" class="w-4 h-4"></i>
        <span class="text-sm">${message}</span>
    `;
    document.body.appendChild(alert);
    lucide.createIcons();

    setTimeout(() => {
        alert.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function copyText(button) {
    const messageContent = button.closest('.flex-1').querySelector('.text-sm');
    if (!messageContent) return;
    
    let text = '';
    
    const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        } else if (node.nodeName === 'BR') {
            text += '\n';
        } else if (node.nodeName === 'TABLE') {
            const rows = node.querySelectorAll('tr');
            rows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll('th, td');
                const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());
                text += cellTexts.join('\t') + '\n';
                
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

function clearChat() {
    const chatArea = document.getElementById('chatArea');
    chatArea.innerHTML = '';
    
    // Hide chat area and bottom form
    chatArea.classList.add('hidden');
    document.getElementById('bottomFormContainer').classList.add('hidden');
    
    // Show empty state
    document.getElementById('emptyState').classList.remove('hidden');
    
    // Move form back to centered
    moveFormToCentered();
    
    conversationHistory = [];
    uploadedFiles = [];
    sessionId = 'session_' + Date.now();
    removeFile();
    lucide.createIcons();
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const prompt = document.getElementById('prompt').value;
    const temperature = document.getElementById('temperature').value;
    const sendBtn = document.getElementById('sendBtn');
    const promptInput = document.getElementById('prompt');
    const fileToSend = selectedFile;

    sendBtn.disabled = true;
    promptInput.value = '';
    promptInput.style.height = 'auto'; // Reset textarea height
    
    // Reset scroll tracking for new message (auto-scroll to new response)
    userIsScrolling = false;
    
    // Switch layout to bottom BEFORE any chat area manipulation
    const chatArea = document.getElementById('chatArea');
    const isFirstMessage = chatArea.classList.contains('hidden');
    if (isFirstMessage) {
        moveFormToBottom();
    }

    try {
        if (fileToSend) {
            // Show user message FIRST with file preview
            const reader = new FileReader();
            reader.onload = (e) => {
                addMessage('user', prompt, e.target.result, {
                    name: fileToSend.name,
                    size: fileToSend.size,
                    type: fileToSend.type
                });
            };
            reader.readAsDataURL(fileToSend);
            
            // THEN upload file to Gemini
            showAlert('Uploading file to Gemini...', 'info');
            showLoading();
            
            const formData = new FormData();
            formData.append('file', fileToSend);
            formData.append('sessionId', sessionId);

            const uploadResponse = await fetch('/upload-file', {
                method: 'POST',
                body: formData
            });

            removeLoading();

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                throw new Error(error.error || 'File upload failed');
            }

            const uploadResult = await uploadResponse.json();
            uploadedFiles.push(uploadResult.file);
            
            showAlert(`File uploaded: ${uploadResult.file.displayName}`, 'success');
            
            removeFile();
        } else {
            addMessage('user', prompt);
        }

        conversationHistory.push({
            role: "user",
            parts: [{ text: prompt }]
        });

        showLoading();

        const fileUris = uploadedFiles.map(f => f.uri);
        
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt, 
                temperature,
                history: conversationHistory.slice(0, -1),
                fileUris: fileUris,
                sessionId: sessionId
            })
        });

        removeLoading();

        if (!response.ok) {
            const error = await response.text();
            addMessage('ai', `Error ${response.status}: ${error || 'Unknown error'}`);
            showAlert('Error generating response', 'error');
            conversationHistory.pop();
        } else {
            await handleStreamingResponse(response);
        }
    } catch (err) {
        removeLoading();
        addMessage('ai', `Error: ${err.message}`);
        showAlert(err.message, 'error');
        conversationHistory.pop();
    } finally {
        sendBtn.disabled = false;
    }
});

async function handleStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let streamingMessageId = null;

    try {
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    
                    if (data === '[DONE]') {
                        conversationHistory.push({
                            role: "model",
                            parts: [{ text: accumulatedText }]
                        });
                        showAlert('Response generated successfully!');
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        accumulatedText += parsed.text;

                        if (!streamingMessageId) {
                            streamingMessageId = addStreamingMessage('ai', accumulatedText);
                        } else {
                            updateStreamingMessage(streamingMessageId, accumulatedText);
                        }
                    } catch (e) {
                    }
                }
            }
        }
    } catch (error) {
        console.error('Streaming error:', error);
        throw error;
    }
}

function addStreamingMessage(type, content) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now();
    messageDiv.id = messageId;
    messageDiv.className = `message-slide py-6 bg-gray-50`;

    const parsedContent = parseMarkdown(content);
    messageDiv.innerHTML = `
        <div class="max-w-3xl mx-auto px-4">
            <div class="flex gap-4 items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <i data-lucide="bot" class="w-4 h-4 text-white"></i>
                </div>
                <div class="flex-1">
                    <div class="text-sm text-gray-900 prose prose-sm max-w-none streaming-content">${parsedContent}</div>
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

    chatArea.appendChild(messageDiv);
    smartScroll(chatArea);
    lucide.createIcons();
    
    return messageId;
}

function updateStreamingMessage(messageId, content) {
    const messageDiv = document.getElementById(messageId);
    if (!messageDiv) return;

    const contentDiv = messageDiv.querySelector('.streaming-content');
    if (contentDiv) {
        const parsedContent = parseMarkdown(content);
        contentDiv.innerHTML = parsedContent;
    }

    const chatArea = document.getElementById('chatArea');
    smartScroll(chatArea);
}

document.getElementById('prompt').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('uploadForm').dispatchEvent(new Event('submit'));
    }
});

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

lucide.createIcons();
