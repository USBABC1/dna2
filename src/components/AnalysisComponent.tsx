'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Tipagem para os dados da análise
interface AnalysisData {
  transcription: string
  sentiment: {
    label: string
    score: number
  }
  summary: string
  keywords: string[]
}

interface AnalysisComponentProps {
  analysis: AnalysisData | null
}

const AnalysisComponent: React.FC<AnalysisComponentProps> = ({ analysis }) => {
  if (!analysis) {
    return null
  }

  const { transcription, sentiment, summary, keywords } = analysis

  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'positive':
        return 'bg-green-500'
      case 'negative':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">{summary || "Nenhum resumo disponível."}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sentimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={`${getSentimentColor(sentiment.label)} text-white`}>
                {sentiment.label}
              </Badge>
              <span className="font-semibold text-lg">
                {(sentiment.score * 100).toFixed(2)}%
              </span>
            </div>
            <Progress value={sentiment.score * 100} className="w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Palavras-chave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywords && keywords.length > 0 ? (
                keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma palavra-chave encontrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transcrição Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {transcription || "Nenhuma transcrição disponível."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalysisComponent
