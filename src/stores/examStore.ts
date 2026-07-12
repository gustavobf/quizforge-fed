import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { examApi } from '@/api/examApi'
import type { CreateExamResponse, ExamResultResponse, Question } from '@/types/exam.types'

export const useExamStore = defineStore('exam', () => {
  const examId = ref<number | null>(null)
  const examData = ref<CreateExamResponse | null>(null)
  const questions = ref<Question[]>([])
  const currentIndex = ref(0)
  const totalQuestions = ref(0)
  const answers = ref<Record<number, number[]>>({})
  const result = ref<ExamResultResponse | null>(null)
  const isLoading = ref(false)
  const answeredCount = ref(0)

  const currentQuestion = computed(() => {
    if (!questions.value.length) return null
    return questions.value[currentIndex.value] || null
  })

  const isCurrentQuestionAnswered = computed(() => {
    if (!currentQuestion.value) return false
    const questionId = currentQuestion.value.questionId
    const answer = answers.value[questionId]
    return answer && answer.length > 0
  })

  const currentAnswers = computed(() => {
    if (!currentQuestion.value) return []
    return answers.value[currentQuestion.value.questionId] || []
  })

  const isExamFinished = computed(() => !!result.value)
  const progress = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round((answeredCount.value / totalQuestions.value) * 100)
  })

  function reset() {
    examId.value = null
    examData.value = null
    questions.value = []
    currentIndex.value = 0
    totalQuestions.value = 0
    answers.value = {}
    result.value = null
    isLoading.value = false
    answeredCount.value = 0
    
    localStorage.removeItem('examData')
  }

  function setExamData(data: CreateExamResponse) {
    examData.value = data
    examId.value = data.examId
    questions.value = data.questions
    totalQuestions.value = data.totalQuestions
    
    const initialAnswers: Record<number, number[]> = {}
    data.questions.forEach(q => {
      initialAnswers[q.questionId] = []
    })
    answers.value = initialAnswers
    currentIndex.value = 0
    answeredCount.value = 0
    result.value = null 
    
    localStorage.setItem('examData', JSON.stringify(data))
  }

  function restoreFromLocalStorage(): boolean {
    const stored = localStorage.getItem('examData')
    if (stored) {
      try {
        const data = JSON.parse(stored) as CreateExamResponse
        setExamData(data)
        return true
      } catch (e) {
        console.error('Error restoring exam data:', e)
      }
    }
    return false
  }

  async function createExam(title: string, quantity: number, subjectId?: number) {
    isLoading.value = true
    try {
      const response = await examApi.createExam({ title, subjectId, quantity })
      const data = response.data
      setExamData(data)
      return data
    } catch (error) {
      console.error('Create exam error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function selectAnswer(alternativeIds: number[]) {
    if (!currentQuestion.value) return
    
    const questionId = currentQuestion.value.questionId
    console.log('Salvando resposta para questão:', questionId, alternativeIds)
    
    answers.value = {
      ...answers.value,
      [questionId]: [...alternativeIds]
    }
    
    let count = 0
    Object.values(answers.value).forEach(arr => {
      if (arr && arr.length > 0) count++
    })
    answeredCount.value = count
    
    console.log('Respostas atualizadas:', answers.value)
    console.log('Questões respondidas:', answeredCount.value)
  }

  function goToQuestion(index: number) {
    if (index >= 0 && index < totalQuestions.value) {
      currentIndex.value = index
    }
  }

  function nextQuestion() {
    if (currentIndex.value < totalQuestions.value - 1) {
      currentIndex.value++
    }
  }

  function previousQuestion() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  async function finishExam() {
    if (!examId.value) {
      throw new Error('No exam ID set')
    }

    console.log('Finalizando exame com respostas:', answers.value)
    
    const total = totalQuestions.value
    const answered = answeredCount.value
    
    if (answered < total) {
      console.warn(`Apenas ${answered} de ${total} questões respondidas`)
    }

    isLoading.value = true
    try {
      const response = await examApi.finishExam(examId.value, { answers: answers.value })
      result.value = response.data
      console.log('Resultado do exame:', result.value)
      return response.data
    } catch (error) {
      console.error('Finish exam error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    examId,
    examData,
    questions,
    currentIndex,
    totalQuestions,
    answers,
    result,
    isLoading,
    answeredCount,
    
    currentQuestion,
    isCurrentQuestionAnswered,
    currentAnswers,
    isExamFinished,
    progress,
    
    reset,
    setExamData,
    restoreFromLocalStorage,
    createExam,
    selectAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    finishExam
  }
})