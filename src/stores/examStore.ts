import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { examApi, type ExamQuestionResponse, type ExamResultResponse } from '@/api/examApi'

export const useExamStore = defineStore('exam', () => {
  const examId = ref<number | null>(null)
  const currentQuestion = ref<ExamQuestionResponse | null>(null)
  const totalQuestions = ref<number>(0)
  const currentIndex = ref<number>(0)
  const questions = ref<ExamQuestionResponse[]>([])
  const answers = ref<Map<number, number>>(new Map())
  const result = ref<ExamResultResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isFinishing = ref(false)

  const progress = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round((answers.value.size / totalQuestions.value) * 100)
  })

  const isAllAnswered = computed(() => {
    return answers.value.size === totalQuestions.value
  })

  const hasNext = computed(() => {
    return currentIndex.value < totalQuestions.value - 1
  })

  function setExamId(id: number) {
    examId.value = id
  }

  async function createExam(title: string, quantity: number, subjectId?: number) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await examApi.create({ title, quantity, subjectId })
      
      examId.value = response.data.examId
      totalQuestions.value = response.data.totalQuestions
      currentIndex.value = 0
      questions.value = []
      answers.value = new Map()
      result.value = null
      isFinishing.value = false
      
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create exam'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadCurrentQuestion() {
    if (!examId.value) {
      console.error('No examId set')
      return
    }

    if (isFinishing.value) {
      console.log('Skipping loadCurrentQuestion - exam is finishing')
      return
    }

    isLoading.value = true
    try {
      const response = await examApi.getCurrentQuestion(examId.value)
      const data = response.data
      
      if (data.totalQuestions) {
        totalQuestions.value = data.totalQuestions
      }
      
      if (data.currentQuestionNumber) {
        currentIndex.value = data.currentQuestionNumber - 1
      }
      
      currentQuestion.value = data
      questions.value[currentIndex.value] = data
      
      if (data.isAnswered && data.selectedAlternativeId) {
        const questionNumber = data.currentQuestionNumber || currentIndex.value + 1
        answers.value.set(questionNumber, data.selectedAlternativeId)
      }
      
      console.log('Loaded question:', {
        currentIndex: currentIndex.value,
        totalQuestions: totalQuestions.value,
        isAnswered: data.isAnswered,
        currentQuestionNumber: data.currentQuestionNumber,
        answersSize: answers.value.size
      })
    } catch (err) {
      error.value = 'Failed to load question'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function answerQuestion(alternativeId: number) {
    if (!examId.value || !currentQuestion.value) return

    const questionNumber = currentQuestion.value.currentQuestionNumber || currentIndex.value + 1
    
    try {
      await examApi.answerQuestion(examId.value, alternativeId)
      
      answers.value.set(questionNumber, alternativeId)
      
      if (currentQuestion.value) {
        currentQuestion.value.isAnswered = true
        currentQuestion.value.selectedAlternativeId = alternativeId
      }
      
      if (questions.value[currentIndex.value]) {
        questions.value[currentIndex.value].isAnswered = true
        questions.value[currentIndex.value].selectedAlternativeId = alternativeId
      }
      
      console.log('Answer saved. Progress:', answers.value.size, '/', totalQuestions.value)
      
      if (answers.value.size === totalQuestions.value) {
        console.log('All questions answered! Not loading next question.')
        return
      }
      
      if (!isFinishing.value) {
        console.log('Loading next question...')
        await loadCurrentQuestion()
      }
    } catch (err) {
      error.value = 'Failed to answer question'
      throw err
    }
  }

  async function finishExam() {
    if (!examId.value) return

    isFinishing.value = true
    console.log('Finishing exam...')

    isLoading.value = true
    try {
      const response = await examApi.finishExam(examId.value)
      result.value = response.data
      console.log('Exam finished successfully!')
      return response.data
    } catch (err) {
      error.value = 'Failed to finish exam'
      throw err
    } finally {
      isLoading.value = false
      isFinishing.value = false
    }
  }

  function reset() {
    examId.value = null
    currentQuestion.value = null
    totalQuestions.value = 0
    currentIndex.value = 0
    questions.value = []
    answers.value = new Map()
    result.value = null
    error.value = null
    isFinishing.value = false
  }

  return {
    examId,
    currentQuestion,
    totalQuestions,
    currentIndex,
    questions,
    answers,
    result,
    isLoading,
    error,
    progress,
    isAllAnswered,
    hasNext,
    setExamId,
    createExam,
    loadCurrentQuestion,
    answerQuestion,
    finishExam,
    reset
  }
})