import ReactQuill from 'react-quill-new';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote'],
    ['hr'],
  ],
};

const formats = ['header', 'bold', 'italic', 'underline', 'list', 'blockquote', 'hr'];

/**
 * Render a configured rich-text editor backed by ReactQuill.
 *
 * Renders a controlled editor with a predefined toolbar and restricted formats.
 *
 * @param value - Current editor content (HTML string)
 * @param onChange - Callback invoked with the updated editor content
 * @param placeholder - Optional placeholder text shown when the editor is empty
 * @returns A React element rendering the rich-text editor
 */
export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      modules={modules}
      formats={formats}
    />
  );
}
