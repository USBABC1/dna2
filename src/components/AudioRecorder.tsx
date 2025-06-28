'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, StopCircle, Trash2, Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import AnalysisComponent from './AnalysisComponent'
import WaveSurfer from 'wavesurfer.js'

const AudioRecorder = () => {
  const { toast } = useToast()
  const [permission, setPermission] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const waveformRef = useRef<HTMLDivElement | null>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)


  useEffect(() => {
    getMicrophonePermission()
    
    // Inicializa o WaveSurfer
    if (waveformRef.current) {
        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: 'rgb(200, 200, 200)',
            progressColor: 'rgb(100, 100, 100)',
            height: 100,
            barWidth: 2,
            barGap: 1,
            responsive: true,
        });
    }

    return () => {
        wavesurfer.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (audioURL && wavesurfer.current) {
      wavesurfer.current.load(audioURL);
    }
  }, [audioURL]);


  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setPermission(true)
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Permissão Negada',
          description: 'Não foi possível acessar o microfone.',
        })
        console.error(err)
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Não suportado',
        description: 'Seu navegador não suporta a gravação de áudio.',
      })
    }
  }

  const startRecording = async () => {
    if (!permission) {
        await getMicrophonePermission();
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const newMediaRecorder = new MediaRecorder(stream);
    mediaRecorder.current = newMediaRecorder;
    mediaRecorder.current.start();

    setIsRecording(true);
    audioChunks.current = [];
    setAudioURL(null);
    setAudioBlob(null);
    setAnalysisResult(null);

    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    toast({
      title: 'Gravação iniciada',
      description: 'A gravação de áudio começou.',
    });
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
  
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        audioChunks.current = [];

        // Para a trilha de mídia para o microfone desligar
        mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
      };
  
      toast({
        title: 'Gravação finalizada',
        description: 'Sua gravação foi salva.',
      });
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return

    setIsLoading(true)
    setAnalysisResult(null);
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Falha na transcrição')
      }

      const data = await response.json()
      setAnalysisResult(data)
      toast({
        title: 'Sucesso!',
        description: 'O áudio foi analisado.',
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro de Análise',
        description:
          'Não foi possível analisar o áudio. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetRecording = () => {
    setAudioURL(null);
    setAudioBlob(null);
    setAnalysisResult(null);
    if (wavesurfer.current) {
        wavesurfer.current.empty();
    }
    toast({
        title: 'Gravação descartada',
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={!permission || isLoading}
              size="lg"
              className="rounded-full w-20 h-20 bg-green-500 hover:bg-green-600"
            >
              <Mic size={32} />
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              disabled={isLoading}
              size="lg"
              className="rounded-full w-20 h-20 bg-red-500 hover:bg-red-600 animate-pulse"
            >
              <StopCircle size={32} />
            </Button>
          )}
        </div>

        {audioURL && (
          <div className="w-full space-y-4">
            <div ref={waveformRef} className="w-full h-[100px] rounded-lg bg-gray-100 dark:bg-gray-700" />
            <div className="flex justify-center items-center space-x-4">
                <Button onClick={handleTranscribe} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Analisar Áudio
                </Button>
                <Button onClick={resetRecording} variant="destructive" disabled={isLoading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Descartar
                </Button>
            </div>
          </div>
        )}
      </div>

      {analysisResult && (
        <div className="mt-8">
            <AnalysisComponent analysis={analysisResult} />
        </div>
      )}
    </div>
  )
}

export default AudioRecorder
