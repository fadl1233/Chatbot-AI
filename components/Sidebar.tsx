import React from 'react';
import { MessageSquarePlus, Settings, Cpu, Zap } from 'lucide-react';
import { ModelId } from '../types';
import { MODEL_LABELS } from '../constants';

interface SidebarProps {
  currentModel: ModelId;
  onModelChange: (model: ModelId) => void;
  onNewChat: () => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentModel, onModelChange, onNewChat, isOpen }) => {
  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}
    >
      <div className="h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center gap-2 px-2 py-4 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
             <span className="font-bold text-white">G</span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Gemini Chat
          </h1>
        </div>

        {/* New Chat Button */}
        <button 
          onClick={onNewChat}
          className="flex items-center gap-3 w-full px-4 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow-md font-medium mb-6"
        >
          <MessageSquarePlus size={20} />
          New Chat
        </button>

        {/* Model Selector */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            Model Selection
          </h3>
          <div className="space-y-1">
            {(Object.keys(MODEL_LABELS) as ModelId[]).map((modelId) => (
              <button
                key={modelId}
                onClick={() => onModelChange(modelId)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 border ${
                  currentModel === modelId 
                    ? 'bg-gray-800 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200 border-transparent'
                }`}
              >
                {modelId === ModelId.FLASH ? <Zap size={16} className="text-amber-400" /> : <Cpu size={16} className="text-purple-400" />}
                {MODEL_LABELS[modelId]}
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Footer Info */}
        <div className="px-2 py-4 border-t border-gray-800">
           <div className="flex items-center gap-2 text-gray-500 text-xs">
             <Settings size={14} />
             <span>v1.0.0 • React 18 + Gemini</span>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
