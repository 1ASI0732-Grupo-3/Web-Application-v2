import React from 'react';
import { useVoiceCommand } from '../hooks/useVoiceCommand';

const VoiceCommandComponent: React.FC = () => {
    const {
        isListening,
        isProcessing,
        isSpeaking,
        error,
        startListening,
        stopListening,
        clearError
    } = useVoiceCommand();

    const handleToggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // Determinar el estado del botón
    const getButtonState = () => {
        if (isSpeaking) return 'speaking';
        if (isProcessing) return 'processing';
        if (isListening) return 'listening';
        return 'idle';
    };

    const buttonState = getButtonState();

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Voice Command Button */}
            <button
                onClick={handleToggleListening}
                disabled={isProcessing || isSpeaking}
                className={`
          relative h-16 w-16 rounded-full shadow-2xl border-4 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-opacity-50
          ${buttonState === 'listening'
                    ? 'bg-red-500 border-red-600 hover:bg-red-600 focus:ring-red-400 animate-pulse'
                    : buttonState === 'processing'
                        ? 'bg-yellow-500 border-yellow-600 focus:ring-yellow-400'
                        : buttonState === 'speaking'
                            ? 'bg-green-500 border-green-600 focus:ring-green-400 animate-pulse'
                            : 'bg-indigo-500 border-indigo-600 hover:bg-indigo-600 focus:ring-indigo-400'
                }
        `}
                title={
                    buttonState === 'listening' ? 'Detener grabación' :
                        buttonState === 'processing' ? 'Procesando...' :
                            buttonState === 'speaking' ? 'Hablando...' :
                                'Iniciar comando de voz'
                }
            >
                {buttonState === 'processing' ? (
                    <div className="animate-spin h-8 w-8 text-white mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                ) : buttonState === 'speaking' ? (
                    <div className="h-8 w-8 text-white mx-auto">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 11h3l2-2V7a1 1 0 011-1h6a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1v-2l-2-2H3a1 1 0 01-1-1v-2a1 1 0 011-1z"/>
                            <path d="M17.5 12c0-2.5-2-4.5-4.5-4.5v1c1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5v1c2.5 0 4.5-2 4.5-4.5z"/>
                            <path d="M19 12c0-3.9-3.1-7-7-7v1c3.3 0 6 2.7 6 6s-2.7 6-6 6v1c3.9 0 7-3.1 7-7z"/>
                        </svg>
                    </div>
                ) : buttonState === 'listening' ? (
                    <div className="h-8 w-8 text-white mx-auto">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                    </div>
                ) : (
                    <div className="h-8 w-8 text-white mx-auto">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                    </div>
                )}

                {/* Animation Ring for listening and speaking */}
                {(buttonState === 'listening' || buttonState === 'speaking') && (
                    <div className={`absolute inset-0 rounded-full border-4 animate-ping ${
                        buttonState === 'listening' ? 'border-red-400' : 'border-green-400'
                    }`}></div>
                )}
            </button>

            {/* Status Messages */}
            {(error || isListening || isProcessing || isSpeaking) && (
                <div className="absolute bottom-20 right-0 mb-2 min-w-64 max-w-80">
                    {/* Speaking Message */}
                    {isSpeaking && (
                        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg mb-2 animate-pulse">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                                <span className="text-sm font-medium">Vicky está respondiendo...</span>
                            </div>
                        </div>
                    )}

                    {/* Processing Message */}
                    {isProcessing && !isSpeaking && (
                        <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg mb-2 animate-pulse">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin h-4 w-4">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Procesando comando...</span>
                            </div>
                        </div>
                    )}

                    {/* Listening Message */}
                    {isListening && !isProcessing && !isSpeaking && (
                        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg mb-2">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Escuchando... Di "Vicky" seguido de tu comando</span>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && !isSpeaking && (
                        <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg mb-2">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex items-center space-x-2">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">{error}</span>
                                </div>
                                <button
                                    onClick={clearError}
                                    className="text-white hover:text-gray-200 ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Help Text */}
            {buttonState === 'idle' && !error && (
                <div className="absolute bottom-20 right-0 mb-2">
                    <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Presiona para activar comando de voz
                    </div>
                </div>
            )}

            {/* Keyboard Shortcut Listener */}
            <KeyboardShortcut onActivate={handleToggleListening} disabled={isProcessing || isSpeaking} />
        </div>
    );
};

// Keyboard shortcut component
const KeyboardShortcut: React.FC<{ onActivate: () => void; disabled: boolean }> = ({
                                                                                       onActivate,
                                                                                       disabled
                                                                                   }) => {
    React.useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Ctrl + Shift + V to activate voice command
            if (event.ctrlKey && event.shiftKey && event.key === 'V' && !disabled) {
                event.preventDefault();
                onActivate();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onActivate, disabled]);

    return null;
};

export default VoiceCommandComponent;