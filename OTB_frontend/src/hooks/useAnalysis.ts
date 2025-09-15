import { useMutation } from "@tanstack/react-query";
import { getLocationTweets } from "../services/analyse";
import toast from "react-hot-toast";

export const useAnalysis = (topics: string, radius: number, location?: { lat: number, lng: number },) => {
  const analysisMutation = useMutation({
    mutationKey: ["analysis_tweets", location, topics, radius],
    mutationFn: () => getLocationTweets(radius, topics, location),
    onSuccess: (data) => {
      toast.success('Analysis completed successfully!')
      console.log('Analysis data:', data)
    },
    onError: (error: Error) => {
      toast.error(`Failed to load analysis: ${error.message}`)
      console.error('Analysis error:', error)
    }
  })

  const fetchAnalysisTweets = async () => {
    const response =  await analysisMutation.mutateAsync()
    console.log("response:::", response)
    return response
  }

  return {
    fetchAnalysisTweets,
    isLoading: analysisMutation.isPending,
  }
}