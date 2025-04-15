import { TRPCClientError } from "@trpc/client"
import { Heart } from "lucide-react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { Button } from "~/components/ui/button" // Make sure to import the Button component
import { getThemeColor } from "~/utils/get-theme-color"

interface FavouriteButtonProps {
    carParkId: string
    isFavourited: boolean
}

export const FavouriteButton = ({carParkId, isFavourited}: FavouriteButtonProps) => {
    const carParkContext = api.useUtils().carPark
    const userContext = api.useUtils().user;
    const {
        mutateAsync: setFavouriteMutationAsync
    } = api.carPark.setFavourite.useMutation()
    
    const handleChange = async () => {
        await toast.promise(
            setFavouriteMutationAsync({
                id: carParkId,
                isFavourited: !isFavourited
            }),
            {
                loading: "Please hold...",
                success: ()=>{
                    void carParkContext.invalidate()
                    void userContext.invalidate();
                    return "Carpark has been updated successfully!"
                },
                error: (error) => {
                    if (error instanceof TRPCClientError) {
                        return error.message;
                    }
                    return "Failed to favourite carpark";
                }
            }
        )
    }

    return (
        <Button 
            variant={isFavourited ? "destructive" : "default"}
            onClick={handleChange}
            className={`flex items-center gap-2 ${
                isFavourited 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-blue-500 dark:bg-gray-800 text-white dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-blue-600 dark:hover:bg-gray-700"
            }`}
        >
            <Heart
                size={18}
                fill={isFavourited ? "currentColor" : "none"}
                stroke="currentColor"
            />
            {isFavourited ? "Favourited" : "Favourite"}
        </Button>
    )
}