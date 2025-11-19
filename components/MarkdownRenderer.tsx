import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert prose-sm sm:prose-base max-w-none break-words">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const {children, className, node, ...rest} = props;
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <div className="rounded-md bg-gray-900 border border-gray-700 my-2 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 border-b border-gray-700">
                  <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <code {...rest} className={`${className} bg-transparent text-sm font-mono`}>
                    {children}
                  </code>
                </div>
              </div>
            ) : (
              <code {...rest} className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-300">
                {children}
              </code>
            );
          },
          a: ({ node, ...props }) => (
            <a {...props} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="mb-4 last:mb-0 leading-relaxed" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc list-outside ml-4 mb-4 space-y-1" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal list-outside ml-4 mb-4 space-y-1" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
