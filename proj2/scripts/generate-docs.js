const fs = require('fs');
const path = require('path');
const glob = require('glob');

const config = require('../docs-config.json');

/**
 * Parse JSDoc comments from code
 */
function parseJSDoc(content) {
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  const matches = content.match(jsdocRegex) || [];
  
  return matches.map(match => {
    const lines = match.split('\n').map(line => 
      line.trim().replace(/^\*\s?/, '').replace(/^\/\*\*\s?/, '').replace(/\*\/$/, '')
    ).filter(line => line);
    
    const description = [];
    const params = [];
    const returns = [];
    const examples = [];
    let currentSection = 'description';
    
    lines.forEach(line => {
      if (line.startsWith('@param')) {
        currentSection = 'params';
        const paramMatch = line.match(/@param\s+\{([^}]+)\}\s+(\w+)\s+(.+)/);
        if (paramMatch) {
          params.push({
            type: paramMatch[1],
            name: paramMatch[2],
            description: paramMatch[3]
          });
        }
      } else if (line.startsWith('@returns') || line.startsWith('@return')) {
        currentSection = 'returns';
        const returnMatch = line.match(/@returns?\s+\{([^}]+)\}\s+(.+)/);
        if (returnMatch) {
          returns.push({
            type: returnMatch[1],
            description: returnMatch[2]
          });
        }
      } else if (line.startsWith('@example')) {
        currentSection = 'examples';
      } else if (currentSection === 'description' && line) {
        description.push(line);
      } else if (currentSection === 'examples' && line) {
        examples.push(line);
      }
    });
    
    return { description: description.join(' '), params, returns, examples };
  });
}

/**
 * Extract function information from code
 */
function extractFunctions(content, filePath) {
  const functions = [];
  
  // Match function declarations
  const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g;
  const arrowFuncRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
  
  let match;
  const allDocs = parseJSDoc(content);
  let docIndex = 0;
  
  // Regular functions
  while ((match = funcRegex.exec(content)) !== null) {
    const funcName = match[1];
    const doc = allDocs[docIndex++] || {};
    
    functions.push({
      name: funcName,
      file: filePath,
      type: 'function',
      ...doc
    });
  }
  
  // Arrow functions
  while ((match = arrowFuncRegex.exec(content)) !== null) {
    const funcName = match[1];
    const doc = allDocs[docIndex++] || {};
    
    functions.push({
      name: funcName,
      file: filePath,
      type: 'const',
      ...doc
    });
  }
  
  return functions;
}

/**
 * Extract React component information
 */
function extractComponents(content, filePath) {
  const components = [];
  const docs = parseJSDoc(content);
  
  // Match React components
  const componentRegex = /(?:export\s+default\s+)?(?:function|const)\s+(\w+)\s*(?:=\s*)?\([^)]*\)\s*(?:=>)?\s*{/g;
  
  let match;
  let docIndex = 0;
  
  while ((match = componentRegex.exec(content)) !== null) {
    const componentName = match[1];
    if (componentName[0] === componentName[0].toUpperCase()) {
      const doc = docs[docIndex++] || {};
      
      components.push({
        name: componentName,
        file: filePath,
        type: 'component',
        ...doc
      });
    }
  }
  
  return components;
}

/**
 * Process files and extract documentation
 */
function processFiles(section, sectionName) {
  const basePath = section.path;
  const allDocs = [];
  
  section.includes.forEach(pattern => {
    const files = glob.sync(path.join(basePath, pattern), {
      ignore: section.excludes.map(ex => path.join(basePath, ex))
    });
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(basePath, file);
      
      const functions = extractFunctions(content, relativePath);
      const components = extractComponents(content, relativePath);
      
      allDocs.push(...functions, ...components);
    });
  });
  
  return allDocs;
}

/**
 * Generate markdown documentation
 */
function generateMarkdown(docs, sectionName) {
  let markdown = `# ${sectionName.toUpperCase()} Documentation\n\n`;
  
  // Group by file
  const byFile = {};
  docs.forEach(doc => {
    if (!byFile[doc.file]) byFile[doc.file] = [];
    byFile[doc.file].push(doc);
  });
  
  Object.keys(byFile).sort().forEach(file => {
    markdown += `## ${file}\n\n`;
    
    byFile[file].forEach(item => {
      markdown += `### ${item.name}\n\n`;
      
      if (item.description) {
        markdown += `${item.description}\n\n`;
      }
      
      if (item.params && item.params.length > 0) {
        markdown += `**Parameters:**\n\n`;
        item.params.forEach(param => {
          markdown += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
        });
        markdown += '\n';
      }
      
      if (item.returns && item.returns.length > 0) {
        markdown += `**Returns:**\n\n`;
        item.returns.forEach(ret => {
          markdown += `- (${ret.type}): ${ret.description}\n`;
        });
        markdown += '\n';
      }
      
      if (item.examples && item.examples.length > 0) {
        markdown += `**Example:**\n\n\`\`\`javascript\n${item.examples.join('\n')}\n\`\`\`\n\n`;
      }
      
      markdown += '---\n\n';
    });
  });
  
  return markdown;
}

