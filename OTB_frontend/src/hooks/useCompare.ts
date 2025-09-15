import { useMutation } from "@tanstack/react-query"
import { getComparedRegions } from "../services/compare"
import toast from "react-hot-toast";


export const useCompare = () => {

  const compareRegionsMutation = useMutation({
    mutationKey: ["compareRegions"],
    mutationFn: ({ locations, radius, topic }: { locations: { lat: number, lon: number }[], radius: number, topic: string; }) => getComparedRegions({ locations, radius, topic }),
    onSuccess: (data) => {
      toast.success("Compare regions loaded successfully!")
      console.log("Comparing regions", data)
    },
    onError: (error) => {
      toast.error(`Failed to compare regions: ${error.message}`)
    }
  })


  const compareRegions = async ({ locations, radius, topic }: { locations: { lat: number, lon: number }[], radius: number, topic: string; }) => {
    const response = await compareRegionsMutation.mutateAsync({ locations, radius, topic })

    return response
  }

  return {
    compareRegions,
    isCompareLoading : compareRegionsMutation.isPending,
  }

}