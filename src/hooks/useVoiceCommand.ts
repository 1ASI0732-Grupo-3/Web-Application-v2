import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface VoiceCommandResponse {
    success: boolean;
    message: string;
    originalText: string;
    voiceCommandId: number;
    redirectUrl?: string;
    data?: {
        username: string;
        totalBovines: number;
        totalVaccinations: number;
        totalStables: number;
    };
}

interface UseVoiceCommandReturn {
    isListening: boolean;
    isProcessing: boolean;
    isSpeaking: boolean;
    error: string | null;
    lastResponse: VoiceCommandResponse | null;
    startListening: () => void;
    stopListening: () => void;
    clearError: () => void;
}

export const useVoiceCommand = (): UseVoiceCommandReturn => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResponse, setLastResponse] = useState<VoiceCommandResponse | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const navigate = useNavigate();

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Función para sintetizar voz usando Web Speech API
    const speakText = useCallback((text: string, isConfirmation: boolean = false) => {
        // Cancelar cualquier síntesis en curso
        window.speechSynthesis.cancel();

        if (!text) return;

        setIsSpeaking(true);

        const utterance = new SpeechSynthesisUtterance(text);

        // Esperar a que las voces estén disponibles
        const setVoiceAndSpeak = () => {
            const voices = window.speechSynthesis.getVoices();

            // Buscar voces femeninas en español con mayor prioridad
            const femaleVoice = voices.find(voice =>
                voice.lang.startsWith('es-') &&
                (voice.name.toLowerCase().includes('female') ||
                    voice.name.toLowerCase().includes('mujer') ||
                    voice.name.toLowerCase().includes('maria') ||
                    voice.name.toLowerCase().includes('carmen') ||
                    voice.name.toLowerCase().includes('sofia') ||
                    voice.name.toLowerCase().includes('elena') ||
                    voice.name.toLowerCase().includes('candela'))
            ) || voices.find(voice =>
                voice.lang.startsWith('es-') && !voice.name.toLowerCase().includes('male')
            ) || voices.find(voice => voice.lang.startsWith('es-'));

            if (femaleVoice) {
                utterance.voice = femaleVoice;
                console.log('Voz seleccionada:', femaleVoice.name, femaleVoice.lang);
            }
        };

        setVoiceAndSpeak();

        utterance.lang = 'es-ES';
        utterance.rate = 0.85;
        utterance.pitch = 1.2; // Pitch más alto para sonido más femenino
        utterance.volume = 0.9;

        utterance.onend = () => {
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
            
            if (isConfirmation) {
                setTimeout(() => {
                }, 200);
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            setIsSpeaking(false);
            speechSynthesisRef.current = null;
        };

        speechSynthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    const processAudioBlob = useCallback(async (audioBlob: Blob) => {
        try {
            setIsProcessing(true);
            setError(null);

            // Convert to WAV format
            const wavBlob = await convertToWav(audioBlob);

            // Create FormData
            const formData = new FormData();
            formData.append('audioFile', wavBlob, 'voice-command.wav');

            // Send to API
            const response = await api.post<VoiceCommandResponse>('/voice-command/process-audio', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = response.data;
            setLastResponse(result);

            if (result.success) {
                // Reproducir mensaje de respuesta con síntesis de voz
                speakText(result.message, true);

                // Handle navigation if redirect URL is provided
                if (result.redirectUrl) {
                    // Esperar un poco antes de navegar para permitir que se escuche la respuesta
                    setTimeout(() => {
                        const url = new URL(result.redirectUrl!);
                        const relativePath = url.pathname;
                        navigate(relativePath);
                    }, 2000);
                }
            } else {
                // Para errores, también usar síntesis de voz
                speakText(result.message);
                setError(result.message);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error procesando comando de voz';
            setError(errorMessage);
            speakText(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    }, [navigate, speakText]);

    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            audioChunksRef.current = [];
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                processAudioBlob(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start(100); // Collect data every 100ms
            setIsListening(true);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to start recording');
        }
    }, [processAudioBlob]);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    }, []);

    // Detener síntesis de voz cuando el componente se desmonte
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Auto-stop after 10 seconds
    useEffect(() => {
        if (isListening) {
            const timer = setTimeout(() => {
                stopListening();
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [isListening, stopListening]);

    // Asegurar que las voces estén cargadas
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                console.log('Voces disponibles:', voices.filter(v => v.lang.startsWith('es')));
            }
        };

        // Cargar voces inmediatamente
        loadVoices();

        // También escuchar el evento voiceschanged
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        };
    }, []);

    return {
        isListening,
        isProcessing,
        isSpeaking,
        error,
        lastResponse,
        startListening,
        stopListening,
        clearError
    };
};

// Helper function to convert audio to WAV format
const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // Convert to WAV
                const wavBuffer = audioBufferToWav(audioBuffer);
                const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
                resolve(wavBlob);
            } catch (error) {
                // If conversion fails, return original blob
                resolve(audioBlob);
            }
        };

        reader.readAsArrayBuffer(audioBlob);
    });
};

// Convert AudioBuffer to WAV format
const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }

    return arrayBuffer;
};