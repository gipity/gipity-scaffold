import { useState, useEffect, useRef } from 'react';
import { X, Copy, Trash2, Zap } from '@/lib/icons';

interface LogEntry {
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
  data?: any;
}

interface DebugConsoleProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function DebugConsole({ isOpen = false, onToggle }: DebugConsoleProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const actualIsOpen = onToggle ? isOpen : internalIsOpen;
  const actualToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Capture console logs
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    const addLog = (level: LogEntry['level'], message: string, data?: any) => {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      // Use setTimeout to batch state updates and prevent React warnings
      setTimeout(() => {
        setLogs(prev => [...prev, { timestamp, level, message, data }]);
      }, 0);
    };

    // Override console methods
    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('log', args.join(' '), args.length > 1 ? args : undefined);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args.join(' '), args.length > 1 ? args : undefined);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args.join(' '), args.length > 1 ? args : undefined);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addLog('info', args.join(' '), args.length > 1 ? args : undefined);
    };

    // Restore original console methods on cleanup
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
    };
  }, []);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const logText = logs.map(log => {
      let entry = `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`;
      if (log.data) {
        entry += '\n' + JSON.stringify(log.data, null, 2);
      }
      return entry;
    }).join('\n\n');
    navigator.clipboard.writeText(logText);
  };

  const expireToken = () => {
    // Replace valid token with invalid one to simulate expiration
    localStorage.setItem('app_token', 'EXPIRED_TOKEN');
    
    // Add flash message to console logs
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setTimeout(() => {
      setLogs(prev => [...prev, { 
        timestamp, 
        level: 'warn', 
        message: `🔧 Token silently expired - test navigation/actions to trigger logout` 
      }]);
    }, 0);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'warn': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'info': return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-50 dark:bg-red-900/20';
      case 'warn': return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20';
      default: return 'bg-gray-50 dark:bg-gray-800/50';
    }
  };

  return (
    <>
      {/* Debug Console Modal - Cross-platform centered with safe areas */}
      {actualIsOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)', 
            paddingRight: 'env(safe-area-inset-right)',
          }}
          onClick={actualToggle}
        >
          <div 
            className="w-full h-full flex items-center justify-center p-4"
            style={{
              minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
            }}
          >
            <div 
              className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[80%] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Debug Console ({logs.length} logs)
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={expireToken}
                    className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-orange-900/20 rounded-md transition-colors"
                    title="Expire current token to test 401 authentication handling"
                  >
                    <Zap size={18} />
                  </button>
                  <button
                    onClick={copyLogs}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="Copy all logs"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={clearLogs}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Clear logs"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => actualToggle()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
                    title="Close debug console"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Logs Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2" ref={logContainerRef}>
                {logs.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No logs yet. Console output will appear here.
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md text-sm font-mono ${getLevelBg(log.level)}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                          {log.timestamp}
                        </span>
                        <span className={`text-xs px-1 py-0.5 rounded font-sans uppercase ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                        <div className="flex-1">
                          <div className="break-words">{log.message}</div>
                          {log.data && (
                            <pre className="mt-1 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}