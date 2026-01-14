(function() {
  'use strict';

  // Configuration
  const ATTACHFLOW_API_URL = window.ATTACHFLOW_API_URL || 'https://attachflow.com/api';
  const ATTACHFLOW_SITE_KEY = window.ATTACHFLOW_SITE_KEY || '';

  // Widget styles
  const styles = `
    .attachflow-upload-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f3f4f6;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #374151;
      transition: all 0.2s;
      margin-top: 8px;
    }
    .attachflow-upload-button:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
    }
    .attachflow-upload-button svg {
      width: 20px;
      height: 20px;
    }
    .attachflow-file-list {
      margin-top: 12px;
    }
    .attachflow-file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .attachflow-file-name {
      color: #374151;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .attachflow-file-size {
      color: #6b7280;
      font-size: 12px;
      margin-left: 12px;
    }
    .attachflow-remove-file {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 4px;
      margin-left: 8px;
    }
    .attachflow-remove-file:hover {
      color: #dc2626;
    }
    .attachflow-upload-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: #3b82f6;
      border-radius: 0 0 6px 6px;
      transition: width 0.3s;
    }
    .attachflow-error {
      color: #ef4444;
      font-size: 14px;
      margin-top: 8px;
    }
  `;

  // Add styles to page
  function addStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Upload icon SVG
  const uploadIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>`;

  // Remove icon SVG
  const removeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
  </svg>`;

  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate unique ID
  function generateId() {
    return 'af_' + Math.random().toString(36).substr(2, 9);
  }

  // Upload file to AttachFlow
  async function uploadFile(file, formId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('siteKey', ATTACHFLOW_SITE_KEY);
    formData.append('formId', formId);

    try {
      const response = await fetch(`${ATTACHFLOW_API_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.fileId;
    } catch (error) {
      console.error('AttachFlow upload error:', error);
      throw error;
    }
  }

  // Create file upload UI
  function createFileUploadUI(form) {
    const container = document.createElement('div');
    container.className = 'attachflow-container';
    container.dataset.formId = generateId();
    
    const uploadButton = document.createElement('label');
    uploadButton.className = 'attachflow-upload-button';
    uploadButton.innerHTML = `${uploadIcon} <span>Upload files</span>`;
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    fileInput.accept = '*/*'; // Accept all file types
    
    const fileList = document.createElement('div');
    fileList.className = 'attachflow-file-list';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'attachflow-error';
    errorDiv.style.display = 'none';
    
    uploadButton.appendChild(fileInput);
    container.appendChild(uploadButton);
    container.appendChild(fileList);
    container.appendChild(errorDiv);
    
    // File upload handler
    const uploadedFiles = new Map();
    
    fileInput.addEventListener('change', async function(e) {
      errorDiv.style.display = 'none';
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        const fileId = generateId();
        const fileItem = document.createElement('div');
        fileItem.className = 'attachflow-file-item';
        fileItem.style.position = 'relative';
        fileItem.innerHTML = `
          <span class="attachflow-file-name">${file.name}</span>
          <span class="attachflow-file-size">${formatFileSize(file.size)}</span>
          <button class="attachflow-remove-file" data-file-id="${fileId}">${removeIcon}</button>
          <div class="attachflow-upload-progress" style="width: 0%"></div>
        `;
        
        fileList.appendChild(fileItem);
        
        try {
          // Upload file
          const uploadedFileId = await uploadFile(file, container.dataset.formId);
          uploadedFiles.set(fileId, {
            id: uploadedFileId,
            name: file.name,
            size: file.size
          });
          
          // Update progress bar
          const progressBar = fileItem.querySelector('.attachflow-upload-progress');
          progressBar.style.width = '100%';
          setTimeout(() => progressBar.style.display = 'none', 500);
        } catch (error) {
          errorDiv.textContent = `Failed to upload ${file.name}. Please try again.`;
          errorDiv.style.display = 'block';
          fileItem.remove();
        }
      }
      
      // Clear input for re-selection
      fileInput.value = '';
    });
    
    // Remove file handler
    fileList.addEventListener('click', function(e) {
      if (e.target.closest('.attachflow-remove-file')) {
        const button = e.target.closest('.attachflow-remove-file');
        const fileId = button.dataset.fileId;
        uploadedFiles.delete(fileId);
        button.closest('.attachflow-file-item').remove();
      }
    });
    
    // Intercept form submission
    form.addEventListener('submit', async function(e) {
      // Add hidden input with file data
      const fileData = Array.from(uploadedFiles.values());
      if (fileData.length > 0) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = '_attachflow_files';
        hiddenInput.value = JSON.stringify({
          siteKey: ATTACHFLOW_SITE_KEY,
          formId: container.dataset.formId,
          files: fileData
        });
        form.appendChild(hiddenInput);
      }
    });
    
    return container;
  }

  // Find and enhance all Webflow forms
  function enhanceForms() {
    // Look for Webflow forms
    const forms = document.querySelectorAll('form[data-name], form.wf-form, form[id*="email-form"], form[id*="wf-form"]');
    
    forms.forEach(form => {
      // Skip if already enhanced
      if (form.querySelector('.attachflow-container')) return;
      
      // Find submit button
      const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
      
      if (submitButton) {
        // Insert upload UI before submit button
        const uploadUI = createFileUploadUI(form);
        submitButton.parentNode.insertBefore(uploadUI, submitButton);
      } else {
        // Append at the end if no submit button found
        form.appendChild(createFileUploadUI(form));
      }
    });
  }

  // Initialize
  function init() {
    if (!ATTACHFLOW_SITE_KEY) {
      console.error('AttachFlow: Site key not found. Please set window.ATTACHFLOW_SITE_KEY before loading this script.');
      return;
    }

    addStyles();
    
    // Enhance forms on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', enhanceForms);
    } else {
      enhanceForms();
    }
    
    // Watch for dynamically added forms
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'FORM') {
              setTimeout(enhanceForms, 100);
            } else if (node.querySelector && node.querySelector('form')) {
              setTimeout(enhanceForms, 100);
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start
  init();
})();