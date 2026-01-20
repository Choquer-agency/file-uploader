(function() {
  'use strict';

  // Configuration
  const ATTACHFLOW_API_URL = window.ATTACHFLOW_API_URL || 'https://attachflow.com/api';
  const ATTACHFLOW_SITE_KEY = window.ATTACHFLOW_SITE_KEY || '';

  // Default styling
  const DEFAULT_BUTTON_COLOR = '#2563EB';
  const DEFAULT_TEXT_COLOR = '#FFFFFF';

  // Widget styles
  const styles = `
    .attachflow-container {
      margin: 8px 0;
    }
    .attachflow-upload-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .attachflow-upload-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .attachflow-upload-button svg {
      width: 18px;
      height: 18px;
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
      position: relative;
      overflow: hidden;
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
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .attachflow-remove-file:hover {
      color: #dc2626;
    }
    .attachflow-upload-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: #2563EB;
      border-radius: 0 0 6px 6px;
      transition: width 0.3s;
    }
    .attachflow-error {
      color: #ef4444;
      font-size: 14px;
      margin-top: 8px;
    }
  `;

  // Track if styles have been added
  let stylesAdded = false;

  // Add styles to page (only once)
  function addStyles() {
    if (stylesAdded) return;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    stylesAdded = true;
  }

  // Upload icon SVG
  const uploadIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>`;

  // Remove icon SVG
  const removeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
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
    // Development mode: simulate upload if no site key
    if (!ATTACHFLOW_SITE_KEY) {
      console.warn('[AttachFlow] No site key - simulating upload for development');
      return 'dev_' + generateId();
    }
    
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
      console.error('[AttachFlow] Upload error:', error);
      throw error;
    }
  }

  // Create file upload widget
  function createUploader(fieldName, config) {
    const container = document.createElement('div');
    container.className = 'attachflow-container';
    container.dataset.fieldName = fieldName;
    container.dataset.formId = generateId();
    
    // Create upload button with custom styling
    const uploadButton = document.createElement('label');
    uploadButton.className = 'attachflow-upload-button';
    uploadButton.style.backgroundColor = config.buttonColor;
    uploadButton.style.color = config.textColor;
    uploadButton.innerHTML = `${uploadIcon} <span>${config.label}</span>`;
    
    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = config.multiple;
    fileInput.style.display = 'none';
    fileInput.accept = config.accept;
    
    // File list container
    const fileList = document.createElement('div');
    fileList.className = 'attachflow-file-list';
    
    // Error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'attachflow-error';
    errorDiv.style.display = 'none';
    
    uploadButton.appendChild(fileInput);
    container.appendChild(uploadButton);
    container.appendChild(fileList);
    container.appendChild(errorDiv);
    
    // Store uploaded files on the container element
    container._uploadedFiles = new Map();
    
    // File upload handler
    fileInput.addEventListener('change', async function(e) {
      errorDiv.style.display = 'none';
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        const fileId = generateId();
        const fileItem = document.createElement('div');
        fileItem.className = 'attachflow-file-item';
        fileItem.innerHTML = `
          <span class="attachflow-file-name">${file.name}</span>
          <span class="attachflow-file-size">${formatFileSize(file.size)}</span>
          <button type="button" class="attachflow-remove-file" data-file-id="${fileId}">${removeIcon}</button>
          <div class="attachflow-upload-progress" style="width: 0%"></div>
        `;
        
        fileList.appendChild(fileItem);
        
        try {
          // Upload file
          const uploadedFileId = await uploadFile(file, container.dataset.formId);
          container._uploadedFiles.set(fileId, {
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
      const button = e.target.closest('.attachflow-remove-file');
      if (button) {
        const fileId = button.dataset.fileId;
        container._uploadedFiles.delete(fileId);
        button.closest('.attachflow-file-item').remove();
      }
    });
    
    return container;
  }

  // Track forms that have submit handlers attached
  const formsWithHandlers = new WeakSet();

  // Attach form submission handler (once per form)
  function attachFormHandler(form) {
    if (formsWithHandlers.has(form)) return;
    formsWithHandlers.add(form);
    
    form.addEventListener('submit', function(e) {
      // Find all uploaders in this form
      const uploaders = form.querySelectorAll('.attachflow-container');
      
      // Remove any existing hidden inputs from previous submissions
      form.querySelectorAll('input[name^="_attachflow_"]').forEach(input => input.remove());
      
      uploaders.forEach(container => {
        const fieldName = container.dataset.fieldName;
        const files = Array.from(container._uploadedFiles.values());
        
        if (files.length > 0) {
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = `_attachflow_${fieldName}`;
          hiddenInput.value = JSON.stringify({
            siteKey: ATTACHFLOW_SITE_KEY,
            formId: container.dataset.formId,
            files: files
          });
          form.appendChild(hiddenInput);
        }
      });
    });
  }

  // Initialize uploaders from elements with flow-upload="widget"
  // Supports both:
  //   <input flow-upload="widget" name="fieldName">
  //   <div flow-upload="widget" flow-name="fieldName">
  function initUploaders() {
    const elements = document.querySelectorAll('[flow-upload="widget"]');
    console.log(`[AttachFlow] Found ${elements.length} element(s) with flow-upload="widget"`);
    
    elements.forEach((element, index) => {
      // Skip if already processed
      if (element.dataset.attachflowProcessed) {
        console.log(`[AttachFlow] Element #${index + 1} already processed, skipping`);
        return;
      }
      element.dataset.attachflowProcessed = 'true';
      
      // Get field name with priority: flow-name > data-name > name
      const fieldName = element.getAttribute('flow-name') 
        || element.getAttribute('data-name') 
        || element.name 
        || element.getAttribute('name');
      if (!fieldName) {
        console.warn('[AttachFlow] Element missing flow-name, data-name, or name attribute, skipping:', element);
        return;
      }
      
      console.log(`[AttachFlow] Processing element #${index + 1}: "${fieldName}"`);
      
      // Read configuration from attributes
      const config = {
        buttonColor: element.getAttribute('flow-button-color') || DEFAULT_BUTTON_COLOR,
        textColor: element.getAttribute('flow-text-color') || DEFAULT_TEXT_COLOR,
        label: element.getAttribute('flow-label') || 'Upload files',
        accept: element.getAttribute('flow-accept') || '*/*',
        multiple: element.hasAttribute('multiple') || element.multiple !== false
      };
      
      // Create widget and replace element
      const widget = createUploader(fieldName, config);
      element.parentNode.replaceChild(widget, element);
      console.log(`[AttachFlow] Replaced element "${fieldName}" with upload widget`);
      
      // Find parent form and attach submit handler
      const form = widget.closest('form');
      if (form) {
        attachFormHandler(form);
      }
    });
  }

  // Initialize
  function init() {
    console.log('[AttachFlow] Initializing...');
    
    if (!ATTACHFLOW_SITE_KEY) {
      console.warn('[AttachFlow] Site key not set. File uploads will not work until you set window.ATTACHFLOW_SITE_KEY');
    }

    addStyles();
    
    // Initialize uploaders on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        console.log('[AttachFlow] DOM ready, initializing uploaders...');
        initUploaders();
      });
    } else {
      console.log('[AttachFlow] DOM already ready, initializing uploaders...');
      initUploaders();
    }
    
    // Watch for dynamically added elements with flow-upload="widget"
    const observer = new MutationObserver(function(mutations) {
      let shouldInit = false;
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.matches && node.matches('[flow-upload="widget"]')) {
              shouldInit = true;
            } else if (node.querySelector && node.querySelector('[flow-upload="widget"]')) {
              shouldInit = true;
            }
          }
        });
      });
      if (shouldInit) {
        console.log('[AttachFlow] New elements detected, reinitializing...');
        setTimeout(initUploaders, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Expose public API
  window.AttachFlow = {
    // Manually create an uploader
    create: function(selector, fieldName, options = {}) {
      const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!element) {
        console.error('AttachFlow: Element not found', selector);
        return null;
      }
      
      const config = {
        buttonColor: options.buttonColor || DEFAULT_BUTTON_COLOR,
        textColor: options.textColor || DEFAULT_TEXT_COLOR,
        label: options.label || 'Upload files',
        accept: options.accept || '*/*',
        multiple: options.multiple !== false
      };
      
      const widget = createUploader(fieldName, config);
      element.parentNode.replaceChild(widget, element);
      
      const form = widget.closest('form');
      if (form) {
        attachFormHandler(form);
      }
      
      return widget;
    },
    
    // Get files from an uploader by field name
    getFiles: function(fieldName) {
      const container = document.querySelector(`.attachflow-container[data-field-name="${fieldName}"]`);
      if (container && container._uploadedFiles) {
        return Array.from(container._uploadedFiles.values());
      }
      return [];
    },
    
    // Reinitialize (useful after dynamic content loads)
    refresh: function() {
      initUploaders();
    }
  };

  // Start
  init();
  console.log('[AttachFlow] Widget loaded successfully');
})();
