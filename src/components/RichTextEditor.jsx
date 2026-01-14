import { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = 'Nhập nội dung...' }) => {
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        const ops = [];
        const processNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            ops.push({ insert: node.textContent });
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const attrs = {};
            
            if (tagName === 'img') {
              const src = node.getAttribute('src');
              const alt = node.getAttribute('alt') || '';
              ops.push({ insert: { image: src }, attributes: { alt } });
            }
            else if (tagName === 'a') {
              const href = node.getAttribute('href');
              attrs.link = href;
            }
            else if (tagName === 'strong' || tagName === 'b') {
              attrs.bold = true;
            }
            else if (tagName === 'em' || tagName === 'i') {
              attrs.italic = true;
            }
            else if (tagName === 'u') {
              attrs.underline = true;
            }
            else if (tagName === 's') {
              attrs.strike = true;
            }
            else if (tagName === 'h1') {
              attrs.header = 1;
            }
            else if (tagName === 'h2') {
              attrs.header = 2;
            }
            else if (tagName === 'h3') {
              attrs.header = 3;
            }
            else if (tagName === 'blockquote') {
              attrs.blockquote = true;
            }
            else if (tagName === 'ul' || tagName === 'ol') {
              attrs.list = tagName === 'ul' ? 'bullet' : 'ordered';
            }
            
            Array.from(node.childNodes).forEach(child => {
              processNode(child);
            });
          }
        };
        
        processNode(node);
        return { ops };
      });
    }
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'],
      ['code-block']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'color', 'background',
    'align',
    'link', 'image', 'video',
    'code-block'
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderRadius: '8px'
        }}
      />
    </div>
  );
};

export default RichTextEditor;