/**
 * Generate HTML documentation page
 */
function generateHTML(sections) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.projectName} - Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        
        .nav {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .nav h2 {
            margin-bottom: 1rem;
            color: #667eea;
        }
        
        .nav ul {
            list-style: none;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .nav a {
            color: #667eea;
            text-decoration: none;
            padding: 0.5rem 1rem;
            background: #f0f0f0;
            border-radius: 4px;
            transition: all 0.3s;
        }
        
        .nav a:hover {
            background: #667eea;
            color: white;
        }
        
        .section {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            color: #667eea;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #667eea;
        }
        
        .function {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .function h3 {
            color: #333;
            margin-bottom: 1rem;
        }
        
        .function .file-path {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .params, .returns {
            margin: 1rem 0;
        }
        
        .params h4, .returns h4 {
            color: #555;
            margin-bottom: 0.5rem;
        }
        
        .param-item {
            margin-left: 1rem;
            padding: 0.5rem;
            background: white;
            border-radius: 4px;
            margin-bottom: 0.5rem;
        }
        
        .param-name {
            font-weight: bold;
            color: #667eea;
        }
        
        .param-type {
            color: #888;
            font-style: italic;
        }
        
        code {
            background: #f0f0f0;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            margin: 1rem 0;
        }
        
        pre code {
            background: none;
            color: inherit;
        }
        
        .footer {
            text-align: center;
            padding: 2rem;
            color: #666;
            margin-top: 4rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${config.projectName}</h1>
        <p>${config.description}</p>
        <p>Version ${config.version}</p>
    </div>
    
    <div class="container">
        <div class="nav">
            <h2>Navigation</h2>
            <ul>
                ${Object.keys(sections).map(key => 
                    `<li><a href="#${key}">${key.toUpperCase()}</a></li>`
                ).join('')}
            </ul>
        </div>
        
        ${Object.entries(sections).map(([key, items]) => {
            const byFile = {};
            items.forEach(item => {
                if (!byFile[item.file]) byFile[item.file] = [];
                byFile[item.file].push(item);
            });
            
            return `
                <div class="section" id="${key}">
                    <h2>${key.toUpperCase()} Documentation</h2>
                    ${Object.entries(byFile).map(([file, fileItems]) => `
                        <h3 style="color: #555; margin-top: 2rem;">${file}</h3>
                        ${fileItems.map(item => `
                            <div class="function">
                                <h3>${item.name}</h3>
                                <div class="file-path">📄 ${file}</div>
                                ${item.description ? `<p>${item.description}</p>` : ''}
                                
                                ${item.params && item.params.length > 0 ? `
                                    <div class="params">
                                        <h4>Parameters:</h4>
                                        ${item.params.map(param => `
                                            <div class="param-item">
                                                <span class="param-name">${param.name}</span>
                                                <span class="param-type">(${param.type})</span>
                                                - ${param.description}
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                
                                ${item.returns && item.returns.length > 0 ? `
                                    <div class="returns">
                                        <h4>Returns:</h4>
                                        ${item.returns.map(ret => `
                                            <div class="param-item">
                                                <span class="param-type">(${ret.type})</span>
                                                ${ret.description}
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                
                                ${item.examples && item.examples.length > 0 ? `
                                    <h4>Example:</h4>
                                    <pre><code>${item.examples.join('\n')}</code></pre>
                                ` : ''}
                            </div>
                        `).join('')}
                    `).join('')}
                </div>
            `;
        }).join('')}
    </div>
    
    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p><a href="${config.repository}" style="color: #667eea;">View on GitHub</a></p>
    </div>
</body>
</html>`;
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Generating documentation...\n');
  
  const allSections = {};
  
  Object.entries(config.sections).forEach(([name, section]) => {
    console.log(`📝 Processing ${name}...`);
    const docs = processFiles(section, name);
    allSections[name] = docs;
    console.log(`   Found ${docs.length} documented items\n`);
  });
  
  // Create docs directory
  const docsDir = path.join(__dirname, '../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // Generate HTML
  console.log('📄 Generating HTML documentation...');
  const html = generateHTML(allSections);
  fs.writeFileSync(path.join(docsDir, 'index.html'), html);
  
  // Generate markdown for each section
  Object.entries(allSections).forEach(([name, docs]) => {
    const markdown = generateMarkdown(docs, name);
    fs.writeFileSync(path.join(docsDir, `${name}.md`), markdown);
  });
  
  console.log('\n✅ Documentation generated successfully!');
  console.log(`📁 Output directory: ${docsDir}`);
}

main();